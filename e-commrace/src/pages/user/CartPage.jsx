import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Lock, RefreshCw, ArrowLeft } from "lucide-react";
import CartLine from "../../components/CartLine";
import { mergeGuestCart } from "../../store/cartSlice";
import { availableStock, cartItemId, cartItemPrice, money } from "../../utils/commerce";

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.cart);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const subtotal = items.reduce((sum, item) => sum + cartItemPrice(item) * item.quantity, 0);
  const invalid = items.some((item) => !item.product || item.quantity > availableStock(item.product, item.size));
  const unsynced = isAuthenticated && items.some((item) => item.guest);
  return <div className="min-h-[75vh] bg-[#faf9f6] px-5 py-10 sm:px-8 sm:py-16">
    <div className="mx-auto max-w-6xl">
      <Link to="/products" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-stone-500 hover:text-black"><ArrowLeft size={13} /> Continue discovering</Link>
      <div className="mb-8 mt-7 flex items-end justify-between border-b border-[#ded8cc] pb-6"><div><p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#a38753]">The considered wardrobe</p><h1 className="font-serif text-4xl text-[#28251f] sm:text-5xl">Your shopping bag</h1></div><p className="hidden text-sm text-stone-500 sm:block">{items.reduce((sum, item) => sum + item.quantity, 0)} pieces</p></div>
      {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><span>{error}</span>{isAuthenticated && <button disabled={loading} onClick={() => dispatch(mergeGuestCart())} className="flex items-center gap-2 font-medium underline"><RefreshCw size={14} /> Retry loading bag</button>}</div>}
      {loading && !items.length ? <div className="animate-pulse py-20 text-center text-stone-500">Loading your bag…</div> : !items.length ? <div className="mx-auto max-w-md py-16 text-center"><ShoppingBag size={42} strokeWidth={1} className="mx-auto mb-6 text-[#a38753]" /><h2 className="font-serif text-3xl">Room for something beautiful.</h2><p className="mb-8 mt-3 text-sm leading-6 text-stone-500">Explore the collection and find the pieces that feel like you.</p><Link to="/products" className="inline-flex items-center gap-4 bg-[#27271f] px-7 py-4 text-[11px] uppercase tracking-[0.2em] text-white">Explore all products <ArrowRight size={15} /></Link></div> : <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
        <div>{items.map((item) => <CartLine key={cartItemId(item)} item={item} />)}</div>
        <aside className="self-start border border-[#e2dccf] bg-white p-7 lg:sticky lg:top-28"><p className="mb-7 text-[11px] uppercase tracking-[0.2em] text-[#8e7750]">Order summary</p><div className="flex justify-between text-sm"><span className="text-stone-500">Subtotal</span><span>{money(subtotal)}</span></div><div className="my-6 flex justify-between border-t border-[#e9e4da] pt-6"><span className="font-serif text-xl">Order total</span><strong className="font-medium">{money(subtotal)}</strong></div>
          {invalid && <p className="mb-4 text-xs leading-5 text-red-700">Please update unavailable quantities before checkout.</p>}
          {unsynced && <button disabled={loading} onClick={() => dispatch(mergeGuestCart())} className="mb-4 w-full border border-[#b7a17a] px-4 py-3 text-xs">{loading ? "Syncing your bag…" : "Sync saved pieces to your account"}</button>}
          {invalid || loading || unsynced ? <button disabled className="flex w-full items-center justify-center gap-3 bg-stone-300 py-4 text-[11px] uppercase tracking-[0.16em] text-white">{loading ? "Updating bag…" : "Checkout"}<Lock size={13} /></button> : <Link to={isAuthenticated ? "/checkout" : "/login?redirect=%2Fcheckout"} state={{ from: { pathname: "/checkout" } }} className="group flex items-center justify-between bg-[#27271f] px-5 py-4 text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[#494733]">{isAuthenticated ? "Proceed to checkout" : "Sign in to checkout"}<ArrowRight size={15} className="transition group-hover:translate-x-1" /></Link>}
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-stone-500"><Lock size={13} className="mt-1 shrink-0" />Cash on delivery. Your order and availability are confirmed when you place your order.</p>
        </aside>
      </div>}
    </div>
  </div>;
}
