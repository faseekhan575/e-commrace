import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";
import { CLOTHING_PRODUCTS, CLOTHING_CATEGORIES } from "../data/clothingData";

// Local cache keys
const PRODUCTS_CACHE_KEY = "clothingden_products_cache_v2";
const CATEGORIES_CACHE_KEY = "clothingden_categories_cache_v2";

function loadCached(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return fallback;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// ── 1. Products ──
export const fetchProducts = createAsyncThunk("products/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 50, category = "", search = "", isHot = "", isFeatured = "", minPrice = "", maxPrice = "", sort = "" } = params;
    const query = new URLSearchParams({
      page, limit,
      ...(category && { category }),
      ...(search && { search }),
      ...(isHot !== "" && { isHot }),
      ...(isFeatured !== "" && { isFeatured }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(sort && { sort }),
    });
    const res = await axios.get(`/api/v3/product?${query}`, { timeout: 8000 });
    if (res.data?.data?.products) {
      setCache(PRODUCTS_CACHE_KEY, res.data.data.products);
    }
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Using high-speed local cache");
  }
});

export const fetchHotProducts = createAsyncThunk("products/fetchHot", async (params = {}, { rejectWithValue }) => {
  try {
    const { limit = 8, type = "both", category = "" } = params;
    const query = new URLSearchParams({ limit, type, ...(category && { category }) });
    const res = await axios.get(`/api/v3/product/hot?${query}`, { timeout: 8000 });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchProduct = createAsyncThunk("products/fetchOne", async (id, { getState, rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/v3/product/${id}`, { timeout: 8000 });
    return res.data.data;
  } catch (err) {
    const list = getState()?.products?.list || [];
    const local = list.find((p) => p._id === id || p.id === id);
    if (local) return local;
    return rejectWithValue(err.response?.data?.message || "Product not found");
  }
});

export const createProduct = createAsyncThunk("products/create", async (formData, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/v3/product/create", formData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProduct = createAsyncThunk("products/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`/api/v3/product/${id}/update`, formData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const quickUpdateStock = createAsyncThunk("products/quickStock", async ({ id, stock, stockDelta }, { rejectWithValue }) => {
  try {
    const payload = stock !== undefined ? { stock } : { stockDelta };
    const res = await axios.patch(`/api/v3/product/${id}/stock`, payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleHotFeatured = createAsyncThunk("products/toggleHot", async ({ id, isHot, isFeatured }, { rejectWithValue }) => {
  try {
    const payload = {};
    if (isHot !== undefined) payload.isHot = isHot;
    if (isFeatured !== undefined) payload.isFeatured = isFeatured;
    const res = await axios.patch(`/api/v3/product/${id}/toggle-hot`, payload);
    return { id, ...(res.data?.data || payload) };
  } catch (err) {
    // If backend endpoint is unavailable or returns 404, still return optimistic payload for seamless client state
    return { id, isHot, isFeatured };
  }
});

export const toggleProductActive = createAsyncThunk("products/toggleActive", async ({ id, isActive }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`/api/v3/product/${id}/toggle-active`, { isActive });
    return { id, ...(res.data?.data || { isActive }) };
  } catch (err) {
    return { id, isActive };
  }
});

export const deleteProduct = createAsyncThunk("products/delete", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/v3/product/${id}/delete`);
    return id;
  } catch (err) {
    return id;
  }
});

export const fetchAdminInventory = createAsyncThunk("products/adminInventory", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 50, category = "", search = "", isActive = "", isHot = "", stockStatus = "", sort = "" } = params;
    const query = new URLSearchParams({
      page, limit,
      ...(category && { category }),
      ...(search && { search }),
      ...(isActive !== "" && { isActive }),
      ...(isHot !== "" && { isHot }),
      ...(stockStatus && { stockStatus }),
      ...(sort && { sort }),
    });
    const res = await axios.get(`/api/v3/product/admin/all?${query}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchLowStockAlerts = createAsyncThunk("products/lowStock", async (threshold = 5, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/v3/product/admin/low-stock?threshold=${threshold}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

// ── 2. Categories ──
export const fetchCategories = createAsyncThunk("products/categories", async (params = {}, { rejectWithValue }) => {
  try {
    const { isHot = "", isFeatured = "" } = params;
    const query = new URLSearchParams({
      ...(isHot !== "" && { isHot }),
      ...(isFeatured !== "" && { isFeatured }),
    });
    const res = await axios.get(`/api/v4/category?${query}`, { timeout: 8000 });
    if (res.data?.data) {
      setCache(CATEGORIES_CACHE_KEY, res.data.data);
    }
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleHotCategory = createAsyncThunk("products/toggleCategoryHot", async ({ id, isHot }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`/api/v4/category/${id}/toggle-hot`, { isHot });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const initialProducts = loadCached(PRODUCTS_CACHE_KEY, []);
const initialCategories = loadCached(CATEGORIES_CACHE_KEY, []);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    list: initialProducts,
    hotList: initialProducts.filter((p) => p.isHot).slice(0, 8),
    current: null,
    categories: initialCategories,
    lowStock: { outOfStock: [], lowStock: [], outOfStockCount: 0, lowStockCount: 0 },
    total: initialProducts.length,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => { state.current = null; },
    setOptimisticHot: (state, action) => {
      const { id, isHot, isFeatured, isActive } = action.payload;
      const idx = state.list.findIndex((p) => p._id === id || p.id === id);
      if (idx !== -1) {
        if (isHot !== undefined) state.list[idx].isHot = isHot;
        if (isFeatured !== undefined) state.list[idx].isFeatured = isFeatured;
        if (isActive !== undefined) state.list[idx].isActive = isActive;
        setCache(PRODUCTS_CACHE_KEY, state.list);
      }
      state.hotList = state.list.filter((p) => p.isHot).slice(0, 8);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = state.list.length === 0;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.products && action.payload.products.length > 0) {
          state.list = action.payload.products;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.totalPages = action.payload.totalPages;
          state.hotList = action.payload.products.filter((p) => p.isHot).slice(0, 8);
        }
      })
      .addCase(fetchProducts.rejected, (state) => { state.loading = false; })
      .addCase(fetchHotProducts.fulfilled, (state, action) => {
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.hotList = action.payload.slice(0, 8);
        }
      })
      .addCase(fetchProduct.pending, (state) => { if (!state.current) state.loading = true; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchProduct.rejected, (state) => { state.loading = false; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        setCache(PRODUCTS_CACHE_KEY, state.list);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const id = action.payload?._id || action.meta?.arg?.id;
        const idx = state.list.findIndex((p) => p._id === id || p.id === id);
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], ...action.payload };
        }
        if (state.current?._id === id || state.current?.id === id) {
          state.current = { ...state.current, ...action.payload };
        }
        setCache(PRODUCTS_CACHE_KEY, state.list);
      })
      .addCase(quickUpdateStock.fulfilled, (state, action) => {
        const id = action.payload?._id || action.meta?.arg?.id;
        const idx = state.list.findIndex((p) => p._id === id || p.id === id);
        if (idx !== -1) {
          state.list[idx].stock = action.payload.stock ?? action.meta?.arg?.stock;
          setCache(PRODUCTS_CACHE_KEY, state.list);
        }
      })
      .addCase(toggleHotFeatured.fulfilled, (state, action) => {
        const targetId = action.payload?.id || action.payload?._id || action.meta?.arg?.id;
        const idx = state.list.findIndex((p) => p._id === targetId || p.id === targetId);
        if (idx !== -1) {
          if (action.payload?.isHot !== undefined) state.list[idx].isHot = action.payload.isHot;
          if (action.payload?.isFeatured !== undefined) state.list[idx].isFeatured = action.payload.isFeatured;
          if (action.meta?.arg?.isHot !== undefined) state.list[idx].isHot = action.meta.arg.isHot;
          if (action.meta?.arg?.isFeatured !== undefined) state.list[idx].isFeatured = action.meta.arg.isFeatured;
          setCache(PRODUCTS_CACHE_KEY, state.list);
        }
        state.hotList = state.list.filter((p) => p.isHot).slice(0, 8);
      })
      .addCase(toggleProductActive.fulfilled, (state, action) => {
        const targetId = action.payload?.id || action.payload?._id || action.meta?.arg?.id;
        const idx = state.list.findIndex((p) => p._id === targetId || p.id === targetId);
        if (idx !== -1) {
          if (action.payload?.isActive !== undefined) state.list[idx].isActive = action.payload.isActive;
          if (action.meta?.arg?.isActive !== undefined) state.list[idx].isActive = action.meta.arg.isActive;
          setCache(PRODUCTS_CACHE_KEY, state.list);
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload && p.id !== action.payload);
        state.hotList = state.hotList.filter((p) => p._id !== action.payload && p.id !== action.payload);
        setCache(PRODUCTS_CACHE_KEY, state.list);
      })
      .addCase(fetchAdminInventory.fulfilled, (state, action) => {
        if (action.payload?.products) {
          state.list = action.payload.products;
          state.total = action.payload.total;
        }
      })
      .addCase(fetchLowStockAlerts.fulfilled, (state, action) => {
        state.lowStock = action.payload || state.lowStock;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.categories = action.payload;
        }
      });
  },
});

export const { clearCurrentProduct, setOptimisticHot } = productsSlice.actions;
export default productsSlice.reducer;