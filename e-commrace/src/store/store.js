import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import productsReducer from "./productsSlice";
import bannerReducer from "./bannerSlice";
import spotlightReducer from "./spotlightSlice";
import wishlistReducer from "./wishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    banners: bannerReducer,
    spotlight: spotlightReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});

export default store;