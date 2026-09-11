import { useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Lock, MapPin, Package, Printer, Truck } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../axiosConfig";
import { resetCart } from "../../store/cartSlice";
import { availableStock, cartItemId, cartItemPrice, errorMessage, imageUrl, money, placeholderImage, productId } from "../../utils/commerce";

const provinces = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Azad Jammu & Kashmir", "Gilgit-Baltistan"];
const inputClass = "mt-2 w-full border border-[#dcd5c8] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#9b8358] focus:ring-2 focus:ring-[#9b8358]/10";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const { items, loading: cartLoading, error: cartError } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: user?.fullname || "", email: user?.email || "", phone: "", street: "", city: "", state: "", zip: "", orderNotes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const submittingRef = useRef(false);
  const total = items.reduce((sum, item) => sum + cartItemPrice(item) * item.quantity, 0);
  const invalidItems = items.some((item) => !item.product || item.quantity > availableStock(item.product, item.size) || item.guest);
  const updateField = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const validate = () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 2) return "Please enter the recipient's full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address.";
    if (!/^(?:\+92|92|0)3\d{9}$/.test(form.phone.replace(/[\s()-]/g, ""))) return "Enter a Pakistani mobile number, such as 0300 1234567.";
    if (form.street.trim().length < 8 || !form.city.trim() || !form.state) return "Please complete your delivery address.";
    if (form.zip && !/^\d{5}$/.test(form.zip.trim())) return "Enter a five-digit postal code, or leave it blank.";
    return "";
  };
  const nextStep = (event) => {
    event.preventDefault();
    const validation = validate();
    if (validation) { setSubmitError(validation); return; }
    setSubmitError(""); setStep(2); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const placeOrder = async () => {
    if (submittingRef.current || cartLoading) return;
    const validation = validate();
    if (validation || !items.length || invalidItems || !isAuthenticated) { setSubmitError(validation || "Please review your shopping bag and sign in before placing an order."); return; }
    submittingRef.current = true;
    setSubmitting(true); setSubmitError("");
    try {
      const payload = {
        items: items.map((item) => ({ product: productId(item.product || item.productId), size: item.size || "", color: item.color || "", quantity: item.quantity, priceAtPurchase: cartItemPrice(item) })),
        totalAmount: total,
        paymentMethod: "cod",
        shippingAddress: { street: form.street.trim(), city: form.city.trim(), state: form.state, country: "Pakistan", zip: form.zip.trim(), phone: form.phone.trim() },
        orderNotes: [`Recipient: ${form.fullName.trim()}`, `Contact email: ${form.email.trim()}`, form.orderNotes.trim()].filter(Boolean).join("\n"),
      };
      const response = await axios.post("/api/v6/order/place", payload);
      const order = response.data?.data?.order || response.data?.data;
      if (!order?._id && !order?.id) throw new Error("The order response was incomplete. Check your order history before submitting again.");
      setReceipt(order);
      dispatch(resetCart());
      toast.success("Your order has been placed.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message = errorMessage(error, "We could not confirm this order. Please check your order history before trying again.");
      setSubmitError(message); toast.error(message);
    } finally { setSubmitting(false); submittingRef.current = false; }
  };

  if (receipt) return <div className="min-h-[75vh] bg-[#faf9f6] px-5 py-14"><div className="mx-auto max-w-2xl border border-[#e2dacb] bg-white p-7 sm:p-12">
    <div className="border-b border-[#e8e1d4] pb-8 text-center"><CheckCircle2 className="mx-auto mb-5 text-[#718461]" size={45} strokeWidth={1} /><p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#a38753]">Order received</p><h1 className="font-serif text-4xl">Thank you, {form.fullName.split(" ")[0]}.</h1><p className="mt-4 text-sm leading-6 text-stone-500">Your pieces are one step closer. Follow your order for confirmation, dispatch, and delivery updates.</p></div>
    <dl className="grid gap-x-8 gap-y-6 py-8 text-sm sm:grid-cols-2">{[["Order number", receipt._id || receipt.id], ["Order total", money(receipt.totalAmount)], ["Payment", receipt.paymentMethod === "cod" ? "Cash on delivery" : receipt.paymentMethod], ["Status", receipt.status], ["Payment status", receipt.paymentStatus], ["Placed on", receipt.createdAt ? new Date(receipt.createdAt).toLocaleString("en-PK") : null]].filter(([,value]) => value).map(([label,value]) => <div key={label}><dt className="mb-1 text-[10px] uppercase tracking-[0.16em] text-stone-400">{label}</dt><dd className="break-words capitalize">{value}</dd></div>)}</dl>
    <div className="border-y border-[#e8e1d4] py-6 text-sm leading-6"><p className="mb-2 flex items-center gap-2 font-medium"><MapPin size={15} /> Delivering to</p><p>{form.fullName}</p><p className="text-stone-500">{receipt.shippingAddress?.street || form.street}, {receipt.shippingAddress?.city || form.city}, {receipt.shippingAddress?.state || form.state}</p></div>
    <div className="mt-8 flex flex-wrap gap-3"><Link to={`/orders/${receipt._id || receipt.id}`} className="flex flex-1 items-center justify-center gap-3 bg-[#27271f] px-5 py-4 text-[11px] uppercase tracking-[0.16em] text-white">Track your order <ArrowRight size={14} /></Link><button onClick={() => window.print()} className="flex items-center justify-center gap-2 border border-[#dcd4c5] px-5 py-4 text-xs"><Printer size={15} /> Print receipt</button></div><Link to="/products" className="mt-5 block text-center text-xs text-stone-500 underline underline-offset-4">Continue shopping</Link>
  </div></div>;
  if (!isAuthenticated) return <Navigate to="/login?redirect=%2Fcheckout" replace state={{ from: { pathname: "/checkout" } }} />;
  if (!items.length && !cartLoading) return <Navigate to="/cart" replace />;

  return <div className="min-h-screen bg-[#faf9f6] px-5 py-10 sm:px-8 sm:py-14"><div className="mx-auto max-w-6xl">
    <Link to="/cart" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-stone-500"><ArrowLeft size={13} /> Back to your bag</Link>
    <div className="my-8"><p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#a38753]">The final details</p><h1 className="font-serif text-4xl sm:text-5xl">Checkout</h1></div>
    <div className="mb-9 flex gap-6 border-b border-[#ded6c8] pb-6 text-xs">{["Delivery details", "Review & payment"].map((label,index) => <div key={label} className={`flex items-center gap-2 ${step === index + 1 ? "text-[#28251f]" : "text-stone-400"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${step > index + 1 ? "border-[#718461] bg-[#718461] text-white" : "border-current"}`}>{step > index + 1 ? <Check size={12} /> : index + 1}</span>{label}</div>)}</div>
    {(submitError || cartError) && <div role="alert" className="mb-6 border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{submitError || cartError}{step === 2 && <Link to="/orders" className="ml-2 underline">View order history</Link>}</div>}
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section>{step === 1 ? <form onSubmit={nextStep} className="space-y-7"><h2 className="flex items-center gap-3 font-serif text-2xl"><MapPin size={20} strokeWidth={1.5} />Where should we deliver?</h2><div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs text-stone-600">Recipient's full name<input name="fullName" autoComplete="name" required minLength={2} maxLength={100} value={form.fullName} onChange={updateField} className={inputClass} /></label>
        <label className="text-xs text-stone-600">Email address<input name="email" autoComplete="email" type="email" required value={form.email} onChange={updateField} className={inputClass} /></label>
        <label className="text-xs text-stone-600 sm:col-span-2">Mobile number<input name="phone" autoComplete="tel" type="tel" placeholder="0300 1234567" required value={form.phone} onChange={updateField} className={inputClass} /></label>
        <label className="text-xs text-stone-600 sm:col-span-2">Street address<input name="street" autoComplete="street-address" placeholder="House, building, street and area" minLength={8} maxLength={300} required value={form.street} onChange={updateField} className={inputClass} /></label>
        <label className="text-xs text-stone-600">City<input name="city" autoComplete="address-level2" required value={form.city} onChange={updateField} className={inputClass} /></label>
        <label className="text-xs text-stone-600">Province / territory<select name="state" autoComplete="address-level1" required value={form.state} onChange={updateField} className={inputClass}><option value="">Select province</option>{provinces.map((province) => <option key={province}>{province}</option>)}</select></label>
        <label className="text-xs text-stone-600">Postal code <span className="text-stone-400">(optional)</span><input name="zip" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={form.zip} onChange={updateField} className={inputClass} /></label>
        <label className="text-xs text-stone-600">Country<input readOnly value="Pakistan" className={`${inputClass} text-stone-400`} /></label>
        <label className="text-xs text-stone-600 sm:col-span-2">Delivery notes <span className="text-stone-400">(optional)</span><textarea name="orderNotes" rows={3} maxLength={700} value={form.orderNotes} onChange={updateField} className={inputClass} placeholder="Anything we should know about your delivery?" /></label>
      </div><button type="submit" disabled={cartLoading || invalidItems} className="flex w-full items-center justify-between bg-[#27271f] px-6 py-4 text-[11px] uppercase tracking-[0.17em] text-white disabled:bg-stone-300">Review your order <ArrowRight size={15} /></button></form> : <div className="space-y-6">
        <div className="border border-[#ded6c8] bg-white p-6"><div className="mb-4 flex justify-between"><h2 className="font-serif text-2xl">Delivery details</h2><button disabled={submitting} onClick={() => setStep(1)} className="text-xs underline underline-offset-4">Edit</button></div><p className="text-sm leading-7">{form.fullName}<br />{form.street}<br />{form.city}, {form.state} {form.zip}<br />{form.phone}<br />{form.email}</p>{form.orderNotes && <p className="mt-4 border-t border-[#eee9df] pt-4 text-xs leading-6 text-stone-500">{form.orderNotes}</p>}</div>
        <div className="border border-[#b7a17a] bg-[#f4f0e7] p-6"><div className="flex items-center gap-3"><Truck size={21} strokeWidth={1.5} /><h2 className="font-serif text-2xl">Cash on delivery</h2><CheckCircle2 size={19} className="ml-auto text-[#718461]" /></div><p className="mt-3 text-sm leading-6 text-stone-600">Pay for your order when it arrives. Follow the dispatch details in your account after your order is confirmed.</p></div>
        <button disabled={submitting || cartLoading || invalidItems} onClick={placeOrder} className="flex w-full items-center justify-between bg-[#27271f] px-6 py-5 text-[11px] uppercase tracking-[0.17em] text-white transition hover:bg-[#494733] disabled:bg-stone-300"><span>{submitting ? "Placing your order…" : `Place order · ${money(total)}`}</span>{submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <ArrowRight size={15} />}</button>
      </div>}{invalidItems && <p role="alert" className="mt-5 text-sm text-red-700">Please <Link to="/cart" className="underline">review your bag</Link> to sync saved pieces or update unavailable quantities.</p>}</section>
      <aside className="self-start border border-[#e2dacb] bg-white p-6 lg:sticky lg:top-28"><h2 className="mb-5 flex items-center gap-2 font-serif text-2xl"><Package size={20} strokeWidth={1.5} />Your selection</h2><div className="max-h-[420px] space-y-5 overflow-y-auto pr-1">{items.map((item) => <div key={cartItemId(item)} className="flex gap-4"><img src={imageUrl(item.product?.images?.[0]) || placeholderImage} onError={(event) => { event.currentTarget.src = placeholderImage; }} alt={item.product?.title || "Product"} className="h-24 w-18 bg-stone-100 object-cover" /><div className="flex-1 text-xs"><p className="mb-2 font-medium leading-5">{item.product?.title || "Product unavailable"}</p><p className="text-stone-400">{[item.size, item.color].filter(Boolean).join(" / ")}</p><div className="mt-3 flex justify-between gap-2"><span className="text-stone-500">Qty {item.quantity}</span><span>{money(cartItemPrice(item) * item.quantity)}</span></div></div></div>)}</div><div className="mt-6 flex items-center justify-between border-t border-[#e5decf] pt-6"><span className="font-serif text-xl">Order total</span><span className="font-medium">{money(total)}</span></div><p className="mt-5 flex gap-2 text-xs leading-5 text-stone-400"><Lock size={13} className="mt-1 shrink-0" />Your order will appear in your account after confirmation.</p></aside>
    </div>
  </div></div>;
}
