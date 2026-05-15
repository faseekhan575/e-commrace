import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";

export const fetchProducts = createAsyncThunk("products/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 8, category = "", search = "" } = params;
    const query = new URLSearchParams({ page, limit, ...(category && { category }), ...(search && { search }) });
    const res = await axios.get(`/api/v3/product?${query}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchProduct = createAsyncThunk("products/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/api/v3/product/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
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

export const deleteProduct = createAsyncThunk("products/delete", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/v3/product/${id}/delete`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchCategories = createAsyncThunk("products/categories", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/v4/category");
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState: {
    list: [],
    current: null,
    categories: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.products;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createProduct.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; });
  },
});

export const { clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;