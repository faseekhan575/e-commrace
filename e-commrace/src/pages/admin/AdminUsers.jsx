import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../axiosConfig";
import { Badge, dataOf, dateLabel, EmptyState, ErrorNotice, errorMessage, LoadingState, Metric, Modal, money, PageHeader, Pagination, Panel, useCommerceRefresh, useDebounced } from "./adminShared";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [detail, setDetail] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const request = useRef(0);
  const query = useDebounced(search);
  const load = useCallback(async () => {
    const requestId = ++request.current;
    setLoading(true); setError("");
    try {
      const data = dataOf(await axios.get("/api/v8/admin/users", { params: { page, limit: 15, search: query || undefined, isVerified: verified || undefined } }));
      if (requestId !== request.current) return;
      setUsers(data.customers || data.users || []);
      setPagination({ total: data.total ?? 0, pages: data.totalPages || 1 });
      if (page > Math.max(1, data.totalPages || 1)) setPage(Math.max(1, data.totalPages || 1));
    } catch (failure) { if (requestId === request.current) { setError(errorMessage(failure)); setUsers([]); } }
    finally { if (requestId === request.current) setLoading(false); }
  }, [page, query, verified]);
  useEffect(() => { load(); }, [load]);
  useCommerceRefresh(load, "new_user_registered,new_order,admin_order_updated");
  const openDetail = async (id) => {
    setBusy(true);
    try { const data = dataOf(await axios.get(`/api/v8/admin/users/${id}`)); setDetail({ ...data, user: data.user || data.customer || data }); }
    catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await axios.delete(`/api/v8/admin/users/${deleting._id}`); toast.success("Customer account deleted"); setDeleting(null); await load(); }
    catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  return <div className="studio"><PageHeader eyebrow="Relationships / Customers" title="Know the people behind every order." description="Explore customer histories, verified accounts and lifetime spending."><span className="studio-button"><Users size={15} /> {pagination.total} customers</span></PageHeader><ErrorNotice error={error} retry={load} /><Panel><div className="studio-toolbar"><input className="studio-input studio-search" aria-label="Search customers" placeholder="Search name, email or username…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /><select className="studio-select" aria-label="Verification status" value={verified} onChange={(event) => { setVerified(event.target.value); setPage(1); }}><option value="">All accounts</option><option value="true">Verified</option><option value="false">Unverified</option></select></div>{loading ? <LoadingState /> : users.length ? <div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Customer</th><th>Status</th><th>Orders</th><th>Lifetime spend</th><th>Joined</th><th /></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td><strong>{user.fullname || user.username}</strong><small>{user.email}</small></td><td><Badge value={user.isVerified ? "verified" : "unverified"} /></td><td>{user.totalOrders ?? 0}</td><td>{money(user.totalSpent)}</td><td>{dateLabel(user.createdAt)}</td><td><div className="studio-actions"><button className="studio-icon-button" aria-label={`View ${user.fullname}`} disabled={busy} onClick={() => openDetail(user._id)}><ArrowUpRight size={16} /></button><button className="studio-icon-button studio-button-danger" aria-label={`Delete ${user.fullname}`} disabled={busy} onClick={() => setDeleting(user)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : !error && <EmptyState title="No customers found" description="Try another search or verification filter." />}<Pagination page={page} pages={pagination.pages} total={pagination.total} onChange={setPage} disabled={loading} /></Panel>
  {detail && <Modal title={detail.user.fullname || "Customer profile"} onClose={() => setDetail(null)}><div className="studio-panel-body"><p className="studio-note">{detail.user.email} · Joined {dateLabel(detail.user.createdAt)}</p><div className="studio-metrics mt-5" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}><Metric label="Lifetime spend" value={money(detail.totalSpent)} /><Metric label="Total orders" value={detail.totalOrders ?? detail.orders?.length ?? 0} /></div><h3 className="text-sm font-semibold mt-7 mb-3">Order history</h3>{detail.orders?.length ? detail.orders.map((order) => <div className="studio-line" key={order._id}><Link className="studio-link" to={`/admin/orders/${order._id}`}>#{order._id.slice(-8).toUpperCase()}</Link><Badge value={order.status} /><strong>{money(order.totalAmount)}</strong></div>) : <p className="studio-note">No orders placed yet.</p>}<h3 className="text-sm font-semibold mt-7 mb-3">Product reviews</h3>{detail.reviews?.length ? detail.reviews.map((review) => <div key={review._id} className="py-3 border-b border-slate-100"><p className="text-xs font-semibold">{review.product?.title || "Product"} · {review.rating}/5</p><p className="studio-note mt-2">{review.comment}</p></div>) : <p className="studio-note">No reviews submitted yet.</p>}</div></Modal>}
  {deleting && <Modal title="Delete customer account?" onClose={() => setDeleting(null)} busy={busy}><div className="studio-panel-body"><p className="studio-note">This permanently deletes the account for {deleting.fullname || deleting.email}.</p><div className="studio-actions mt-6"><button className="studio-button" onClick={() => setDeleting(null)} disabled={busy}>Keep account</button><button className="studio-button studio-button-danger" onClick={remove} disabled={busy}>{busy ? "Deleting…" : "Delete account"}</button></div></div></Modal>}</div>;
}
