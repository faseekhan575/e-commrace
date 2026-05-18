import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct, fetchCategories } from "../../store/productsSlice";
import {
  Upload, X, Plus, Tag, Package, DollarSign,
  Hash, FileText, Image, ChevronRight, CheckCircle,
  AlertCircle, Layers, ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Details", "Pricing", "Media", "Review"];

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const s = {
  card: {
    background: "#0c0c0c",
    border: "1px solid #1a1a1a",
    borderRadius: 16,
    overflow: "hidden",
  },
  label: {
    display: "block",
    fontSize: 10,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#444",
    marginBottom: 8,
  },
  inp: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #1a1a1a",
    background: "#080808",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color .2s",
  },
  btnWhite: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: 10,
    background: "#fff",
    color: "#000",
    fontWeight: 600,
    fontSize: 13,
    border: "none",
    cursor: "pointer",
    transition: "opacity .15s",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: 10,
    background: "transparent",
    color: "#888",
    fontWeight: 500,
    fontSize: 13,
    border: "1px solid #1a1a1a",
    cursor: "pointer",
    transition: "border-color .2s, color .2s",
  },
};

function ErrMsg({ msg }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: 11, color: "#ef4444", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
      <AlertCircle size={11} />{msg}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminCreateProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories } = useSelector((st) => st.products);
  const { role } = useSelector((st) => st.auth);
  const basePath = role === "superadmin" ? "/superadmin" : "/admin";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: "", description: "", price: "",
    discountPrice: "", stock: "", category: "", tags: [],
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags.includes(t)) { setTagInput(""); return; }
    set("tags", [...form.tags, t]);
    setTagInput("");
  };
  const removeTag = (tag) => set("tags", form.tags.filter((t) => t !== tag));

  const handleImage = (file) => {
    if (!file || !file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.title.trim()) e.title = "Title is required";
      if (!form.description.trim()) e.description = "Description is required";
      if (!form.category) e.category = "Category is required";
    }
    if (step === 1) {
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Valid price required";
      if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = "Valid stock required";
      if (form.discountPrice && Number(form.discountPrice) >= Number(form.price))
        e.discountPrice = "Discount must be less than price";
    }
    if (step === 2) {
      if (!imageFile) e.image = "At least one product image is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 3)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("price", form.price);
      if (form.discountPrice) fd.append("discountPrice", form.discountPrice);
      fd.append("stock", form.stock);
      fd.append("category", form.category);
      if (form.tags.length > 0) fd.append("tags", form.tags.join(","));
      if (imageFile) fd.append("image", imageFile);

      const res = await dispatch(createProduct(fd));
      if (createProduct.fulfilled.match(res)) {
        toast.success("Product created successfully!");
        navigate(`${basePath}/products`);
      } else {
        toast.error(res.payload || "Failed to create product");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const discount = form.price && form.discountPrice
    ? Math.round(((Number(form.price) - Number(form.discountPrice)) / Number(form.price)) * 100)
    : null;

  const inputStyle = (key) => ({
    ...s.inp,
    borderColor: errors[key] ? "#ef4444" : form[key] ? "#333" : "#1a1a1a",
  });

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 80, color: "#fff", fontFamily: "inherit" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate(`${basePath}/products`)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#444", background: "none",
            border: "none", cursor: "pointer", marginBottom: 16, padding: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#444"}
        >
          <ArrowLeft size={13} /> Back to Products
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>Create Product</h1>
        <p style={{ fontSize: 13, color: "#444", marginTop: 6 }}>Fill in the details to add a new product.</p>
      </div>

      {/* ── Step Indicator ── */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                onClick={() => i < step && setStep(i)}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  border: `2px solid ${i <= step ? "#fff" : "#1a1a1a"}`,
                  background: i < step ? "#fff" : i === step ? "#111" : "transparent",
                  color: i < step ? "#000" : i === step ? "#fff" : "#333",
                  cursor: i < step ? "pointer" : "default",
                  transition: "all .3s",
                }}
              >
                {i < step ? <CheckCircle size={15} color="#000" /> : i + 1}
              </div>
              <span style={{
                fontSize: 9, marginTop: 6,
                fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em",
                color: i === step ? "#fff" : i < step ? "#555" : "#2a2a2a",
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 1, marginBottom: 18, marginLeft: 8, marginRight: 8,
                background: i < step ? "#fff" : "#1a1a1a",
                transition: "background .4s",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Card ── */}
      <div style={s.card}>

        {/* STEP 0 — Details */}
        {step === 0 && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <FileText size={15} color="#fff" />
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Product Details</h2>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>Title <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max"
                style={inputStyle("title")}
                onFocus={(e) => e.target.style.borderColor = "#fff"}
                onBlur={(e) => e.target.style.borderColor = errors.title ? "#ef4444" : form.title ? "#333" : "#1a1a1a"}
              />
              <ErrMsg msg={errors.title} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>Description <span style={{ color: "#ef4444" }}>*</span></label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the product…"
                style={{ ...inputStyle("description"), resize: "none" }}
                onFocus={(e) => e.target.style.borderColor = "#fff"}
                onBlur={(e) => e.target.style.borderColor = errors.description ? "#ef4444" : form.description ? "#333" : "#1a1a1a"}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <ErrMsg msg={errors.description} />
                <span style={{ fontSize: 10, color: "#2a2a2a", marginLeft: "auto" }}>{form.description.length}</span>
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>Category <span style={{ color: "#ef4444" }}>*</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => set("category", cat._id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${form.category === cat._id ? "#fff" : "#1a1a1a"}`,
                      background: form.category === cat._id ? "#111" : "transparent",
                      color: form.category === cat._id ? "#fff" : "#444",
                      fontSize: 12, fontWeight: 500,
                      cursor: "pointer", transition: "all .2s",
                    }}
                  >
                    {cat.image?.url && <img src={cat.image.url} style={{ width: 18, height: 18, borderRadius: 4, objectFit: "cover" }} alt="" />}
                    <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                    {form.category === cat._id && <CheckCircle size={11} color="#fff" />}
                  </button>
                ))}
              </div>
              <ErrMsg msg={errors.category} />
            </div>

            {/* Tags */}
            <div>
              <label style={s.label}>Tags</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Type a tag + Enter"
                  style={{ ...s.inp, flex: 1 }}
                  onFocus={(e) => e.target.style.borderColor = "#fff"}
                  onBlur={(e) => e.target.style.borderColor = "#1a1a1a"}
                />
                <button
                  type="button"
                  onClick={addTag}
                  style={{ ...s.btnGhost, padding: "10px 14px" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#888"; }}
                >
                  <Plus size={15} />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {form.tags.map((tag) => (
                    <span key={tag} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "5px 12px", borderRadius: 999,
                      background: "#111", border: "1px solid #222",
                      color: "#888", fontSize: 12,
                    }}>
                      <Tag size={9} />{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: 0, display: "flex" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#555"}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1 — Pricing */}
        {step === 1 && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <DollarSign size={15} color="#fff" />
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Pricing & Stock</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Price */}
              <div>
                <label style={s.label}>Price (₨) <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#444", fontFamily: "monospace" }}>₨</span>
                  <input
                    type="number" min="0"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="250000"
                    style={{ ...inputStyle("price"), paddingLeft: 34 }}
                    onFocus={(e) => e.target.style.borderColor = "#fff"}
                    onBlur={(e) => e.target.style.borderColor = errors.price ? "#ef4444" : form.price ? "#333" : "#1a1a1a"}
                  />
                </div>
                <ErrMsg msg={errors.price} />
              </div>

              {/* Discount */}
              <div>
                <label style={s.label}>Discount Price (₨) <span style={{ color: "#2a2a2a" }}>optional</span></label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#444", fontFamily: "monospace" }}>₨</span>
                  <input
                    type="number" min="0"
                    value={form.discountPrice}
                    onChange={(e) => set("discountPrice", e.target.value)}
                    placeholder="230000"
                    style={{ ...inputStyle("discountPrice"), paddingLeft: 34 }}
                    onFocus={(e) => e.target.style.borderColor = "#fff"}
                    onBlur={(e) => e.target.style.borderColor = errors.discountPrice ? "#ef4444" : form.discountPrice ? "#333" : "#1a1a1a"}
                  />
                </div>
                <ErrMsg msg={errors.discountPrice} />
                {discount > 0 && !errors.discountPrice && (
                  <p style={{ fontSize: 11, color: "#34d399", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={11} /> {discount}% off applied
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label style={s.label}>Stock <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <Hash size={13} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#444" }} />
                  <input
                    type="number" min="0"
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    placeholder="10"
                    style={{ ...inputStyle("stock"), paddingLeft: 34 }}
                    onFocus={(e) => e.target.style.borderColor = "#fff"}
                    onBlur={(e) => e.target.style.borderColor = errors.stock ? "#ef4444" : form.stock ? "#333" : "#1a1a1a"}
                  />
                </div>
                <ErrMsg msg={errors.stock} />
              </div>
            </div>

            {/* Preview */}
            {form.price && (
              <div style={{
                marginTop: 20, padding: "18px 20px",
                borderRadius: 12, border: "1px solid #1a1a1a",
                background: "#080808",
              }}>
                <p style={{ ...s.label, marginBottom: 12 }}>Price preview</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  {form.discountPrice && Number(form.discountPrice) < Number(form.price) ? (
                    <>
                      <span style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>
                        ₨ {Number(form.discountPrice).toLocaleString()}
                      </span>
                      <span style={{ fontSize: 15, color: "#333", textDecoration: "line-through" }}>
                        ₨ {Number(form.price).toLocaleString()}
                      </span>
                      <span style={{
                        padding: "3px 10px", borderRadius: 999, fontSize: 11,
                        fontWeight: 700, background: "#fff", color: "#000",
                      }}>-{discount}%</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>
                      ₨ {Number(form.price).toLocaleString()}
                    </span>
                  )}
                </div>
                {form.stock && (
                  <p style={{ fontSize: 12, color: "#444", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <Layers size={11} /> {form.stock} units in stock
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Media */}
        {step === 2 && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <Image size={15} color="#fff" />
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Product Image</h2>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleImage(f); }}
              onClick={() => !imagePreview && fileRef.current?.click()}
              style={{
                borderRadius: 14,
                border: `2px dashed ${dragOver ? "#fff" : imagePreview ? "#fff" : "#222"}`,
                background: dragOver ? "#111" : "transparent",
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: imagePreview ? "default" : "pointer",
                transition: "border-color .2s, background .2s",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {imagePreview ? (
                <div style={{ position: "relative", width: "100%" }}>
                  <img src={imagePreview} alt="preview" style={{ width: "100%", height: 280, objectFit: "contain", padding: 16, boxSizing: "border-box" }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                    opacity: 0, transition: "opacity .2s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                  >
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                      style={{ ...s.btnWhite }}
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                      style={{ ...s.btnGhost, borderColor: "#fff", color: "#fff" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 32 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    border: "1px solid #222", background: "#0d0d0d",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Upload size={24} color="#444" />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#fff", fontWeight: 500, margin: 0, marginBottom: 6 }}>Drop image or click to upload</p>
                    <p style={{ fontSize: 11, color: "#444", margin: 0 }}>PNG, JPG, WEBP supported</p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }}
            />

            {imageFile && (
              <p style={{ fontSize: 11, color: "#34d399", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={12} /> Image selected — will upload on create
              </p>
            )}
            <ErrMsg msg={errors.image} />
          </div>
        )}

        {/* STEP 3 — Review */}
        {step === 3 && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <Package size={15} color="#fff" />
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Review & Create</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {imagePreview && (
                <div style={{
                  borderRadius: 14, overflow: "hidden",
                  border: "1px solid #1a1a1a",
                  aspectRatio: "1",
                  background: "#080808",
                }}>
                  <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <p style={s.label}>Title</p>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 16, margin: 0 }}>{form.title}</p>
                </div>
                <div>
                  <p style={s.label}>Category</p>
                  <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
                    {categories.find((c) => c._id === form.category)?.name || "—"}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  {form.discountPrice && Number(form.discountPrice) < Number(form.price) ? (
                    <>
                      <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                        ₨ {Number(form.discountPrice).toLocaleString()}
                      </span>
                      <span style={{ fontSize: 13, color: "#333", textDecoration: "line-through" }}>
                        ₨ {Number(form.price).toLocaleString()}
                      </span>
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#fff", color: "#000" }}>
                        -{discount}%
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                      ₨ {Number(form.price || 0).toLocaleString()}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: Number(form.stock) > 0 ? "#34d399" : "#ef4444" }} />
                  <span style={{ fontSize: 12, color: "#888" }}>{form.stock} units in stock</span>
                </div>
                {form.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {form.tags.map((tag) => (
                      <span key={tag} style={{
                        padding: "4px 10px", borderRadius: 999,
                        background: "#111", border: "1px solid #1a1a1a",
                        color: "#555", fontSize: 11,
                      }}>#{tag}</span>
                    ))}
                  </div>
                )}
                <div>
                  <p style={s.label}>Description</p>
                  <p style={{
                    color: "#555", fontSize: 13, lineHeight: 1.6, margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {form.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Create button */}
            <div style={{
              marginTop: 28, paddingTop: 20,
              borderTop: "1px solid #1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "flex-end",
            }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ ...s.btnWhite, opacity: loading ? 0.6 : 1, minWidth: 160, justifyContent: "center" }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 14, height: 14,
                      border: "2px solid rgba(0,0,0,0.3)",
                      borderTopColor: "#000",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    Creating…
                  </>
                ) : (
                  <><CheckCircle size={15} /> Create Product</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        {step < 3 && (
          <div style={{
            padding: "16px 32px 24px",
            borderTop: "1px solid #1a1a1a",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <button
              onClick={prevStep}
              disabled={step === 0}
              style={{ ...s.btnGhost, opacity: step === 0 ? 0.3 : 1 }}
            >
              Back
            </button>

            <div style={{ display: "flex", gap: 6 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  height: 5, borderRadius: 999,
                  background: i === step ? "#fff" : i < step ? "#333" : "#1a1a1a",
                  width: i === step ? 20 : 5,
                  transition: "all .3s",
                }} />
              ))}
            </div>

            <button onClick={nextStep} style={s.btnWhite}>
              Continue <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}