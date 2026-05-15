import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import productsReducer from "./productsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these fields in state for non-serializable values (like File objects, etc.)
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["products.current.images", "auth.user.avatar"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools in development
});

export default store;