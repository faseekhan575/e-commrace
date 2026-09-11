import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Plus, RefreshCw } from "lucide-react";
import axios from "../../axiosConfig";
import { Badge, dataOf, dateLabel, EmptyState, ErrorNotice, errorMessage, imageOf, LoadingState, Metric, money, PageHeader, Panel, useCommerceRefresh } from "./adminShared";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [live, setLive] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());
  const load = useCallback(async () => {
    setLoading(true);
    const requests = [["summary", "/stats", setStats], ["live orders", "/live-orders", setLive], ["inventory", "/inventory-summary", setInventory], ["revenue chart", "/monthly-orders", setMonthly]];
    const results = await Promise.allSettled(requests.map(([, path]) => axios.get(`/api/v9/dashboard${path}`, { params: { year } })));
    const failures = {};
    results.forEach((result, index) => {
      const [name, , setter] = requests[index];
      if (result.status === "fulfilled") setter(dataOf(result.value));
      else failures[name] = errorMessage(result.reason);
    });
    setErrors(failures);
    setLoading(false);
  }, [year]);
  useEffect(() => { load(); }, [load]);
  useCommerceRefresh(load);
  const overview = stats?.overview || {};
  const financials = stats?.financials || overview;
  const users = stats?.users || overview;
  const orders = stats?.orders || overview;
  const stock = stats?.inventory || overview;
  const pipeline = stats?.orderStatus || Object.fromEntries(["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => [status, orders[`${status}Orders`] ?? 0]));
  const payments = stats?.paymentStatus || Object.fromEntries(["paid", "unpaid", "refunded"].map((status) => [status, stats?.payments?.[`${status}Orders`] ?? 0]));
  const liveOrders = Array.isArray(live) ? live : live?.orders || [];
  const rawChart = Array.isArray(monthly) ? monthly : monthly?.months || monthly?.monthlyData;
  const chart = rawChart ? rawChart.map((item, index) => ({ ...item, label: typeof item.month === "string" ? item.month : new Date(year, Number(item.month ?? index + 1) - 1).toLocaleDateString("en", { month: "short" }), revenue: item.revenue ?? item.totalRevenue ?? 0, profit: item.profit ?? item.totalProfit ?? 0 })) : Object.values((monthly?.orders || []).reduce((days, order) => {
    const label = new Date(order.createdAt).getDate();
    days[label] ||= { label: String(label), revenue: 0, profit: 0, orders: 0 };
    days[label].orders += 1;
    if (order.paymentStatus === "paid") { days[label].revenue += Number(order.totalAmount || 0); days[label].profit += Number(order.totalProfit || 0); }
    return days;
  }, {})).sort((a, b) => Number(a.label) - Number(b.label));
  return <div className="studio">
    <PageHeader eyebrow="Store overview" title="A clear view of your business." description="Orders, customers and inventory, together in one place."><button className="studio-button" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button><Link to="/admin/products/create" className="studio-button studio-button-primary"><Plus size={16} /> Add product</Link></PageHeader>
    {Object.entries(errors).map(([name, error]) => <ErrorNotice key={name} error={`Unable to refresh ${name}: ${error}`} retry={load} />)}
    {loading && !stats ? <LoadingState label="Preparing your dashboard…" /> : stats && <>
      <div className="studio-metrics"><Metric label="Sales revenue" value={money(financials.totalRevenue)} note={`${money(financials.revenueThisMonth)} this month`} /><Metric label="Net profit" value={money(financials.totalProfit)} note={`${money(financials.profitToday)} today`} /><Metric label="Total orders" value={Number(orders.totalOrders ?? 0).toLocaleString()} note={`${orders.ordersToday ?? 0} placed today`} /><Metric label="Customers" value={Number(users.totalUsers ?? 0).toLocaleString()} note={`${users.newUsersThisMonth ?? 0} joined this month`} /></div>
      <div className="studio-columns"><Panel title="Revenue & profit" action={<select className="studio-select" aria-label="Chart year" value={year} onChange={(event) => setYear(Number(event.target.value))}>{Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index).map((value) => <option key={value}>{value}</option>)}</select>}><div className="studio-panel-body"><p className="studio-note mb-5">{rawChart ? `Monthly performance · ${year}` : `${new Date(year, (monthly?.month || new Date().getMonth() + 1) - 1).toLocaleDateString("en", { month: "long", year: "numeric" })} · Daily paid orders`}</p>{chart.length ? <div style={{ width: "100%", height: 270, minWidth: 0 }}><ResponsiveContainer><AreaChart data={chart}><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e9ede9" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#839085" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#839085" }} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} /><Tooltip formatter={(value, name) => [money(value), name]} /><Area name="Revenue" dataKey="revenue" stroke="#44765b" strokeWidth={2} fill="#dcece0" /><Area name="Profit" dataKey="profit" stroke="#c4a76a" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div> : <EmptyState title="No revenue data for this period" description="Revenue and profit appear as paid orders come in." />}</div></Panel><Panel title="Order pipeline" action={<Link className="studio-link text-xs" to="/admin/orders">View orders <ArrowUpRight className="inline" size={13} /></Link>}><div className="studio-panel-body">{Object.entries(pipeline).map(([status, count]) => <div key={status}><div className="studio-line"><Badge value={status} /><strong>{count}</strong></div><div className="studio-stat-bar"><div style={{ width: `${Number(orders.totalOrders) ? Math.max(0, Math.min(100, count / orders.totalOrders * 100)) : 0}%` }} /></div></div>)}</div></Panel></div>
      <div className="studio-columns"><Panel title={`Awaiting fulfilment · ${liveOrders.length}`} action={<Link to="/admin/orders" className="studio-link text-xs">Manage orders</Link>}>{liveOrders.length ? <div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Order / customer</th><th>Amount</th><th>Status</th><th /></tr></thead><tbody>{liveOrders.slice(0, 8).map((order) => <tr key={order._id}><td><strong>#{order._id?.slice(-8).toUpperCase()}</strong><small>{order.user?.fullname || order.shippingAddress?.fullName || "Customer"} · {dateLabel(order.createdAt)}</small></td><td>{money(order.totalAmount)}</td><td><Badge value={order.status} /></td><td><Link aria-label={`Open order ${order._id}`} to={`/admin/orders/${order._id}`} className="studio-icon-button"><ArrowUpRight size={15} /></Link></td></tr>)}</tbody></table></div> : <EmptyState title="You're all caught up" description="New and processing orders will appear here automatically." />}</Panel><Panel title="Stock health" action={<Link to="/admin/products" className="studio-link text-xs">Inventory</Link>}><div className="studio-panel-body">{[["Catalog products", stock.totalProducts ?? inventory?.totalCount], ["Active products", stock.activeProducts], ["Low stock", stock.lowStockProducts ?? inventory?.lowStock], ["Out of stock", stock.outOfStockProducts ?? inventory?.outOfStock], ["Stock investment", money(stock.inventoryCostValue ?? stock.inventoryValuation)], ["Retail stock value", money(stock.inventoryRetailValue)]].map(([label, value]) => <div className="studio-line" key={label}><span className="studio-subtle">{label}</span><strong>{value ?? "—"}</strong></div>)}<div className="studio-actions mt-6">{Object.entries(payments).map(([status, count]) => <span key={status} className="studio-note"><Badge value={status} /> {count}</span>)}</div></div></Panel></div>
      <Panel title="Best performing products" action={<Link to="/admin/products" className="studio-link text-xs">View catalog</Link>}>{stats.topProducts?.length ? <div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Product</th><th>Price</th><th>Units sold</th><th>Stock</th><th /></tr></thead><tbody>{stats.topProducts.map((product) => <tr key={product._id}><td><div className="studio-cell-product">{imageOf(product) && <img src={imageOf(product)} alt="" className="studio-thumbnail" />}<div><strong>{product.title}</strong><small>{product.sku}</small></div></div></td><td>{money(product.discountPrice ?? product.price)}</td><td>{product.analytics?.purchased ?? 0}</td><td>{product.stock ?? 0}</td><td><Link className="studio-link" to={`/admin/products/${product._id}/edit`}>Details</Link></td></tr>)}</tbody></table></div> : <EmptyState title="Your bestsellers will appear here" />}</Panel>
    </>}
  </div>;
}
