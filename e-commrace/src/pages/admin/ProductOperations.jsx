import { useState } from "react";
import toast from "react-hot-toast";
import { api, errorMessage } from "../../services/api";
import { ErrorNotice, Field, Metric, money, Panel } from "./adminShared";

export default function ProductOperations({ product, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [size, setSize] = useState("");
  const [stock, setStock] = useState("");
  if (!product?._id) return null;
  const mutate = async (operation, message) => {
    setBusy(true); setError(null);
    try { await operation(); const updated = await api.products.detail(product._id); onUpdated(updated); toast.success(message); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  const upload = (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    if (files.length + (product.images?.length || 0) > 10) return setError("A product can have up to 10 photos.");
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024)) return setError("Use JPEG, PNG or WebP images smaller than 10 MB.");
    const body = new FormData(); files.forEach((file) => body.append("images", file));
    mutate(() => api.products.addImages(product._id, body), "Photos uploaded"); event.target.value = "";
  };
  const reorder = (index, direction) => {
    const order = product.images.map((image) => image.public_id);
    [order[index], order[index + direction]] = [order[index + direction], order[index]];
    mutate(() => api.products.reorder(product._id, order), "Gallery order saved");
  };
  const loadAnalytics = async () => {
    setBusy(true); setError(null);
    try { setAnalytics(await api.products.analytics(product._id)); }
    catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); }
  };
  return <div className="studio mt-8"><details className="studio-panel"><summary className="cursor-pointer p-5 font-serif text-xl">Inventory, gallery & performance</summary><div className="p-5 space-y-6"><ErrorNotice error={error} />
    <Panel title="Stock by size"><div className="p-5 space-y-4"><div className="flex flex-wrap gap-2">{(product.sizeVariants || []).map((variant) => <button key={variant.size} disabled={busy} className="studio-button studio-button-small" aria-pressed={variant.isAvailable !== false} onClick={() => mutate(() => api.products.toggleSize(product._id, variant.size), `${variant.size} availability updated`)}>{variant.size}: {variant.stock} / {variant.isAvailable === false ? "Hidden" : "Available"}</button>)}</div><form className="flex flex-wrap gap-3 items-end" onSubmit={(event) => { event.preventDefault(); if (!size || !Number.isInteger(Number(stock)) || Number(stock) < 0 || stock === "") return setError("Choose a size and enter a whole stock quantity."); mutate(() => api.products.sizeStock(product._id, size, Number(stock)), "Size inventory updated"); }}><Field label="Size"><select required value={size} onChange={(event) => setSize(event.target.value)} className="studio-select"><option value="">Select size</option>{[...new Set([...(product.sizes || []), ...(product.sizeVariants || []).map((variant) => variant.size)])].map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Stock"><input required type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} className="studio-input" /></Field><button className="studio-button studio-button-primary" disabled={busy}>Save size stock</button></form><p className="studio-note">Size stock changes also update the product’s overall stock.</p></div></Panel>
    <Panel title="Published gallery"><div className="p-5 space-y-4"><div className="studio-gallery">{(product.images || []).map((image, index) => <article key={image.public_id || image.url}><img src={image.url} alt={`${product.title}, view ${index + 1}`} /><div className="flex flex-wrap gap-1"><button disabled={busy || !image.public_id || image.isDefault} className="studio-button studio-button-small" onClick={() => mutate(() => api.products.cover(product._id, image.public_id), "Cover photo saved")}>{image.isDefault ? "Cover" : "Set cover"}</button><button disabled={busy || !image.public_id || image.isHover} className="studio-button studio-button-small" onClick={() => mutate(() => api.products.hover(product._id, image.public_id), "Hover photo saved")}>{image.isHover ? "Hover" : "Set hover"}</button><button disabled={busy || index === 0 || !image.public_id} aria-label={`Move image ${index + 1} earlier`} className="studio-button studio-button-small" onClick={() => reorder(index, -1)}>←</button><button disabled={busy || index === product.images.length - 1 || !image.public_id} aria-label={`Move image ${index + 1} later`} className="studio-button studio-button-small" onClick={() => reorder(index, 1)}>→</button><button disabled={busy || !image.public_id || product.images.length === 1} className="studio-button studio-button-small studio-button-danger" onClick={() => { if (window.confirm("Delete this product photo?")) mutate(() => api.products.removeImage(product._id, image.public_id), "Photo deleted"); }}>Delete</button></div></article>)}</div><label className="studio-upload">Add gallery photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={upload} /></label></div></Panel>
    <Panel title="Product performance"><div className="p-5 space-y-4"><button className="studio-button" disabled={busy} onClick={loadAnalytics}>Load performance</button>{analytics && <div className="studio-metrics"><Metric label="Views" value={analytics.views ?? analytics.totalViews ?? analytics.analytics?.views ?? 0} /><Metric label="Units purchased" value={analytics.purchased ?? analytics.totalPurchased ?? analytics.analytics?.purchased ?? 0} /><Metric label="Revenue" value={money(analytics.totalRevenue ?? analytics.revenue)} /><Metric label="Gross profit" value={money(analytics.grossProfit ?? analytics.totalProfit)} /></div>}</div></Panel>
  </div></details></div>;
}
