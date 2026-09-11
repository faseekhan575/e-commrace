import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Printer, Truck } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../axiosConfig";
import { Badge, dataOf, dateLabel, EmptyState, ErrorNotice, errorMessage, Field, imageOf, LoadingState, Metric, money, PageHeader, Panel, useCommerceRefresh } from "./adminShared";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tracking, setTracking] = useState({ trackingNumber: "", courier: "", trackingUrl: "", estimatedDelivery: "", note: "" });
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = dataOf(await axios.get(`/api/v9/dashboard/order/${id}`));
      setOrder(data.order || data);
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (order) setTracking({ trackingNumber: order.trackingNumber || "", courier: order.courier || "", trackingUrl: order.trackingUrl || "", estimatedDelivery: order.estimatedDelivery ? String(order.estimatedDelivery).slice(0, 10) : "", note: "" }); }, [order]);
  useCommerceRefresh(load, "admin_order_updated");
  const update = async (path, payload, message) => {
    setBusy(true);
    try {
      const data = dataOf(await axios.patch(`/api/v6/order/${id}/${path}`, payload));
      setOrder((current) => ({ ...current, ...(data.order || data) }));
      toast.success(message);
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  const saveTracking = (event) => {
    event.preventDefault();
    if (tracking.trackingUrl && !/^https?:\/\//i.test(tracking.trackingUrl)) return toast.error("Tracking link must start with https:// or http://");
    const payload = { ...tracking };
    if (payload.estimatedDelivery) payload.estimatedDelivery = new Date(`${payload.estimatedDelivery}T12:00:00`).toISOString();
    else delete payload.estimatedDelivery;
    update("tracking", payload, "Courier tracking updated");
  };
  const address = order?.shippingAddress || {};
  return <div className="studio"><PageHeader eyebrow="Operations / Order detail" title={order ? `Order #${order._id?.slice(-8).toUpperCase()}` : "Order details"} description={order ? `Placed ${dateLabel(order.createdAt)} · ${order.paymentMethod?.toUpperCase() || "Payment method unavailable"}` : "Customer, fulfilment and dispatch details."}><Link className="studio-button" to="/admin/orders"><ArrowLeft size={15} /> All orders</Link>{order && <button className="studio-button" onClick={() => window.print()}><Printer size={15} /> Print order</button>}</PageHeader><ErrorNotice error={error} retry={load} />{loading && !order ? <LoadingState /> : !order ? !error && <EmptyState title="Order not found" /> : <>
    <div className="studio-metrics"><Metric label="Order total" value={money(order.totalAmount)} /><Metric label="Order profit" value={money(order.totalProfit)} /><Metric label="Order status" value={<Badge value={order.status} />} /><Metric label="Payment status" value={<Badge value={order.paymentStatus} />} /></div>
    <div className="studio-columns"><div className="space-y-6"><Panel title="Items in this order"><div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Product</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{order.items?.map((item, index) => <tr key={item._id || index}><td><div className="studio-cell-product">{imageOf(item.product) && <img className="studio-thumbnail" src={imageOf(item.product)} alt="" />}<div><strong>{item.product?.title || item.title || "Product no longer available"}</strong><small>{item.product?.sku} · Size {item.size || "—"}{item.color ? ` · ${item.color}` : ""}</small></div></div></td><td>{item.quantity}</td><td>{money(item.priceAtPurchase ?? item.price)}</td><td>{money((item.priceAtPurchase ?? item.price ?? 0) * item.quantity)}</td></tr>)}</tbody></table></div><div className="studio-panel-body"><div className="studio-line"><span>Total</span><strong>{money(order.totalAmount)}</strong></div></div></Panel><Panel title="Order timeline"><div className="studio-panel-body">{order.timeline?.length ? <ol className="studio-timeline">{[...order.timeline].reverse().map((event, index) => <li key={event._id || index}><div className="studio-actions"><Badge value={event.status} /><span className="studio-note">{dateLabel(event.timestamp || event.createdAt)}</span></div><p>{event.note || "Order status updated"}</p></li>)}</ol> : <p className="studio-note">No timeline updates yet.</p>}</div></Panel></div><div className="space-y-6"><Panel title="Customer & delivery"><div className="studio-panel-body"><strong className="text-sm">{order.user?.fullname || address.fullName || "Customer"}</strong><p className="studio-note mt-2">{order.user?.email}</p><p className="studio-note">{address.phone || order.user?.phone}</p><div className="mt-5 studio-note">{address.street}<br />{[address.city, address.province, address.zip || address.postalCode].filter(Boolean).join(", ")}<br />{address.country}</div></div></Panel><Panel title="Update fulfilment"><div className="studio-panel-body space-y-4"><Field label="Order status"><select className="studio-select" disabled={busy} value={order.status} onChange={(event) => update("status", { status: event.target.value }, "Order status updated")}>{["pending", "processing", "shipped", "delivered", "cancelled"].map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Payment status"><select className="studio-select" disabled={busy} value={order.paymentStatus} onChange={(event) => update("status", { paymentStatus: event.target.value }, "Payment status updated")}>{["unpaid", "paid", "refunded"].map((value) => <option key={value}>{value}</option>)}</select></Field></div></Panel></div></div>
    <Panel title="Courier tracking" action={<Truck size={18} />}><form onSubmit={saveTracking} className="studio-panel-body"><div className="studio-form-grid">{[["courier", "Courier name", "text"], ["trackingNumber", "Tracking number", "text"], ["trackingUrl", "Tracking link", "url"], ["estimatedDelivery", "Estimated delivery", "date"]].map(([key, label, type]) => <Field key={key} label={label}><input className="studio-input" type={type} value={tracking[key]} required={key === "courier" || key === "trackingNumber"} onChange={(event) => setTracking((form) => ({ ...form, [key]: event.target.value }))} /></Field>)}<div className="studio-field-wide"><Field label="Dispatch note"><textarea className="studio-textarea" rows={2} value={tracking.note} onChange={(event) => setTracking((form) => ({ ...form, note: event.target.value }))} /></Field></div></div><div className="studio-actions mt-5"><button className="studio-button studio-button-primary" disabled={busy}>{busy ? "Saving…" : "Save courier tracking"}</button>{/^https?:\/\//i.test(order.trackingUrl || "") && <a className="studio-button" href={order.trackingUrl} target="_blank" rel="noopener noreferrer">Track parcel <ExternalLink size={14} /></a>}<p className="studio-note">Adding a tracking number dispatches a pending order.</p></div></form></Panel>
  </>}</div>;
}
