import { useState } from "react";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/v1/contact", form); // Assuming you have this endpoint
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fafaf8] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#78786a] mb-3">Get In Touch</p>
          <h1 className="font-display text-6xl font-700 text-[#1a1a14] leading-none">We're here to help</h1>
          <p className="mt-4 text-lg text-[#78786a] max-w-md mx-auto">
            Have questions? Want to know more about a product? Reach out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#e8e8e0] rounded-3xl p-10">
              <h2 className="font-display text-3xl font-700 mb-8">Send us a message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-2 text-[#78786a] uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 rounded-2xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-[#78786a] uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 rounded-2xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2 text-[#78786a] uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none transition-colors"
                    placeholder="Product Inquiry / Support / Partnership"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2 text-[#78786a] uppercase tracking-wider">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={8}
                    className="w-full px-5 py-4 rounded-3xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none resize-none transition-colors"
                    placeholder="How can we help you today?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[#1a1a14] hover:bg-[#3c3c30] text-white rounded-2xl font-semibold text-lg transition-all disabled:opacity-70"
                >
                  {loading ? "Sending..." : "Send Message"}
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white border border-[#e8e8e0] rounded-3xl p-10">
              <h3 className="font-semibold text-2xl mb-8">Get in touch</h3>

              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] flex items-center justify-center flex-shrink-0">
                    <Mail size={24} className="text-[#1a1a14]" />
                  </div>
                  <div>
                    <p className="font-medium">Email Us</p>
                    <a href="mailto:support@vault.pk" className="text-[#78786a] hover:text-[#1a1a14] transition-colors">
                      support@vault.pk
                    </a>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] flex items-center justify-center flex-shrink-0">
                    <Phone size={24} className="text-[#1a1a14]" />
                  </div>
                  <div>
                    <p className="font-medium">Call Us</p>
                    <a href="tel:+923001234567" className="text-[#78786a] hover:text-[#1a1a14] transition-colors">
                      +92 300 1234567
                    </a>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f5f0] flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} className="text-[#1a1a14]" />
                  </div>
                  <div>
                    <p className="font-medium">Visit Us</p>
                    <p className="text-[#78786a]">
                      123 Vault Tower, MM Alam Road<br />
                      Lahore, Pakistan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a14] text-white rounded-3xl p-10">
              <p className="text-[#a8a898] text-sm uppercase tracking-wider mb-3">Business Hours</p>
              <div className="space-y-2 text-lg">
                <p>Monday - Saturday: <span className="font-medium">9:00 AM - 8:00 PM</span></p>
                <p>Sunday: <span className="font-medium">Closed</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}