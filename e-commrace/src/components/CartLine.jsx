import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { removeFromCart, updateQuantity } from "../store/cartSlice";
import { availableStock, cartItemId, cartItemPrice, errorMessage, imageUrl, money, placeholderImage, productId } from "../utils/commerce";
import { optimizeImage } from "../utils/imageOptimizer";

export default function CartLine({ item, compact = false }) {
  const dispatch = useDispatch();
  const busy = useSelector((state) => state.cart.loading);
  const id = cartItemId(item);
  const product = item.product;
  const productLink = productId(product || item.productId);
  const stock = availableStock(product, item.size);
  const unavailable = !product || product.isActive === false || stock === 0;
  const mutate = async (action) => {
    try { await dispatch(action).unwrap(); }
    catch (error) { toast.error(errorMessage(error)); }
  };
  return <article className={`flex gap-4 border-b border-[#e5e0d6] ${compact ? "py-5" : "py-7 sm:gap-6"}`}>
    <Link to={`/products/${productLink}`} className={`shrink-0 overflow-hidden bg-[#eeeae1] ${compact ? "w-20" : "w-24 sm:w-32"}`}>
      <img src={optimizeImage(imageUrl(product?.images?.[0]), { width: 280 }) || placeholderImage} onError={(event) => { event.currentTarget.src = placeholderImage; }} alt={product?.title || "Product unavailable"} className="aspect-[3/4] w-full object-cover" />
    </Link>
    <div className="min-w-0 flex-1 py-1">
      <div className="flex justify-between gap-3">
        <div><p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#8b806a]">{product?.fabric || "Your selection"}</p><Link to={`/products/${productLink}`} className="font-serif text-lg leading-snug text-[#28251f] hover:underline">{product?.title || "Product unavailable"}</Link></div>
        <button type="button" disabled={busy} aria-label={`Remove ${product?.title || "item"}`} onClick={() => mutate(removeFromCart(id))} className="self-start p-2 text-stone-400 transition hover:text-red-700 disabled:opacity-40"><Trash2 size={16} /></button>
      </div>
      <p className="mt-2 text-xs text-stone-500">{[item.size && `Size ${item.size}`, item.color].filter(Boolean).join(" · ") || "Standard option"}</p>
      {unavailable && <p className="mt-2 text-xs text-red-700">Currently unavailable. Remove this item to continue.</p>}
      {item.quantity > stock && !unavailable && <p className="mt-2 text-xs text-amber-800">Only {stock} available. Please adjust your quantity.</p>}
      {item.guest && <p className="mt-1 text-[10px] text-stone-500">Saved in this session</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center border border-[#d8d0c0]">
          <button type="button" aria-label="Decrease quantity" disabled={busy || item.quantity <= 1} onClick={() => mutate(updateQuantity({ itemId: id, quantity: item.quantity - 1 }))} className="p-2.5 transition hover:bg-stone-100 disabled:opacity-30"><Minus size={12} /></button>
          <span aria-live="polite" className="min-w-7 text-center text-xs font-medium">{item.quantity}</span>
          <button type="button" aria-label="Increase quantity" disabled={busy || unavailable || item.quantity >= stock} onClick={() => mutate(updateQuantity({ itemId: id, quantity: item.quantity + 1 }))} className="p-2.5 transition hover:bg-stone-100 disabled:opacity-30"><Plus size={12} /></button>
        </div>
        <span className="text-sm font-medium tabular-nums">{money(cartItemPrice(item) * item.quantity)}</span>
      </div>
    </div>
  </article>;
}
