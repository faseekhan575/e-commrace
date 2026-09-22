import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, collectPages, errorMessage, listData } from "../services/api";

const task = (name, work) => createAsyncThunk(`products/${name}`, async (arg, context) => {
  try { return await work(arg, context); }
  catch (error) { return context.rejectWithValue(errorMessage(error)); }
});
const cleanParams = (params = {}) => Object.fromEntries(Object.entries(params).filter(([key, value]) => key !== "allPages" && value !== "" && value !== undefined && value !== null));

export const fetchProducts = task("fetchAll", async (params = {}, { signal }) => {
  const query = { page: 1, limit: 100, ...cleanParams(params) };
  return params.allPages ? collectPages(api.products.list, query, "products", signal) : api.products.list(query, signal);
});

export const fetchCatalog = task("fetchCatalog", (params = {}, { signal }) => collectPages(api.products.list, cleanParams(params), "products", signal));

export const fetchCatalogPage = task("fetchCatalogPage", async (params = {}, { signal }) => {
  const query = { page: 1, limit: 12, ...cleanParams(params) };
  const res = await api.products.list(query, signal);
  return {
    ...res,
    isFirstPage: Number(query.page) === 1,
  };
});

export const fetchHotProducts = task("fetchHot", (params) => api.products.hot(params));
export const fetchTopSelling = task("topSelling", (params) => api.products.topSelling(params));
export const fetchFabrics = task("fabrics", (_, { signal }) => api.products.fabrics(signal));
export const fetchProduct = task("fetchOne", (id, { signal }) => api.products.detail(id, signal));
export const createProduct = task("create", (data) => api.products.create(data));
export const updateProduct = task("update", ({ id, formData }) => api.products.update(id, formData));
export const quickUpdateStock = task("quickStock", ({ id, stock }) => api.products.stock(id, stock));
export const toggleHotFeatured = task("toggleHot", ({ id, isHot, isFeatured }) => api.products.update(id, { ...(isHot !== undefined && { isHot }), ...(isFeatured !== undefined && { isFeatured }) }));
export const toggleProductActive = task("toggleActive", ({ id, isActive }) => api.products.update(id, { isActive }));
export const deleteProduct = task("delete", async (id) => { await api.products.remove(id); return id; });
export const fetchAdminInventory = task("adminInventory", (params = {}, { signal }) => params.allPages ? collectPages(api.products.admin, cleanParams(params), "products", signal) : api.products.admin({ page: 1, limit: 20, ...cleanParams(params) }, signal));
export const fetchLowStockAlerts = task("lowStock", (threshold) => api.products.lowStock(threshold));
export const fetchCategories = task("categories", (_, { signal }) => api.categories.list(undefined, signal));
export const toggleHotCategory = task("toggleCategoryHot", ({ id }) => api.categories.toggleHot(id));

const patchProduct = (state, action) => {
  const product = action.payload?.product || action.payload;
  const id = product?._id || action.meta.arg?.id;
  for (const key of ["list", "catalog", "adminList", "hotList", "topSelling"]) {
    const index = state[key].findIndex((item) => (item._id || item.id) === id);
    if (index >= 0) state[key][index] = { ...state[key][index], ...product };
  }
  if (state.current?._id === id) state.current = { ...state.current, ...product };
};

