import { useState } from "react";
import { X, ShieldCheck, Lock, Truck, Tag, RotateCcw, FileText, CheckCircle2 } from "lucide-react";

export default function FooterPolicyModal({ policyType, onClose }) {
  if (!policyType) return null;

  const policies = {
    payment: {
      title: "Payment Security & Multi-Gateway Policy",
      subtitle: "Bank-Grade 256-Bit SSL Encryption & Verified Financial Channels",
      icon: <Lock className="text-amber-400" size={24} />,
      content: (
        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
            <ShieldCheck className="text-amber-400 shrink-0 mt-0.5" size={18} />
            <p className="text-amber-200">
              Clothing Den adheres to <strong>PCI-DSS Level 1 Compliance</strong>. All online transactions are routed through end-to-end tokenized gateways.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-1.5 text-xs">Supported Payment Methods</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <li className="p-2 bg-neutral-900 border border-neutral-800 rounded">
                <span className="text-amber-400 font-bold block">💵 Cash on Delivery (COD)</span>
                Pay in cash directly to our rider/courier upon receiving your tamper-sealed parcel.
              </li>
              <li className="p-2 bg-neutral-900 border border-neutral-800 rounded">
                <span className="text-emerald-400 font-bold block">📱 Easypaisa & JazzCash</span>
                Instant OTC mobile wallet payments & QR code authorization.
              </li>
              <li className="p-2 bg-neutral-900 border border-neutral-800 rounded">
                <span className="text-blue-400 font-bold block">💳 Visa / Mastercard / UnionPay</span>
                3D Secure OTP verification directly with your issuing bank.
              </li>
              <li className="p-2 bg-neutral-900 border border-neutral-800 rounded">
                <span className="text-purple-400 font-bold block">⚡ SadaPay, NayaPay & Raast</span>
                Instant zero-fee IBFT bank transfers via 1LINK & State Bank Raast.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-1 text-xs">Zero Card Storage Commitment</h4>
            <p className="text-neutral-400">
              We never store your card numbers, CVVs, or bank login credentials on our servers. All sensitive data is transmitted directly to banking endpoints with dynamic encryption.
            </p>
          </div>
        </div>
      ),
    },

    privacy: {
      title: "Customer Privacy & Data Protection",
      subtitle: "Your Personal Information is Strictly Guarded & Encrypted",
      icon: <ShieldCheck className="text-emerald-400" size={24} />,
      content: (
        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
          <p>
            At Clothing Den, your privacy is our highest priority. We treat your personal, address, and shopping details with utmost confidentiality.
          </p>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">What Information We Collect</h4>
            <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px]">
              <li><strong>Contact Info:</strong> Name, email address, phone number for courier dispatch SMS & tracking notifications.</li>
              <li><strong>Delivery Address:</strong> House number, street, city, postal code to ensure swift parcel delivery.</li>
              <li><strong>Shopping Bag & Preferences:</strong> Saved sizing, favorites, and cart history to streamline your checkout experience.</li>
            </ul>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-xs mb-1">Our Strict Privacy Guarantee</h4>
            <p className="text-[11px] text-neutral-400">
              We <strong>NEVER</strong> sell, rent, or trade your contact details with external advertisers or third-party marketing brokers. Your information is solely used to fulfill your orders and provide VIP concierge assistance.
            </p>
          </div>
        </div>
      ),
    },

    shipping: {
      title: "Biker Fleet, Express Shipping & Delivery Network",
      subtitle: "City-Wide Fast Biker Couriers & Nationwide Logistics Grid",
      icon: <Truck className="text-blue-400" size={24} />,
      content: (
        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider text-xs mb-1">🏍️ Same-Day City Biker Delivery</h4>
              <p className="text-[11px] text-neutral-400">
                Available in <strong>Lahore, Karachi, Islamabad & Rawalpindi</strong>. Dedicated dedicated motorcycle courier fleet delivers urgent orders in 4–6 hours.
              </p>
            </div>
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-xs mb-1">🚚 Nationwide Express (24-48h)</h4>
              <p className="text-[11px] text-neutral-400">
                Partnered with <strong>TCS, Leopards Courier, Trax, and CallCourier</strong> with real-time SMS & email tracking updates.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-1.5">Shipping Rates & Thresholds</h4>
            <ul className="space-y-1 text-[11px] text-neutral-400">
              <li>• <strong>Standard Delivery:</strong> Flat PKR 250 nationwide.</li>
              <li>• <strong>FREE Delivery:</strong> On all orders above PKR 5,000 across Pakistan!</li>
              <li>• <strong>Security Seal:</strong> Every parcel is packed in a heavy-duty, tamper-evident security flyer with high-grade tamper seals.</li>
            </ul>
          </div>
        </div>
      ),
    },

    vouchers: {
      title: "Discount Coupons & Promo Codes Guidelines",
      subtitle: "Official Clothing Den VIP Vouchers & Festive Rebates",
      icon: <Tag className="text-rose-400" size={24} />,
      content: (
        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
          <p>
            Apply valid coupon codes on the <strong>Cart & Checkout pages</strong> to receive instant deductions on your luxury couture orders.
          </p>

          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <h4 className="font-bold text-rose-300 uppercase tracking-wider text-xs mb-2">🎁 Current Active Promo Vouchers</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-neutral-900 border border-neutral-800 rounded flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-rose-400 block">LUXURY10</span>
                  <span className="text-neutral-400 text-[10px]">10% Flat Discount on all items</span>
                </div>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-mono text-[10px]">ACTIVE</span>
              </div>

              <div className="p-2 bg-neutral-900 border border-neutral-800 rounded flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-amber-400 block">EID2026</span>
                  <span className="text-neutral-400 text-[10px]">PKR 1,500 off on Festive Orders</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono text-[10px]">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-neutral-400">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Voucher Terms:</h4>
            <p>• Only one promotional voucher code can be applied per checkout session.</p>
            <p>• Vouchers are valid across all unstitched, ready-to-wear, and luxury pret collections.</p>
          </div>
        </div>
      ),
    },

    returns: {
      title: "7-Day Hassle-Free Exchange & Return Policy",
      subtitle: "Doorstep Exchange Pickup & 100% Quality Fabric Assurance",
      icon: <RotateCcw className="text-amber-400" size={24} />,
      content: (
        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
          <p>
            We take pride in exceptional Eastern craftsmanship. If you need a size replacement or style swap, our concierge team is here to assist you effortlessly.
          </p>

          <div className="space-y-2 text-[11px] text-neutral-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>7-Day Window:</strong> Initiate an exchange within 7 days of receiving your parcel.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Doorstep Rider Pickup:</strong> Our delivery rider will pick up the package from your doorstep and swap the size.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Conditions:</strong> Garments must be unworn, unwashed, with original Clothing Den tags intact.</span>
            </div>
          </div>
        </div>
      ),
    },
  };

  const activeData = policies[policyType] || policies.payment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#141410] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
              {activeData.icon}
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                {activeData.title}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {activeData.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {activeData.content}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono">
            Official Clothing Den Policy Document
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#d4af37] text-neutral-950 font-bold text-xs rounded-lg hover:bg-white transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
