import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";

const GUEST_CART_KEY = "clothingden_cart_items_v2";

function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function saveGuestCart(items) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (e) {}
}

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { getState, rejectWithValue }) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return { items: loadGuestCart() };
  }
  try {
    const res = await axios.get("/api/v5/cart");
    const serverItems = res.data.data?.items || [];
    saveGuestCart(serverItems);
    return res.data.data;
  } catch (err) {
    return { items: loadGuestCart() };
  }
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity = 1, product = null, size = "M", stitching = "Stitched" }, { getState, rejectWithValue }) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // Manage locally for guest
      const currentItems = loadGuestCart();
      const existingIdx = currentItems.findIndex(
        (i) => (i.product?._id === productId || i.product?.id === productId || i.productId === productId) &&
               (i.size === size || (!i.size && size === "M"))
      );

      let updatedItems = [];
      if (existingIdx !== -1) {
        updatedItems = currentItems.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const prodData = product || {
          _id: productId,
          title: "Luxury Apparel",
          price: 4500,
          images: [{ url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80" }],
        };
        updatedItems = [
          ...currentItems,
          {
            product: prodData,
            productId,
            quantity,
            size,
            stitching,
            price: prodData.discountPrice || prodData.price || 4500,
          },
        ];
      }
      saveGuestCart(updatedItems);
      return { items: updatedItems };
    }

    try {
      const res = await axios.post("/api/v5/cart/add", { productId, quantity });
      saveGuestCart(res.data.data?.items || []);
      return res.data.data;
    } catch (err) {
      // Fallback to local cart on temporary network issue
      const currentItems = loadGuestCart();
      const existingIdx = currentItems.findIndex(
        (i) => (i.product?._id === productId || i.product?.id === productId || i.productId === productId)
      );
      let updatedItems = [];
      if (existingIdx !== -1) {
        updatedItems = currentItems.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const prodData = product || { _id: productId, title: "Luxury Apparel", price: 4500 };
        updatedItems = [...currentItems, { product: prodData, productId, quantity, size, stitching, price: prodData.price }];
      }
      saveGuestCart(updatedItems);
      return { items: updatedItems };
    }
  }
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQty",
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      const currentItems = loadGuestCart();
      const updatedItems = currentItems.map((item) => {
        if (item.product?._id === productId || item.product?.id === productId || item.productId === productId) {
          return { ...item, quantity };
        }
        return item;
      });
      saveGuestCart(updatedItems);
      return { items: updatedItems };
    }

    try {
      const res = await axios.patch("/api/v5/cart/quantity", { productId, quantity });
      saveGuestCart(res.data.data?.items || []);
      return res.data.data;
    } catch (err) {
      const currentItems = loadGuestCart();
      const updatedItems = currentItems.map((item) =>
        (item.product?._id === productId || item.productId === productId) ? { ...item, quantity } : item
      );
      saveGuestCart(updatedItems);
      return { items: updatedItems };
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (productId, { getState, rejectWithValue }) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      const currentItems = loadGuestCart();
      const updatedItems = currentItems.filter(
        (item) => item.product?._id !== productId && item.product?.id !== productId && item.productId !== productId
      );
      saveGuestCart(updatedItems);
      return { items: updatedItems };
    }

    try {
      const res = await axios.delete("/api/v5/cart/remove", { data: { productId } });
      saveGuestCart(res.data.data?.items || []);
      return res.data.data;
    } catch (err) {
      const currentItems = loadGuestCart();
      const updatedItems = currentItems.filter((i) => (i.product?._id !== productId && i.productId !== productId));
      saveGuestCart(updatedItems);
      return { items: updatedItems };
    }
  }
);

export const clearCart = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  saveGuestCart([]);
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      await axios.delete("/api/v5/cart/clear");
    } catch (err) {}
  }
  return { items: [] };
});

const initialCartItems = loadGuestCart();

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: initialCartItems,
    loading: false,
    error: null,
  },
  reducers: {
    syncLocalCart: (state) => {
      state.items = loadGuestCart();
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateQuantity.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled, (state) => { state.items = []; });
  },
});

export const { syncLocalCart } = cartSlice.actions;
export default cartSlice.reducer;