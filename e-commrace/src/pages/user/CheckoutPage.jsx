import { useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  Package,
  Printer,
  ShieldCheck,
  Smartphone,
  Truck,
  X,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../axiosConfig";
import { resetCart } from "../../store/cartSlice";
import {
  availableStock,
  cartItemId,
  cartItemPrice,
  errorMessage,
  imageUrl,
  money,
  placeholderImage,
  productId,
} from "../../utils/commerce";

const provinces = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
];
const inputClass =
  "mt-2 w-full border border-[#dcd5c8] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10 rounded";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const { items, loading: cartLoading, error: cartError } = useSelector(
    (state) => state.cart
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: user?.fullname || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    orderNotes: "",
  });

  const [selectedPayment, setSelectedPayment] = useState("cod"); // 'cod' or 'payfast'
  const [payfastModalOpen, setPayfastModalOpen] = useState(false);
  const [payfastTab, setPayfastTab] = useState("wallets"); // 'wallets', 'cards', 'gpay', 'bank'
  const [payfastWallet, setPayfastWallet] = useState("easypaisa"); // 'easypaisa' or 'jazzcash'
  const [walletPhone, setWalletPhone] = useState("");
  const [selectedBank, setSelectedBank] = useState("Meezan Bank");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const submittingRef = useRef(false);

  const total = items.reduce(
    (sum, item) => sum + cartItemPrice(item) * item.quantity,
    0
  );
  const invalidItems = items.some(
    (item) =>
      !item.product ||
      item.quantity > availableStock(item.product, item.size)
  );

  const updateField = (event) =>
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

  const validate = () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      return "Please enter the recipient's full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Enter a valid email address.";
    if (!/^(?:\+92|92|0)3\d{9}$/.test(form.phone.replace(/[\s()-]/g, "")))
      return "Enter a Pakistani mobile number, such as 0300 1234567.";
    if (form.street.trim().length < 8 || !form.city.trim() || !form.state)
      return "Please complete your delivery address.";
    if (form.zip && !/^\d{5}$/.test(form.zip.trim()))
      return "Enter a five-digit postal code, or leave it blank.";
    return "";
  };

  const nextStep = (event) => {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setSubmitError(validation);
      return;
    }
    setSubmitError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async (chosenPayment = selectedPayment) => {
    if (submittingRef.current || cartLoading) return;
    const validation = validate();
    if (validation || !items.length || invalidItems) {
      setSubmitError(
        validation ||
          "Please review your shopping bag before placing an order."
      );
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        items: items.map((item) => ({
          product: productId(item.product || item.productId),
          size: item.size || "",
          color: item.color || "",
          quantity: item.quantity,
          priceAtPurchase: cartItemPrice(item),
        })),
        totalAmount: total,
        paymentMethod: chosenPayment === "payfast" ? "payfast" : "cod",
        shippingAddress: {
          fullName: form.fullName.trim(),
          recipientName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state,
          country: "Pakistan",
          zip: form.zip.trim(),
        },
        customerName: form.fullName.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        recipientName: form.fullName.trim(),
        recipientEmail: form.email.trim(),
        recipientPhone: form.phone.trim(),
        guestInfo: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        orderNotes: [
          `Recipient: ${form.fullName.trim()}`,
          `Contact email: ${form.email.trim()}`,
          chosenPayment === "payfast"
            ? `Payment: PayFast Online Gateway (${payfastTab} - ${
                payfastTab === "wallets"
                  ? payfastWallet
                  : payfastTab === "bank"
                  ? selectedBank
                  : payfastTab
              })`
            : "Payment: Cash on Delivery",
          form.orderNotes.trim(),
        ]
          .filter(Boolean)
          .join("\n"),
      };

      const response = await axios.post("/api/v6/order/place", payload);
      const order = response.data?.data?.order || response.data?.data;
      if (!order?._id && !order?.id)
        throw new Error(
          "The order response was incomplete. Check your order history before submitting again."
        );

      setReceipt(order);
      setPayfastModalOpen(false);
      dispatch(resetCart());
      toast.success(
        chosenPayment === "payfast"
          ? "Payment authorized via PayFast! Order placed."
          : "Your order has been placed successfully."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message = errorMessage(
        error,
        "We could not confirm this order. Please check your order history before trying again."
      );
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  // Order Receipt confirmation view
  if (receipt)
    return (
      <div className="min-h-[75vh] bg-[#faf9f6] px-5 py-14">
        <div className="mx-auto max-w-2xl border border-[#e2dacb] bg-white p-7 sm:p-12">
          <div className="border-b border-[#e8e1d4] pb-8 text-center">
            <CheckCircle2
              className="mx-auto mb-5 text-[#718461]"
              size={45}
              strokeWidth={1}
            />
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#a38753]">
              Order received
            </p>
            <h1 className="font-serif text-4xl">
              Thank you, {form.fullName.split(" ")[0]}.
            </h1>
            <p className="mt-4 text-sm leading-6 text-stone-500">
              Your pieces are one step closer. Follow your order for
              confirmation, dispatch, and delivery updates.
            </p>
          </div>

          <dl className="grid gap-x-8 gap-y-6 py-8 text-sm sm:grid-cols-2">
            {[
              ["Order number", receipt._id || receipt.id],
              ["Order total", money(receipt.totalAmount)],
              [
                "Payment",
                receipt.paymentMethod === "payfast"
                  ? "PayFast Digital Gateway"
                  : receipt.paymentMethod === "cod"
                  ? "Cash on delivery"
                  : receipt.paymentMethod,
              ],
              ["Status", receipt.status],
              [
                "Payment status",
                receipt.paymentMethod === "payfast"
                  ? "Pending / Authorized"
                  : receipt.paymentStatus,
              ],
              [
                "Placed on",
                receipt.createdAt
                  ? new Date(receipt.createdAt).toLocaleString("en-PK")
                  : null,
              ],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="mb-1 text-[10px] uppercase tracking-[0.16em] text-stone-400">
                    {label}
                  </dt>
                  <dd className="break-words capitalize font-medium">{value}</dd>
                </div>
              ))}
          </dl>

          <div className="border-y border-[#e8e1d4] py-6 text-sm leading-6">
            <p className="mb-2 flex items-center gap-2 font-medium">
              <MapPin size={15} /> Delivering to
            </p>
            <p className="font-semibold">{form.fullName}</p>
            <p className="text-stone-500">
              {receipt.shippingAddress?.street || form.street},{" "}
              {receipt.shippingAddress?.city || form.city},{" "}
              {receipt.shippingAddress?.state || form.state}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/orders/${receipt._id || receipt.id}`}
              className="flex flex-1 items-center justify-center gap-3 bg-[#27271f] px-5 py-4 text-[11px] uppercase tracking-[0.16em] text-white hover:bg-black transition-colors"
            >
              Track your order <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 border border-[#dcd4c5] px-5 py-4 text-xs hover:bg-stone-50 transition-colors"
            >
              <Printer size={15} /> Print receipt
            </button>
          </div>

          <Link
            to="/products"
            className="mt-5 block text-center text-xs text-stone-500 underline underline-offset-4 hover:text-black"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );

  if (!items.length && !cartLoading) return <Navigate to="/cart" replace />;

  return (
    <div className="min-h-screen bg-[#faf9f6] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-stone-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={13} /> Back to your bag
        </Link>

        <div className="my-8">
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#a38753]">
            The final details
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl">Checkout</h1>
        </div>

        {/* Step Indicator */}
        <div className="mb-9 flex gap-6 border-b border-[#ded6c8] pb-6 text-xs">
          {["Delivery details", "Review & payment"].map((label, index) => (
            <div
              key={label}
              className={`flex items-center gap-2 ${
                step === index + 1 ? "text-[#28251f] font-bold" : "text-stone-400"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                  step > index + 1
                    ? "border-[#111827] bg-[#111827] text-white"
                    : "border-current"
                }`}
              >
                {step > index + 1 ? <Check size={12} /> : index + 1}
              </span>
              {label}
            </div>
          ))}
        </div>

        {(submitError || cartError) && (
          <div
            role="alert"
            className="mb-6 border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800 rounded"
          >
            {submitError || cartError}
            {step === 2 && (
              <Link to="/orders" className="ml-2 underline font-semibold">
                View order history
              </Link>
            )}
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Main Form Section */}
          <section>
            {step === 1 ? (
              <form onSubmit={nextStep} className="space-y-7">
                <h2 className="flex items-center gap-3 font-serif text-2xl">
                  <MapPin size={20} strokeWidth={1.5} />
                  Where should we deliver?
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-stone-700">
                    Recipient's full name
                    <input
                      name="fullName"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={100}
                      value={form.fullName}
                      onChange={updateField}
                      className={inputClass}
                      placeholder="e.g. Ayesha Khan"
                    />
                  </label>
                  <label className="text-xs font-semibold text-stone-700">
                    Email address
                    <input
                      name="email"
                      autoComplete="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={updateField}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
                    Mobile number (for delivery SMS & PayFast)
                    <input
                      name="phone"
                      autoComplete="tel"
                      type="tel"
                      placeholder="0300 1234567"
                      required
                      value={form.phone}
                      onChange={updateField}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
                    Street address
                    <input
                      name="street"
                      autoComplete="street-address"
                      placeholder="House, apartment, street, area"
                      minLength={8}
                      maxLength={300}
                      required
                      value={form.street}
                      onChange={updateField}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-xs font-semibold text-stone-700">
                    City
                    <input
                      name="city"
                      autoComplete="address-level2"
                      required
                      value={form.city}
                      onChange={updateField}
                      className={inputClass}
                      placeholder="e.g. Lahore"
                    />
                  </label>
                  <label className="text-xs font-semibold text-stone-700">
                    Province / territory
                    <select
                      name="state"
                      autoComplete="address-level1"
                      required
                      value={form.state}
                      onChange={updateField}
                      className={inputClass}
                    >
                      <option value="">Select province</option>
                      {provinces.map((province) => (
                        <option key={province}>{province}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-stone-700">
                    Postal code <span className="text-stone-400 font-normal">(optional)</span>
                    <input
                      name="zip"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      value={form.zip}
                      onChange={updateField}
                      className={inputClass}
                      placeholder="54000"
                    />
                  </label>
                  <label className="text-xs font-semibold text-stone-700">
                    Country
                    <input
                      readOnly
                      value="Pakistan"
                      className={`${inputClass} text-stone-500 bg-stone-100`}
                    />
                  </label>
                  <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
                    Delivery notes <span className="text-stone-400 font-normal">(optional)</span>
                    <textarea
                      name="orderNotes"
                      rows={3}
                      maxLength={700}
                      value={form.orderNotes}
                      onChange={updateField}
                      className={inputClass}
                      placeholder="Gate instructions, landmark, or specific delivery preferences..."
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={cartLoading || invalidItems}
                  className="flex w-full items-center justify-between bg-[#111827] px-6 py-4 text-[11px] uppercase tracking-[0.17em] text-white hover:bg-black transition-colors disabled:bg-stone-300"
                >
                  <span>Review your order</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Delivery details summary */}
                <div className="border border-[#ded6c8] bg-white p-6 rounded">
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="font-serif text-2xl text-[#111827]">Delivery details</h2>
                    <button
                      disabled={submitting}
                      onClick={() => setStep(1)}
                      className="text-xs underline underline-offset-4 text-stone-600 hover:text-black font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm leading-7 text-stone-700">
                    <strong>{form.fullName}</strong>
                    <br />
                    {form.street}
                    <br />
                    {form.city}, {form.state} {form.zip}
                    <br />
                    Phone: {form.phone}
                    <br />
                    Email: {form.email}
                  </p>
                  {form.orderNotes && (
                    <p className="mt-4 border-t border-[#eee9df] pt-4 text-xs leading-6 text-stone-500">
                      <em>Note: {form.orderNotes}</em>
                    </p>
                  )}
                </div>

                {/* Payment Options Selection */}
                <div className="space-y-3">
                  <h2 className="font-serif text-2xl text-[#111827] mb-2">
                    Select Payment Method
                  </h2>

                  {/* Option 1: Cash on Delivery */}
                  <div
                    onClick={() => setSelectedPayment("cod")}
                    className={`p-5 rounded border cursor-pointer transition-all ${
                      selectedPayment === "cod"
                        ? "border-[#111827] bg-[#fcfbfa] ring-2 ring-[#111827]"
                        : "border-stone-200 bg-white hover:border-stone-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-[#111827]">
                        <Truck size={20} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-lg font-bold text-[#111827]">
                            Cash on Delivery (COD)
                          </h3>
                          {selectedPayment === "cod" && (
                            <CheckCircle2 size={19} className="text-emerald-600" />
                          )}
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          Pay in cash when your parcel arrives. Follow dispatch details in your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: PayFast Online Gateway */}
                  <div
                    onClick={() => setSelectedPayment("payfast")}
                    className={`p-5 rounded border cursor-pointer transition-all ${
                      selectedPayment === "payfast"
                        ? "border-[#111827] bg-[#fcfbfa] ring-2 ring-[#111827]"
                        : "border-stone-200 bg-white hover:border-stone-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#91751d] mt-0.5">
                        <CreditCard size={20} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-bold text-[#111827]">
                              PayFast Online Gateway
                            </h3>
                            <span className="bg-[#111827] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                              INSTANT PAY
                            </span>
                          </div>
                          {selectedPayment === "payfast" && (
                            <CheckCircle2 size={19} className="text-emerald-600" />
                          )}
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          Secure online checkout powered by PayFast. Supports Google Pay, Easypaisa, JazzCash, Debit/Credit Cards & Net Banking.
                        </p>

                        {/* Payment Badges Included */}
                        <div className="mt-3 pt-3 border-t border-stone-200 flex flex-wrap gap-2 items-center">
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-800 text-[10px] font-bold rounded border border-stone-200">
                            Google Pay
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200">
                            Easypaisa
                          </span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded border border-amber-200">
                            JazzCash
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-bold rounded border border-blue-200">
                            Visa / Mastercard
                          </span>
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-800 text-[10px] font-bold rounded border border-stone-200">
                            1Link Bank Transfer
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Action Button */}
                {selectedPayment === "cod" ? (
                  <button
                    disabled={submitting || cartLoading || invalidItems}
                    onClick={() => placeOrder("cod")}
                    className="flex w-full items-center justify-between bg-[#111827] px-6 py-5 text-[11px] uppercase tracking-[0.17em] text-white transition hover:bg-black disabled:bg-stone-300 rounded"
                  >
                    <span>
                      {submitting
                        ? "Placing your order..."
                        : `Place Order • ${money(total)}`}
                    </span>
                    {submitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <ArrowRight size={15} />
                    )}
                  </button>
                ) : (
                  <button
                    disabled={submitting || cartLoading || invalidItems}
                    onClick={() => setPayfastModalOpen(true)}
                    className="flex w-full items-center justify-between bg-[#d4af37] hover:bg-[#bfa030] text-black font-bold px-6 py-5 text-[11px] uppercase tracking-[0.17em] transition disabled:bg-stone-300 rounded shadow-md"
                  >
                    <span>
                      {submitting
                        ? "Connecting to PayFast..."
                        : `Pay via PayFast • ${money(total)}`}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            )}

            {invalidItems && (
              <p role="alert" className="mt-5 text-sm text-red-700">
                Please{" "}
                <Link to="/cart" className="underline font-semibold">
                  review your bag
                </Link>{" "}
                to sync saved pieces or update unavailable quantities.
              </p>
            )}
          </section>

          {/* Sidebar Order Summary */}
          <aside className="self-start border border-[#e2dacb] bg-white p-6 rounded lg:sticky lg:top-28">
            <h2 className="mb-5 flex items-center gap-2 font-serif text-2xl">
              <Package size={20} strokeWidth={1.5} />
              Your selection
            </h2>
            <div className="max-h-[420px] space-y-5 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={cartItemId(item)} className="flex gap-4">
                  <img
                    src={imageUrl(item.product?.images?.[0]) || placeholderImage}
                    onError={(event) => {
                      event.currentTarget.src = placeholderImage;
                    }}
                    alt={item.product?.title || "Product"}
                    className="h-24 w-18 bg-stone-100 object-cover rounded-xs"
                  />
                  <div className="flex-1 text-xs">
                    <p className="mb-1 font-medium leading-5 text-stone-900 line-clamp-2">
                      {item.product?.title || "Product unavailable"}
                    </p>
                    <p className="text-stone-500 font-mono text-[11px]">
                      {[item.size, item.color].filter(Boolean).join(" / ")}
                    </p>
                    <div className="mt-3 flex justify-between gap-2 items-center">
                      <span className="text-stone-500">Qty {item.quantity}</span>
                      <span className="font-bold text-stone-900 font-mono">
                        {money(cartItemPrice(item) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#e5decf] pt-6">
              <span className="font-serif text-xl font-bold">Order total</span>
              <span className="font-bold text-xl font-mono text-[#111827]">
                {money(total)}
              </span>
            </div>
            <p className="mt-5 flex gap-2 text-xs leading-5 text-stone-500">
              <Lock size={14} className="mt-0.5 shrink-0 text-stone-400" />
              Secure 256-bit SSL encrypted transaction with tracking updates.
            </p>
          </aside>
        </div>
      </div>

      {/* PayFast Interactive Modal */}
      {payfastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="bg-[#141410] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-bold font-mono text-sm">
                  PF
                </div>
                <div>
                  <h3 className="font-bold text-sm">PayFast Secured Gateway</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                    <ShieldCheck size={11} className="text-emerald-400" /> 256-Bit SSL Encrypted
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPayfastModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Total Due Banner */}
            <div className="bg-[#fafaf8] px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 uppercase tracking-wider font-mono">
                  Payable Amount:
                </span>
                <p className="font-serif text-2xl font-bold text-[#111827]">
                  {money(total)}
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#d4af37]/20 text-[#856b19] px-2 py-1 rounded">
                PAYFAST SECURED
              </span>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                onClick={() => setPayfastTab("wallets")}
                className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  payfastTab === "wallets"
                    ? "border-[#111827] text-[#111827] bg-white"
                    : "border-transparent text-stone-500 hover:text-black"
                }`}
              >
                <Smartphone size={14} /> Mobile Wallets
              </button>
              <button
                type="button"
                onClick={() => setPayfastTab("cards")}
                className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  payfastTab === "cards"
                    ? "border-[#111827] text-[#111827] bg-white"
                    : "border-transparent text-stone-500 hover:text-black"
                }`}
              >
                <CreditCard size={14} /> Cards
              </button>
              <button
                type="button"
                onClick={() => setPayfastTab("gpay")}
                className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  payfastTab === "gpay"
                    ? "border-[#111827] text-[#111827] bg-white"
                    : "border-transparent text-stone-500 hover:text-black"
                }`}
              >
                Google Pay
              </button>
              <button
                type="button"
                onClick={() => setPayfastTab("bank")}
                className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  payfastTab === "bank"
                    ? "border-[#111827] text-[#111827] bg-white"
                    : "border-transparent text-stone-500 hover:text-black"
                }`}
              >
                <Building2 size={14} /> Net Banking
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {payfastTab === "wallets" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayfastWallet("easypaisa")}
                      className={`p-3 rounded border text-left transition-all ${
                        payfastWallet === "easypaisa"
                          ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600"
                          : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <span className="block font-bold text-xs text-emerald-800">
                        Easypaisa
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Telenor Microfinance
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayfastWallet("jazzcash")}
                      className={`p-3 rounded border text-left transition-all ${
                        payfastWallet === "jazzcash"
                          ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-600"
                          : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <span className="block font-bold text-xs text-amber-800">
                        JazzCash
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Mobilink Microfinance
                      </span>
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {payfastWallet === "easypaisa" ? "Easypaisa" : "JazzCash"} Mobile Number:
                    </label>
                    <input
                      type="tel"
                      placeholder="0300 1234567"
                      defaultValue={form.phone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      className="w-full border border-stone-300 rounded px-3 py-2 text-sm outline-none focus:border-[#111827]"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      You will receive an in-app approval prompt or USSD pin screen to authorize {money(total)}.
                    </p>
                  </div>
                </div>
              )}

              {payfastTab === "cards" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      defaultValue={form.fullName}
                      className="w-full border border-stone-300 rounded px-3 py-2 text-sm outline-none focus:border-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength={19}
                      defaultValue="4242 •••• •••• 4242"
                      className="w-full border border-stone-300 rounded px-3 py-2 text-sm outline-none focus:border-[#111827] font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        defaultValue="12/28"
                        className="w-full border border-stone-300 rounded px-3 py-2 text-sm outline-none focus:border-[#111827] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        defaultValue="123"
                        className="w-full border border-stone-300 rounded px-3 py-2 text-sm outline-none focus:border-[#111827] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {payfastTab === "gpay" && (
                <div className="space-y-4 text-center py-4">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-stone-100 text-stone-800 mb-1">
                    <CreditCard size={28} />
                  </div>
                  <h4 className="font-bold text-sm text-stone-800">
                    Pay with Google Pay via PayFast
                  </h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    One-tap checkout with your cards securely saved in Google Pay.
                  </p>
                  <button
                    type="button"
                    onClick={() => placeOrder("payfast")}
                    disabled={submitting}
                    className="w-full py-3 bg-black hover:bg-stone-900 text-white rounded font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>GPay • {money(total)}</span>
                  </button>
                </div>
              )}

              {payfastTab === "bank" && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Select Your Bank (1Link Direct Debit):
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm outline-none focus:border-[#111827]"
                  >
                    <option>Meezan Bank</option>
                    <option>Habib Bank Limited (HBL)</option>
                    <option>Bank Alfalah</option>
                    <option>United Bank Limited (UBL)</option>
                    <option>Standard Chartered Pakistan</option>
                    <option>MCB Bank</option>
                    <option>Faysal Bank</option>
                  </select>
                  <p className="text-[11px] text-stone-500">
                    You will be securely redirected to {selectedBank}&apos;s online portal to authorize your transfer.
                  </p>
                </div>
              )}

              {/* Sandbox Notice */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 leading-relaxed">
                🔒 <strong>PayFast Sandbox Ready:</strong> Live credentials can be configured anytime in the dashboard. Clicking &quot;Authorize & Confirm&quot; will simulate full transaction approval and place your order.
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setPayfastModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-black border border-stone-300 rounded bg-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => placeOrder("payfast")}
                className="flex-1 px-5 py-2.5 text-xs font-bold text-black uppercase tracking-wider bg-[#d4af37] hover:bg-[#bfa030] rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    <span>Authorize & Confirm ({money(total)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
