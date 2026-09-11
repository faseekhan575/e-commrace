// ============================================================
// wishlist.js — Redux Toolkit Wishlist Bridge (No localStorage)
// ============================================================
import store from "../store/store";
import {
  toggleWishlistItem,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../store/wishlistSlice";

export function getWishlist() {
  return store.getState().wishlist?.items || [];
}

export function getWishlistCount() {
  return (store.getState().wishlist?.items || []).length;
}

export function isInWishlist(productId) {
  if (!productId) return false;
  const idStr = String(productId._id || productId.id || productId);
  const items = store.getState().wishlist?.items || [];
  return items.some((item) => String(item._id || item.id || item) === idStr);
}

export function toggleWishlist(product) {
  if (!product) return false;
  const wasIn = isInWishlist(product);
  store.dispatch(toggleWishlistItem(product));
  return !wasIn;
}

export function addToWishlistAction(product) {
  store.dispatch(addToWishlist(product));
}

export function removeFromWishlistAction(id) {
  store.dispatch(removeFromWishlist(id));
}

export function clearWishlistAction() {
  store.dispatch(clearWishlist());
}

export function subscribeWishlist(callback) {
  let prevItems = store.getState().wishlist?.items || [];
  callback([...prevItems]);

  const unsubscribe = store.subscribe(() => {
    const currentItems = store.getState().wishlist?.items || [];
    if (currentItems !== prevItems) {
      prevItems = currentItems;
      callback([...currentItems]);
    }
  });

  return unsubscribe;
}

export {
  toggleWishlistItem,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};
