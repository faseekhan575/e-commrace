import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { X, ShoppingBag, ArrowRight, Lock } from "lucide-react";
import CartLine from "./CartLine";
import { availableStock, cartItemId, cartItemPrice, money } from "../utils/commerce";

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.cart);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const panelRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]');
      if (!focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", onKey); previousFocus?.focus?.(); };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const subtotal = items.reduce((sum, item) => sum + cartItemPrice(item) * item.quantity, 0);
  const cannotCheckout = loading || items.some((item) => !item.product || item.quantity > availableStock(item.product, item.size) || (isAuthenticated && item.guest));
  const checkout = () => { onClose(); navigate(isAuthenticated ? "/checkout" : "/login?redirect=%2Fcheckout", { state: { from: { pathname: "/checkout" } } }); };
  return <div className="fixed inset-0 z-[100]">
    <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
    <section ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-[#faf9f6] shadow-2xl outline-none motion-safe:animate-[slideInRight_0.3s_ease-out]">
      <div className="flex items-center justify-between border-b border-[#e1dbce] px-6 py-6"><div><p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-[#a38753]">Your selection</p><h2 id="cart-drawer-title" className="font-serif text-2xl">Shopping bag <span className="ml-2 text-sm text-stone-400">({items.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div><button onClick={onClose} aria-label="Close shopping bag" className="p-3 text-stone-500 hover:text-black"><X size={20} /></button></div>
      {error && <p role="alert" className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-xs text-amber-900">{error} <Link to="/cart" onClick={onClose} className="underline">Manage bag</Link></p>}
      <div className="flex-1 overflow-y-auto px-6">{loading && !items.length ? <p className="py-12 text-center text-sm text-stone-500">Loading your bag…</p> : !items.length ? <div className="py-20 text-center"><ShoppingBag size={40} strokeWidth={1} className="mx-auto mb-5 text-[#a38753]" /><h3 className="font-serif text-2xl">A new favourite awaits.</h3><p className="mt-3 text-sm text-stone-500">Discover something to make your own.</p><Link to="/products" onClick={onClose} className="mt-7 inline-flex bg-[#27271f] px-6 py-4 text-[11px] uppercase tracking-[0.16em] text-white">Explore the collection</Link></div> : items.map((item) => <CartLine key={cartItemId(item)} item={item} compact />)}</div>
      {!!items.length && <div className="border-t border-[#ded6c7] bg-white p-6"><div className="mb-5 flex items-center justify-between"><span className="font-serif text-xl">Subtotal</span><strong className="font-medium">{money(subtotal)}</strong></div><button disabled={cannotCheckout} onClick={checkout} className="flex w-full items-center justify-between bg-[#27271f] px-5 py-4 text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[#494733] disabled:bg-stone-300"><span>{loading ? "Updating bag…" : isAuthenticated ? "Checkout" : "Sign in to checkout"}</span><ArrowRight size={15} /></button><Link to="/cart" onClick={onClose} className="mt-3 block py-2 text-center text-xs underline underline-offset-4">View and edit shopping bag</Link><p className="mt-3 flex items-center justify-center gap-2 text-[10px] text-stone-500"><Lock size={12} /> Cash on delivery available</p></div>}
    </section>
  </div>;
}
