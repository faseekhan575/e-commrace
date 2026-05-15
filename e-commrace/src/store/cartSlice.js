import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/v5/cart");
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk("cart/add", async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/v5/cart/add", { productId, quantity });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateQuantity = createAsyncThunk("cart/updateQty", async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const res = await axios.patch("/api/v5/cart/quantity", { productId, quantity });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk("cart/remove", async (productId, { rejectWithValue }) => {
  try {
    const res = await axios.delete("/api/v5/cart/remove", { data: { productId } });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try {
    await axios.delete("/api/v5/cart/clear");
    return null;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateQuantity.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled, (state) => { state.items = []; });
  },
});

export default cartSlice.reducer;