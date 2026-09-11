import { useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Package, RefreshCw, X } from "lucide-react";
import "./admin.css";

export const money = (value) => `PKR ${Number(value ?? 0).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
export const dateLabel = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—";
export const errorMessage = (error) => typeof error === "string" ? error : error?.response?.data?.message || error?.message || "The request could not be completed. Please try again.";
export const dataOf = (response) => response.data?.data ?? response.data;
export const imageOf = (item) => item?.images?.find((image) => image.isDefault)?.url || item?.images?.[0]?.url || item?.image?.url || (typeof item?.image === "string" ? item.image : "");

export function useDebounced(value, delay = 300) {
  const [result, setResult] = useState(value);
  useEffect(() => { const timer = setTimeout(() => setResult(value), delay); return () => clearTimeout(timer); }, [value, delay]);
  return result;
}

export function useCommerceRefresh(callback, events = "new_order,admin_order_updated,low_stock,new_review,new_user_registered") {
  const ref = useRef(callback);
  useEffect(() => { ref.current = callback; }, [callback]);
  useEffect(() => {
    const names = [...new Set([...events.split(","), "reconnected"])].map((event) => `commerce:${event}`);
    const refresh = () => ref.current();
    names.forEach((event) => window.addEventListener(event, refresh));
    return () => names.forEach((event) => window.removeEventListener(event, refresh));
  }, [events]);
}

export function PageHeader({ eyebrow = "Clothing Den · Studio", title, description, children }) {
  return <header className="studio-header"><div><p className="studio-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="studio-description">{description}</p></div><div className="studio-actions">{children}</div></header>;
}

export function Panel({ title, action, children, className = "" }) {
  return <section className={`studio-panel ${className}`}>{title && <div className="studio-panel-heading"><h2>{title}</h2>{action}</div>}{children}</section>;
}

export function ErrorNotice({ error, retry }) {
  if (!error) return null;
  return <div className="studio-error" role="alert"><AlertCircle size={18} /><span>{errorMessage(error)}</span>{retry && <button className="studio-button studio-button-small" onClick={retry}><RefreshCw size={14} /> Retry</button>}</div>;
}

export function EmptyState({ title = "Nothing here yet", description = "Your store data will appear here when it is available." }) {
  return <div className="studio-empty"><Package size={30} strokeWidth={1.2} /><h3>{title}</h3><p>{description}</p></div>;
}

export function LoadingState({ label = "Loading your store…" }) {
  return <div className="studio-empty" role="status"><Loader2 className="animate-spin" size={24} /><p>{label}</p></div>;
}

export function Pagination({ page, pages, total, onChange, disabled }) {
  return <div className="studio-pagination"><span>{Number(total ?? 0).toLocaleString()} results · Page {page} of {Math.max(1, pages || 1)}</span><div className="studio-actions"><button className="studio-button studio-button-small" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /> Previous</button><button className="studio-button studio-button-small" disabled={disabled || page >= Math.max(1, pages || 1)} onClick={() => onChange(page + 1)}>Next <ChevronRight size={16} /></button></div></div>;
}

export function Badge({ value }) {
  return <span className={`studio-badge studio-badge-${String(value).toLowerCase()}`}>{String(value ?? "Unknown").replaceAll("_", " ")}</span>;
}

export function Metric({ label, value, note }) {
  return <div className="studio-metric"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}

export function Modal({ title, children, onClose, busy = false }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    if (!element.open) element.showModal();
    return () => { element.close(); previous?.focus?.(); };
  }, []);
  return <dialog ref={dialog} className="studio-dialog" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}><div className="studio-panel-heading"><h2>{title}</h2><button className="studio-icon-button" aria-label="Close dialog" onClick={onClose} disabled={busy}><X size={20} /></button></div>{children}</dialog>;
}

export function Field({ label, children, hint }) {
  return <label className="studio-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
