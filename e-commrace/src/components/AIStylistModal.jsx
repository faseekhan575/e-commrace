import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { CLOTHING_PRODUCTS } from "../data/clothingData";
import {
  Sparkles, X, Send, Bot, User, ShoppingBag, ArrowRight,
  Heart, Check, Wand2, Compass, Tag, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

const STYLIST_PROMPTS = [
  { label: "🌸 Summer Daily Wear under PKR 5,000", prompt: "I need a comfortable and stylish printed lawn or cambric kurta for daily summer office wear under 5,000." },
  { label: "✨ Royal Wedding Guest Look", prompt: "Suggest an opulent festive raw silk or micro velvet outfit for an evening wedding." },
  { label: "👗 Minimalist Monochrome Co-Ord", prompt: "I love modern minimalist fashion. Show me contemporary textured co-ords or straight cuts." },
  { label: "🧣 Silk & Organza Dupattas", prompt: "What luxury shawls or dupattas do you have to pair with solid kurtas?" },
];

export default function AIStylistModal() {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: "stylist",
      text: "Welcome to Clothing Den! ✨ I am your personal **Haute Couture AI Stylist**. Tell me your occasion, favorite colors, or budget, and I'll curate the perfect look for you from our luxury collections.",
      recommendations: CLOTHING_PRODUCTS.slice(0, 2),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    // Add User Message
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // AI Semantic Stylist Engine matching real products
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matchedProducts = [];
      let stylistReply = "";

      if (lower.includes("wedding") || lower.includes("festive") || lower.includes("formal") || lower.includes("velvet") || lower.includes("party")) {
        matchedProducts = CLOTHING_PRODUCTS.filter((p) =>
          p.tags.includes("velvet") || p.tags.includes("festive") || p.tags.includes("silk") || p.tags.includes("formal")
        );
        stylistReply = "For an unforgettable festive soirée, I recommend rich jewel tones like Midnight Plum Velvet or Royal Sapphire Raw Silk. Pair with antique zari embroidery and finished Pico dupattas for pure elegance:";
      } else if (lower.includes("summer") || lower.includes("lawn") || lower.includes("daily") || lower.includes("cambric") || lower.includes("office")) {
        matchedProducts = CLOTHING_PRODUCTS.filter((p) =>
          p.tags.includes("lawn") || p.tags.includes("cambric") || p.tags.includes("summer") || p.tags.includes("pret")
        );
        stylistReply = "For effortless daily summer elegance, breathable 100% fine Swiss Lawn and printed Cambric Kurtas with intricate lace trims are supreme:";
      } else if (lower.includes("co-ord") || lower.includes("fusion") || lower.includes("minimal") || lower.includes("west")) {
        matchedProducts = CLOTHING_PRODUCTS.filter((p) =>
          p.tags.includes("co-ord") || p.tags.includes("jacquard") || p.tags.includes("fusion")
        );
        stylistReply = "Here are our signature minimalist textured co-ord sets tailored in woven Jacquard with relaxed modern culottes:";
      } else if (lower.includes("shawl") || lower.includes("dupatta") || lower.includes("wrap")) {
        matchedProducts = CLOTHING_PRODUCTS.filter((p) =>
          p.tags.includes("shawl") || p.tags.includes("dupatta") || p.tags.includes("organza")
        );
        stylistReply = "A statement handcrafted organza or chiffon wrap with antique gota scalloped borders instantly transforms any solid kurta into royal luxury:";
      } else {
        matchedProducts = CLOTHING_PRODUCTS.slice(0, 3);
        stylistReply = "Here is an exclusive handpicked selection from our newest Festive & Pret drop curated specifically to your taste:";
      }

      if (matchedProducts.length === 0) matchedProducts = CLOTHING_PRODUCTS.slice(0, 2);

      setMessages((prev) => [
        ...prev,
        {
          sender: "stylist",
          text: stylistReply,
          recommendations: matchedProducts.slice(0, 3),
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAdd = async (product) => {
    try {
      await dispatch(
        addToCart({
          product,
          productId: product._id,
          quantity: 1,
          size: product.sizes ? product.sizes[1] || product.sizes[0] : "M",
        })
      );
      toast.success(`Added ${product.title} to your bag!`);
    } catch (e) {
      toast.error("Could not add to bag");
    }
  };

  return (
    <>
      {/* ── Floating AI Stylist Trigger Badge ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#141410] hover:bg-black text-[#f5f5f0] border border-[#d4af37]/60 rounded-full shadow-2xl hover:scale-105 transition-all group"
        aria-label="Open AI Virtual Stylist"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f7e08b] flex items-center justify-center text-black font-black text-xs group-hover:rotate-12 transition-transform">
          <Sparkles size={15} />
        </div>
        <div className="text-left pr-1 hidden sm:block">
          <p className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider font-bold leading-none">Den AI Lookbook</p>
          <p className="text-xs font-serif font-bold text-white leading-none mt-0.5">Virtual Stylist</p>
        </div>
      </button>

      {/* ── AI Stylist Interactive Chat & Recommendation Drawer ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#fafaf8] text-[#141410] w-full sm:max-w-lg h-[92vh] sm:h-[82vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#e8e8e0] relative animate-in slide-in-from-bottom">

            {/* Header */}
            <div className="bg-[#141410] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#2e2e26]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f7e08b] flex items-center justify-center text-black font-bold shadow-md">
                  <Wand2 size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-white tracking-wide">Den AI Stylist</h3>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 rounded-full font-bold">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a0a090]">Haute Couture & Outfit Matchmaker</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="bg-white border-b border-[#e8e8e0] p-2.5 overflow-x-auto custom-scrollbar flex gap-2 flex-shrink-0">
              {STYLIST_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  className="whitespace-nowrap px-3 py-1 bg-[#f5f5f0] hover:bg-[#141410] hover:text-white rounded-full text-[11px] font-medium text-[#555] transition-all border border-gray-200"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((msg, mIdx) => (
                <div
                  key={mIdx}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "stylist" && (
                    <div className="w-8 h-8 rounded-full bg-[#141410] text-[#d4af37] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold shadow-sm">
                      ✨
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#141410] text-white rounded-tr-none font-medium"
                        : "bg-white border border-[#e8e8e0] text-[#222] rounded-tl-none shadow-xs"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Recommendations Gallery Cards */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-3.5 space-y-2.5 pt-3 border-t border-gray-100">
                        <p className="text-[10px] font-bold font-mono text-[#78786a] uppercase tracking-wider">
                          Recommended Pieces:
                        </p>
                        <div className="space-y-2">
                          {msg.recommendations.map((prod) => (
                            <div
                              key={prod._id}
                              className="flex items-center gap-3 p-2 bg-[#fafaf8] border border-[#e8e8e0] rounded-xl hover:border-black transition-colors"
                            >
                              <img
                                src={prod.images?.[0]?.url || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb"}
                                alt={prod.title}
                                className="w-12 h-14 object-cover object-top rounded-lg flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <Link
                                  to={`/product/${prod._id}`}
                                  onClick={() => setIsOpen(false)}
                                  className="font-serif text-xs font-bold text-black truncate block hover:text-[#d4af37]"
                                >
                                  {prod.title}
                                </Link>
                                <p className="text-[10px] text-gray-500 font-mono truncate">{prod.fabric}</p>
                                <p className="text-xs font-bold text-[#141410] font-mono mt-0.5">
                                  PKR {(prod.discountPrice || prod.price).toLocaleString()}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleQuickAdd(prod)}
                                className="p-2 bg-[#141410] hover:bg-black text-[#d4af37] rounded-lg text-xs font-bold transition-transform active:scale-95 flex-shrink-0"
                                title="Add to Bag"
                              >
                                <ShoppingBag size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 items-center text-gray-400 text-xs pl-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center animate-pulse text-[10px]">✨</div>
                  <span className="italic font-serif">Den AI Stylist is crafting suggestions...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-[#e8e8e0]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask for an outfit, event advice, or size pairing..."
                  className="flex-1 px-4 py-3 bg-[#f5f5f0] border border-gray-200 rounded-xl text-xs text-black outline-none focus:border-black font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-[#141410] hover:bg-black text-[#d4af37] rounded-xl transition-all disabled:opacity-40"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
