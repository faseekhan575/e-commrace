import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateProduct, fetchProduct, fetchCategories } from "../../store/productsSlice";
import axios from "axios";
import {
  Upload, X, Plus, Tag, Package, DollarSign,
  Hash, FileText, Image, ChevronRight, CheckCircle,
  AlertCircle, Layers, ArrowLeft, Star, Trash2,
  ImagePlus, Crown
} from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Details", "Pricing", "Media", "Review"];

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const s = {
  // base card
  card: {
    background: "#0c0c0c",
    border: "1px solid #1a1a1a",
    borderRadius: 16,
    overflow: "hidden",
  },
  // mono label
  label: {
    display: "block",
    fontSize: 10,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#444",
    marginBottom: 8,
  },
  // input
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
  // white button
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
  // ghost button
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

// ─── Image Manager (Step 2) ───────────────────────────────────────────────────
function ImageManager({ productId, existingImages = [], onImagesChange }) {
  const [images, setImages] = useState(existingImages); // [{url, public_id}]
  const [mainIdx, setMainIdx] = useState(0);
  const [deleting, setDeleting] = useState(null); // public_id being deleted
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [newFiles, setNewFiles] = useState([]); // queued local files not yet uploaded
  const addRef = useRef();

  // sync up when existing images change on first load
  useEffect(() => {
    if (existingImages.length && !images.length) {
      setImages(existingImages);
    }
  }, [existingImages]);

  // bubble state up whenever images or mainIdx changes
  useEffect(() => {
    onImagesChange({ images, mainIdx });
  }, [images, mainIdx]);

  // ── delete one image via API ──
  const handleDelete = async (img, idx) => {
    if (images.length === 1) {
      toast.error("Product must have at least one image");
      return;
    }
    setDeleting(img.public_id);
    try {
      await axios.delete(`/api/v3/product/${productId}/image/delete`, {
        data: { public_id: img.public_id },
        withCredentials: true,
      });
      const next = images.filter((_, i) => i !== idx);
      setImages(next);
      if (mainIdx === idx) setMainIdx(0);
      else if (mainIdx > idx) setMainIdx((m) => m - 1);
      toast.success("Image removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete image");
    } finally {
      setDeleting(null);
    }
  };

  // ── upload new images via API ──
  const handleUpload = async (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!valid.length) { toast.error("Please select image files"); return; }
    setUploading(true);
    try {
      for (const file of valid) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await axios.post(`/api/v3/product/${productId}/image/add`, fd, { withCredentials: true });
        // API returns the updated images array
        if (res.data?.data) setImages(res.data.data);
      }
      toast.success(`${valid.length} image${valid.length > 1 ? "s" : ""} added`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (addRef.current) addRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Image size={16} color="#fff" />
        <h2 style={{ color: "#fff", fontWeight: 600, fontSize: 15, margin: 0 }}>Product Images</h2>
        <span style={{ fontSize: 12, color: "#444", marginLeft: 4 }}>
          {images.length} image{images.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* main image large preview */}
      {images.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ ...s.label, marginBottom: 10 }}>Main image (displayed first)</span>
          <div style={{
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid #fff",
            background: "#080808",
            height: 260,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <img
              src={images[mainIdx]?.url}
              alt="main"
              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", padding: 12 }}
            />
            <div style={{
              position: "absolute",
              top: 10,
              left: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              color: "#000",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}>
              <Crown size={11} /> MAIN
            </div>
          </div>
        </div>
      )}

      {/* all images grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
        {images.map((img, idx) => {
          const isMain = idx === mainIdx;
          const isDeleting = deleting === img.public_id;
          return (
            <div
              key={img.public_id || idx}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                border: isMain ? "2px solid #fff" : "1px solid #1a1a1a",
                background: "#080808",
                aspectRatio: "1",
                cursor: "pointer",
                transition: "border-color .2s",
                opacity: isDeleting ? 0.4 : 1,
              }}
              onClick={() => setMainIdx(idx)}
            >
              <img
                src={img.url}
                alt={`product-${idx}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {/* overlay on hover */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: 0,
                transition: "opacity .2s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                {!isMain && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setMainIdx(idx); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: "#fff", color: "#000", border: "none",
                      borderRadius: 8, padding: "5px 10px",
                      fontSize: 11, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    <Star size={10} fill="#000" /> Set Main
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(img, idx); }}
                  disabled={isDeleting || images.length === 1}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "rgba(239,68,68,0.9)", color: "#fff", border: "none",
                    borderRadius: 8, padding: "5px 10px",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    opacity: images.length === 1 ? 0.4 : 1,
                  }}
                >
                  <Trash2 size={10} /> Delete
                </button>
              </div>

              {/* main badge */}
              {isMain && (
                <div style={{
                  position: "absolute", top: 6, left: 6,
                  background: "#fff", color: "#000",
                  borderRadius: 6, padding: "3px 7px",
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  <Crown size={8} /> MAIN
                </div>
              )}

              {isDeleting && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.6)",
                }}>
                  <div style={{
                    width: 20, height: 20,
                    border: "2px solid #fff",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                </div>
              )}
            </div>
          );
        })}

        {/* Add more tile */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => addRef.current?.click()}
          style={{
            borderRadius: 12,
            border: `2px dashed ${dragOver ? "#fff" : "#222"}`,
            background: dragOver ? "#111" : "transparent",
            aspectRatio: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "border-color .2s, background .2s",
            opacity: uploading ? 0.5 : 1,
          }}
        >
          {uploading ? (
            <div style={{
              width: 24, height: 24,
              border: "2px solid #fff",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }} />
          ) : (
            <>
              <ImagePlus size={22} color="#444" />
              <span style={{ fontSize: 10, color: "#444", textAlign: "center", lineHeight: 1.4 }}>
                Add<br />Image
              </span>
            </>
          )}
        </div>
      </div>

      <input
        ref={addRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* instructions */}
      <p style={{ fontSize: 11, color: "#333", marginTop: 4 }}>
        Click any image to preview · hover for actions · click "Set Main" to change main image
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminEditProduct() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, current: product } = useSelector((st) => st.products);
  const { role } = useSelector((st) => st.auth);
  const basePath = role === "superadmin" ? "/superadmin" : "/admin";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [imageState, setImageState] = useState({ images: [], mainIdx: 0 });
  const [newMainFile, setNewMainFile] = useState(null); // if user swaps main image via update
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: "", description: "", price: "",
    discountPrice: "", stock: "", category: "", tags: [],
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProduct(id)).finally(() => setFetching(false));
  }, [dispatch, id]);

  useEffect(() => {
    if (product && product._id === id) {
      setForm({
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        discountPrice: product.discountPrice?.toString() || "",
        stock: product.stock?.toString() || "",
        category: product.category?._id || product.category || "",
        tags: product.tags || [],
      });
      setImageState({ images: product.images || [], mainIdx: 0 });
    }
  }, [product, id]);

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
      // If main image changed (user selected a new main from existing ones or uploaded),
      // we send the current main image's public_id so backend knows
      const mainImg = imageState.images[imageState.mainIdx];
      if (mainImg?.public_id) fd.append("mainImagePublicId", mainImg.public_id);
      if (newMainFile) fd.append("image", newMainFile);

      const res = await dispatch(updateProduct({ id, formData: fd }));
      if (updateProduct.fulfilled.match(res)) {
        toast.success("Product updated!");
        navigate(`${basePath}/products`);
      } else {
        toast.error(res.payload || "Failed to update");
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

  // ── loading ──
  if (fetching) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 28, height: 28,
          border: "2px solid #333",
          borderTopColor: "#fff",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <p style={{ fontSize: 11, color: "#444", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Loading product…
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

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
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>Edit Product</h1>
        <p style={{ fontSize: 13, color: "#444", marginTop: 6 }}>Update details, pricing, and manage images.</p>
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
          <ImageManager
            productId={id}
            existingImages={imageState.images}
            onImagesChange={setImageState}
          />
        )}

        {/* STEP 3 — Review */}
        {step === 3 && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <Package size={15} color="#fff" />
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Review & Save</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* main image preview */}
              {imageState.images[imageState.mainIdx]?.url && (
                <div style={{
                  borderRadius: 14, overflow: "hidden",
                  border: "1px solid #1a1a1a",
                  aspectRatio: "1",
                  background: "#080808",
                }}>
                  <img
                    src={imageState.images[imageState.mainIdx].url}
                    alt="main"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              {/* details */}
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
                  <p style={{ color: "#555", fontSize: 13, lineHeight: 1.6, margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {form.description}
                  </p>
                </div>
                <div>
                  <p style={s.label}>Images</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {imageState.images.slice(0, 5).map((img, i) => (
                      <div key={i} style={{
                        width: 36, height: 36, borderRadius: 8, overflow: "hidden",
                        border: `1px solid ${i === imageState.mainIdx ? "#fff" : "#1a1a1a"}`,
                      }}>
                        <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                    {imageState.images.length > 5 && (
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "#111", border: "1px solid #1a1a1a",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "#555",
                      }}>+{imageState.images.length - 5}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* save */}
            <div style={{
              marginTop: 28, paddingTop: 20,
              borderTop: "1px solid #1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "flex-end",
            }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ ...s.btnWhite, opacity: loading ? 0.6 : 1, minWidth: 140, justifyContent: "center" }}
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
                    Saving…
                  </>
                ) : (
                  <><CheckCircle size={15} /> Save Changes</>
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

            {/* dots */}
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