const slice = createSlice({
  name: "products",
  initialState: {
    list: [], catalog: [], hotList: [], topSelling: [], current: null,
    categories: [], fabrics: [], lowStock: { outOfStock: [], lowStock: [] },
    total: 0, page: 1, totalPages: 1, loading: false, error: null,
    catalogLoading: true, catalogLoadingMore: false, catalogError: null, catalogTotal: 0,
    catalogPage: 1, catalogTotalPages: 1, catalogHasMore: false,
    categoriesLoading: false, categoriesError: null, fabricsError: null,
    currentLoading: false, currentError: null,
    adminList: [], adminTotal: 0, adminPage: 1, adminTotalPages: 1, adminLoading: false, adminError: null,
    filters: {},
  },
  reducers: {
    clearCurrentProduct: (state) => { state.current = null; state.currentError = null; },
    setCatalogFilters: (state, action) => { state.filters = action.payload; },
    clearCatalog: (state) => {
      state.catalog = [];
      state.catalogPage = 1;
      state.catalogTotalPages = 1;
      state.catalogHasMore = false;
      state.catalogLoading = true;
      state.catalogLoadingMore = false;
      state.catalogError = null;
    },
    setOptimisticHot: (state, action) => {
      patchProduct(state, { payload: action.payload, meta: { arg: action.payload } });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => { state.loading = true; state.error = null; state.listRequest = action.meta.requestId; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (state.listRequest !== action.meta.requestId) return;
        state.loading = false; state.list = listData(action.payload, "products");
        state.total = action.payload?.totalProducts ?? action.payload?.total ?? state.list.length;
        state.page = action.payload?.currentPage ?? 1; state.totalPages = action.payload?.totalPages ?? 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => { if (state.listRequest !== action.meta.requestId) return; state.loading = false; state.error = action.payload; })
      .addCase(fetchCatalog.pending, (state, action) => { state.catalogLoading = true; state.catalogError = null; state.catalogRequest = action.meta.requestId; })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        if (state.catalogRequest !== action.meta.requestId) return;
        state.catalogLoading = false; state.catalog = listData(action.payload, "products"); state.catalogTotal = state.catalog.length;
        state.catalogPage = 1; state.catalogTotalPages = 1; state.catalogHasMore = false;
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        if (state.catalogRequest !== action.meta.requestId) return;
        state.catalogLoading = false;
        if (!action.meta.aborted) { state.catalogError = action.payload; state.catalog = []; }
      })
      .addCase(fetchCatalogPage.pending, (state, action) => {
        const isFirstPage = Number(action.meta.arg?.page || 1) === 1;
        if (isFirstPage) {
          state.catalogLoading = true;
          state.catalogError = null;
        } else {
          state.catalogLoadingMore = true;
        }
        state.catalogRequest = action.meta.requestId;
      })
      .addCase(fetchCatalogPage.fulfilled, (state, action) => {
        if (state.catalogRequest !== action.meta.requestId) return;
        const isFirst = action.payload?.isFirstPage;
        const newProducts = listData(action.payload, "products");
        if (isFirst) {
          state.catalog = newProducts;
          state.catalogLoading = false;
        } else {
          const existingIds = new Set(state.catalog.map((p) => p._id || p.id));
          const filtered = newProducts.filter((p) => !existingIds.has(p._id || p.id));
          state.catalog = [...state.catalog, ...filtered];
          state.catalogLoadingMore = false;
        }
        state.catalogTotal = action.payload?.totalProducts ?? action.payload?.total ?? state.catalog.length;
        state.catalogPage = action.payload?.currentPage ?? action.payload?.page ?? 1;
        state.catalogTotalPages = action.payload?.totalPages ?? 1;
        state.catalogHasMore = action.payload?.hasMore ?? (state.catalogPage < state.catalogTotalPages);
      })
      .addCase(fetchCatalogPage.rejected, (state, action) => {
        if (state.catalogRequest !== action.meta.requestId) return;
        state.catalogLoading = false;
        state.catalogLoadingMore = false;
        if (!action.meta.aborted) { state.catalogError = action.payload; }
      })
      .addCase(fetchProduct.pending, (state, action) => { state.current = null; state.currentLoading = true; state.currentError = null; state.currentRequest = action.meta.requestId; })
      .addCase(fetchProduct.fulfilled, (state, action) => { if (state.currentRequest !== action.meta.requestId) return; state.currentLoading = false; state.current = action.payload?.product || action.payload; })
      .addCase(fetchProduct.rejected, (state, action) => { if (state.currentRequest !== action.meta.requestId) return; state.currentLoading = false; state.currentError = action.payload; })
      .addCase(fetchCategories.pending, (state, action) => { state.categoriesLoading = true; state.categoriesRequest = action.meta.requestId; state.categoriesError = null; })
      .addCase(fetchCategories.fulfilled, (state, action) => { if (state.categoriesRequest !== action.meta.requestId) return; state.categoriesLoading = false; state.categories = listData(action.payload, "categories"); })
      .addCase(fetchCategories.rejected, (state, action) => { if (state.categoriesRequest !== action.meta.requestId) return; state.categoriesLoading = false; state.categoriesError = action.payload; })
      .addCase(fetchFabrics.fulfilled, (state, action) => { state.fabrics = listData(action.payload, "fabrics").filter((fabric) => typeof fabric === "string" && !/^all( fabrics)?$/i.test(fabric)); state.fabricsError = null; })
      .addCase(fetchFabrics.rejected, (state, action) => { state.fabricsError = action.payload; })
      .addCase(fetchHotProducts.fulfilled, (state, action) => { state.hotList = listData(action.payload, "products"); })
      .addCase(fetchTopSelling.fulfilled, (state, action) => { state.topSelling = listData(action.payload, "products"); })
      .addCase(fetchAdminInventory.pending, (state, action) => { state.adminLoading = true; state.adminError = null; state.adminRequest = action.meta.requestId; })
      .addCase(fetchAdminInventory.fulfilled, (state, action) => {
        if (state.adminRequest !== action.meta.requestId) return;
        state.adminLoading = false; state.adminList = listData(action.payload, "products");
        state.adminTotal = action.payload?.totalProducts ?? action.payload?.total ?? state.adminList.length;
        state.adminPage = action.payload?.currentPage ?? action.payload?.page ?? 1; state.adminTotalPages = action.payload?.totalPages ?? 1;
      })
      .addCase(fetchAdminInventory.rejected, (state, action) => { if (state.adminRequest !== action.meta.requestId) return; state.adminLoading = false; state.adminError = action.payload; })
      .addCase(fetchLowStockAlerts.fulfilled, (state, action) => { state.lowStock = action.payload || { outOfStock: [], lowStock: [] }; })
      .addCase(toggleHotCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((category) => category._id === action.meta.arg.id);
        if (index >= 0) state.categories[index] = { ...state.categories[index], ...action.payload };
      })
      .addCase(createProduct.fulfilled, (state, action) => { state.adminList.unshift(action.payload); state.adminTotal++; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        for (const key of ["list", "catalog", "adminList", "hotList", "topSelling"]) state[key] = state[key].filter((item) => (item._id || item.id) !== action.payload);
        state.adminTotal = Math.max(0, state.adminTotal - 1);
        if (state.current?._id === action.payload) state.current = null;
      });
    for (const action of [updateProduct, quickUpdateStock, toggleHotFeatured, toggleProductActive]) builder.addCase(action.fulfilled, patchProduct);
  },
});

export const { clearCurrentProduct, setOptimisticHot, setCatalogFilters, clearCatalog } = slice.actions;
export default slice.reducer;
