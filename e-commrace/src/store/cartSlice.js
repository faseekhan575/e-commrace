import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";
import { availableStock, cartItemId, errorMessage, productColors, productId, productPrice, productSizes } from "../utils/commerce";

let queue = Promise.resolve();
const serial = (operation) => {
  const result = queue.then(operation, operation);
  queue = result.catch(() => undefined);
  return result;
};
const signedIn = (getState) => Boolean(getState().auth?.isAuthenticated);
const guestItems = (getState) => getState().cart.items.filter((item) => item.guest);
const readCart = (response) => {
  const cart = response.data?.data?.cart || response.data?.data;
  if (!cart || !Array.isArray(cart.items)) throw new Error("The cart response was incomplete. Please refresh your bag.");
  return cart;
};
const currentCart = (getState) => ({ items: getState().cart.items });
const remainingGuests = (getState, cart) => ({ ...cart, items: [...cart.items, ...guestItems(getState)] });
const findItem = (getState, itemId) => getState().cart.items.find((item) => cartItemId(item) === String(itemId));

export const fetchCart = createAsyncThunk("cart/fetch", (_, { getState, rejectWithValue }) => serial(async () => {
  if (!signedIn(getState)) return currentCart(getState);
  try { return remainingGuests(getState, readCart(await axios.get("/api/v5/cart"))); }
  catch (error) { return rejectWithValue(errorMessage(error, "Unable to load your bag.")); }
}));

export const addToCart = createAsyncThunk("cart/add", (options, { getState, rejectWithValue }) => serial(async () => {
  try {
    const { product, quantity = 1, size = "", color = "" } = options;
    const id = options.productId || productId(product);
    if (!id || !product) throw new Error("Open the product page to check availability before adding this item.");
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Choose a valid quantity.");
    if (productSizes(product).length && !productSizes(product).includes(size)) throw new Error("Please select a size.");
    if (productColors(product).length && !productColors(product).includes(color)) throw new Error("Please select a color.");
    const existingQuantity = getState().cart.items.filter((item) => productId(item.product || item.productId) === String(id) && (item.size || "") === size).reduce((total, item) => total + item.quantity, 0);
    if (existingQuantity + quantity > availableStock(product, size)) throw new Error("The requested quantity is no longer available in this size.");
    if (signedIn(getState)) {
      return remainingGuests(getState, readCart(await axios.post("/api/v5/cart/add", { productId: id, quantity, size, color })));
    }
    if (product.price == null || !Number.isFinite(Number(product.price))) throw new Error("Pricing is unavailable. Please refresh this product.");
    const identity = `guest:${id}:${size}:${color}`;
    const existing = findItem(getState, identity);
    return { items: existing
      ? getState().cart.items.map((item) => cartItemId(item) === identity ? { ...item, quantity: item.quantity + quantity } : item)
      : [...getState().cart.items, { _id: identity, product, productId: id, size, color, quantity, price: productPrice(product), guest: true }] };
  } catch (error) { return rejectWithValue(errorMessage(error, "Unable to add this item.")); }
}));

export const updateQuantity = createAsyncThunk("cart/updateQty", ({ itemId, quantity }, { getState, rejectWithValue }) => serial(async () => {
  try {
    const item = findItem(getState, itemId);
    if (!item) throw new Error("This item is no longer in your bag.");
    if (!Number.isInteger(quantity) || quantity < 0) throw new Error("Choose a valid quantity.");
    const otherQuantity = getState().cart.items.filter((entry) => cartItemId(entry) !== String(itemId) && productId(entry.product || entry.productId) === productId(item.product || item.productId) && (entry.size || "") === (item.size || "")).reduce((sum, entry) => sum + entry.quantity, 0);
    if (quantity && quantity + otherQuantity > availableStock(item.product, item.size)) throw new Error("There is not enough stock for this quantity.");
    if (!signedIn(getState) || item.guest) return { items: getState().cart.items.flatMap((entry) => cartItemId(entry) !== String(itemId) ? [entry] : quantity ? [{ ...entry, quantity }] : []) };
    return remainingGuests(getState, readCart(await axios.patch("/api/v5/cart/quantity", { itemId, quantity })));
  } catch (error) { return rejectWithValue(errorMessage(error, "Unable to update this item.")); }
}));

export const removeFromCart = createAsyncThunk("cart/remove", (itemId, { getState, rejectWithValue }) => serial(async () => {
  try {
    const item = findItem(getState, itemId);
    if (!item) throw new Error("This item is no longer in your bag.");
    if (!signedIn(getState) || item.guest) return { items: getState().cart.items.filter((entry) => cartItemId(entry) !== String(itemId)) };
    return remainingGuests(getState, readCart(await axios.delete("/api/v5/cart/remove", { data: { itemId } })));
  } catch (error) { return rejectWithValue(errorMessage(error, "Unable to remove this item.")); }
}));

export const clearCart = createAsyncThunk("cart/clear", (_, { getState, rejectWithValue }) => serial(async () => {
  try {
    if (signedIn(getState)) await axios.delete("/api/v5/cart/clear");
    return { items: [] };
  } catch (error) { return rejectWithValue(errorMessage(error, "Unable to clear your bag.")); }
}));

export const mergeGuestCart = createAsyncThunk("cart/mergeGuest", (_, { getState, dispatch, rejectWithValue }) => serial(async () => {
  if (!signedIn(getState)) return currentCart(getState);
  try {
    for (const item of guestItems(getState)) {
      const cart = readCart(await axios.post("/api/v5/cart/add", {
        productId: productId(item.product || item.productId), quantity: item.quantity, size: item.size || "", color: item.color || "",
      }));
      dispatch(cartSlice.actions.guestItemTransferred({ itemId: cartItemId(item), cart }));
    }
    return readCart(await axios.get("/api/v5/cart"));
  } catch (error) { return rejectWithValue(errorMessage(error, "Some items could not be synced. Your saved bag is preserved; please retry.")); }
}));

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], loading: false, pending: 0, error: null },
  reducers: {
    syncLocalCart: () => {},
    resetCart: (state) => { state.items = []; state.error = null; },
    guestItemTransferred: (state, action) => {
      state.items = [...action.payload.cart.items, ...state.items.filter((item) => item.guest && cartItemId(item) !== action.payload.itemId)];
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [fetchCart, addToCart, updateQuantity, removeFromCart, clearCart, mergeGuestCart]) {
      builder.addCase(thunk.pending, (state) => { state.pending += 1; state.loading = true; state.error = null; });
      builder.addCase(thunk.fulfilled, (state, action) => { state.pending = Math.max(0, state.pending - 1); state.loading = state.pending > 0; state.items = action.payload.items; state.error = null; });
      builder.addCase(thunk.rejected, (state, action) => { state.pending = Math.max(0, state.pending - 1); state.loading = state.pending > 0; state.error = action.payload || action.error.message; });
    }
  },
});

export const { syncLocalCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
