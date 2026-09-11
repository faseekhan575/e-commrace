import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlistItem: (state, action) => {
      const product = action.payload;
      if (!product) return;
      const idStr = String(product._id || product.id || product);
      const existingIdx = state.items.findIndex(
        (item) => String(item._id || item.id || item) === idStr
      );

      if (existingIdx !== -1) {
        state.items.splice(existingIdx, 1);
      } else {
        state.items.unshift({
          _id: idStr,
          id: idStr,
          title: product.title || "Apparel Piece",
          price: product.price || 0,
          discountPrice: product.discountPrice || null,
          fabric: product.fabric || "",
          images: product.images || [],
          category: product.category || null,
          stock: product.stock !== undefined ? product.stock : 10,
          sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
        });
      }
    },
    addToWishlist: (state, action) => {
      const product = action.payload;
      if (!product) return;
      const idStr = String(product._id || product.id || product);
      const exists = state.items.some(
        (item) => String(item._id || item.id || item) === idStr
      );
      if (!exists) {
        state.items.unshift({
          _id: idStr,
          id: idStr,
          title: product.title || "Apparel Piece",
          price: product.price || 0,
          discountPrice: product.discountPrice || null,
          fabric: product.fabric || "",
          images: product.images || [],
          category: product.category || null,
          stock: product.stock !== undefined ? product.stock : 10,
          sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
        });
      }
    },
    removeFromWishlist: (state, action) => {
      const idStr = String(action.payload);
      state.items = state.items.filter(
        (item) => String(item._id || item.id || item) !== idStr
      );
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  toggleWishlistItem,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
