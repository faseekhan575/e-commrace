import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Download, ArrowUpRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../axiosConfig";
import { Badge, dataOf, dateLabel, EmptyState, ErrorNotice, errorMessage, LoadingState, money, PageHeader, Pagination, Panel, useCommerceRefresh, useDebounced } from "./adminShared";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [busy, setBusy] = useState("");
  const query = useDebounced(search);
  const request = useRef(0);
  const load = useCallback(async () => {
    const requestId = ++request.current;
    setLoading(true); setError("");
    try {
      const data = dataOf(await axios.get("/api/v6/order/all", { params: { page, limit: 15, search: query || undefined, status: status || undefined, paymentStatus: paymentStatus || undefined, paymentMethod: paymentMethod || undefined } }));
      if (requestId !== request.current) return;
      setOrders(data.orders || []);
      setPagination({ total: data.totalOrders ?? data.total ?? 0, pages: data.totalPages || 1 });
      if (page > Math.max(1, data.totalPages || 1)) setPage(Math.max(1, data.totalPages || 1));
    } catch (failure) { if (requestId === request.current) { setError(errorMessage(failure)); setOrders([]); } }
    finally { if (requestId === request.current) setLoading(false); }
  }, [page, query, status, paymentStatus, paymentMethod]);
  useEffect(() => { load(); }, [load]);
  useCommerceRefresh(load, "new_order,admin_order_updated");
  const updateStatus = async (orderId, value) => {
    setBusy(orderId);
    try {
      const order = dataOf(await axios.patch(`/api/v6/order/${orderId}/status`, { status: value }));
      setOrders((items) => items.map((item) => item._id === orderId ? { ...item, ...order } : item));
      toast.success("Order status updated"); await load();
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(""); }
  };
  const download = async () => {
    setBusy("export");
    try {
      const response = await axios.get("/api/v6/order/download", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a"); link.href = url; link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Orders report downloaded");
    } catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(""); }
  };
  const filter = (setter) => (event) => { setter(event.target.value); setPage(1); };
  return <div className="studio"><PageHeader eyebrow="Operations / Orders" title="Every order, beautifully handled." description="Manage fulfilment, payments and courier dispatch from one workspace."><button className="studio-button" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button><button className="studio-button studio-button-primary" onClick={download} disabled={!!busy}><Download size={15} /> Export all orders</button></PageHeader><ErrorNotice error={error} retry={load} /><Panel><div className="studio-toolbar"><input aria-label="Search by full order ID" className="studio-input studio-search" placeholder="Search by full order ID…" value={search} onChange={filter(setSearch)} /><select className="studio-select" aria-label="Order status" value={status} onChange={filter(setStatus)}><option value="">All statuses</option>{["pending", "processing", "shipped", "delivered", "cancelled"].map((value) => <option key={value}>{value}</option>)}</select><select className="studio-select" aria-label="Payment status" value={paymentStatus} onChange={filter(setPaymentStatus)}><option value="">All payments</option>{["unpaid", "paid", "refunded"].map((value) => <option key={value}>{value}</option>)}</select><select className="studio-select" aria-label="Payment method" value={paymentMethod} onChange={filter(setPaymentMethod)}><option value="">Payment method</option>{["cod", "card", "jazzcash", "easypaisa"].map((value) => <option key={value}>{value}</option>)}</select></div>{loading ? <LoadingState /> : orders.length ? <div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Dispatch</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td><strong>#{order._id.slice(-8).toUpperCase()}</strong><small>{dateLabel(order.createdAt)}</small></td><td><strong>{order.user?.fullname || order.shippingAddress?.fullName || "Customer"}</strong><small>{order.user?.email || order.shippingAddress?.city}</small></td><td>{money(order.totalAmount)}<small>{order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ?? 0} items</small></td><td><Badge value={order.paymentStatus || "unpaid"} /><small>{order.paymentMethod?.toUpperCase()}</small></td><td><select className="studio-select" value={order.status} aria-label={`Status of order ${order._id}`} disabled={!!busy} onChange={(event) => updateStatus(order._id, event.target.value)}>{["pending", "processing", "shipped", "delivered", "cancelled"].map((value) => <option key={value}>{value}</option>)}</select></td><td>{order.courier || "Not assigned"}<small>{order.trackingNumber || "Awaiting dispatch"}</small></td><td><Link className="studio-icon-button" aria-label={`Open order ${order._id}`} to={`/admin/orders/${order._id}`}><ArrowUpRight size={16} /></Link></td></tr>)}</tbody></table></div> : !error && <EmptyState title="No matching orders" description="Try another filter or wait for your next order." />}<Pagination page={page} pages={pagination.pages} total={pagination.total} onChange={setPage} disabled={loading} /></Panel></div>;
}
