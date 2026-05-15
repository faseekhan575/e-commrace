import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { UserCheck, UserX, Shield, Trash2, Search, Crown, Users, X, ChevronLeft, ChevronRight } from "lucide-react";

const gold = "#f9c938";

const ROLE_BADGE = {
  superadmin: { bg: "#f9c93820", color: gold, label: "SUPERADMIN" },
  admin: { bg: "#a78bfa20", color: "#a78bfa", label: "ADMIN" },
  user: { bg: "#ffffff10", color: "#787878", label: "USER" },
};

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm">
        <p className="text-white text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#1a1a1a] text-[#787878] text-sm hover:border-[#333] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black transition-colors"
            style={{ backgroundColor: gold }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }
  const LIMIT = 10;

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v8/superadmin/users?page=${p}&limit=${LIMIT}`);
      setUsers(res.data.data.users || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const ask = (message, onConfirm) => setConfirm({ message, onConfirm });

  const promote = (userId) => ask("Promote this user to Admin?", async () => {
    setConfirm(null);
    try {
      await axios.patch(`/api/v8/superadmin/promote/${userId}`);
      toast.success("Promoted to Admin");
      fetchUsers(page);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  });

  const demote = (userId) => ask("Demote this Admin to regular User?", async () => {
    setConfirm(null);
    try {
      await axios.patch(`/api/v8/superadmin/demote/${userId}`);
      toast.success("Demoted to User");
      fetchUsers(page);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  });

  const deleteUser = (userId) => ask("Delete this user permanently? This cannot be undone.", async () => {
    setConfirm(null);
    try {
      await axios.delete(`/api/v8/superadmin/delete/${userId}`);
      toast.success("User deleted");
      fetchUsers(page);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  });

  const filtered = users.filter((u) =>
    u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="pb-10">
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={15} style={{ color: gold }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: gold }}>Super Admin</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-700 text-white">All Users</h1>
          <p className="text-xs text-[#525252] mt-0.5">{total} total registered users</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border self-start"
          style={{ borderColor: "#f9c93825", backgroundColor: "#f9c93808" }}>
          <Users size={13} style={{ color: gold }} />
          <span className="text-xs font-mono" style={{ color: gold }}>{total} Users</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#525252]" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or username..."
          className="w-full bg-[#080808] border border-[#1a1a1a] pl-11 pr-10 py-3 rounded-xl text-white text-sm placeholder:text-[#333] outline-none transition-all"
          style={{ caretColor: gold }}
          onFocus={(e) => e.target.style.borderColor = gold}
          onBlur={(e) => e.target.style.borderColor = "#1a1a1a"}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-[#080808] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {["User", "Role", "Joined", "Actions"].map((h, i) => (
                <th key={h} className={`px-5 py-4 text-[10px] font-mono uppercase tracking-widest text-[#525252] ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0d0d0d]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(4)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-[#111] rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map((user) => {
              const badge = ROLE_BADGE[user.role] || ROLE_BADGE.user;
              return (
                <tr key={user._id} className="hover:bg-[#0d0d0d] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar?.url
                        ? <img src={user.avatar.url} className="w-9 h-9 rounded-xl object-cover border border-[#1a1a1a]" alt="" />
                        : <div className="w-9 h-9 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center">
                            <span className="text-xs font-bold text-[#525252]">{user.fullname?.[0]}</span>
                          </div>
                      }
                      <div>
                        <p className="text-sm font-medium text-white">{user.fullname}</p>
                        <p className="text-xs text-[#525252]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#787878]">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === "user" && (
                        <button onClick={() => promote(user._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:text-black"
                          style={{ borderColor: "#f9c93840", color: gold }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = gold; e.currentTarget.style.color = "#000"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = gold; }}>
                          <Shield size={12} /> Make Admin
                        </button>
                      )}
                      {user.role === "admin" && (
                        <button onClick={() => demote(user._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a1a1a] text-xs font-medium text-[#787878] hover:border-red-500/40 hover:text-red-400 transition-all">
                          <UserX size={12} /> Demote
                        </button>
                      )}
                      {user.role !== "superadmin" && (
                        <button onClick={() => deleteUser(user._id)}
                          className="p-2 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-[#525252] hover:text-red-400 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="text-center text-[#525252] text-sm py-12">No users found</p>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? [...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-[#080808] border border-[#1a1a1a] rounded-2xl animate-pulse" />
        )) : filtered.map((user) => {
          const badge = ROLE_BADGE[user.role] || ROLE_BADGE.user;
          return (
            <div key={user._id} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                {user.avatar?.url
                  ? <img src={user.avatar.url} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  : <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center">
                      <span className="text-sm font-bold text-[#525252]">{user.fullname?.[0]}</span>
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.fullname}</p>
                  <p className="text-xs text-[#525252] truncate">{user.email}</p>
                </div>
                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {user.role === "user" && (
                  <button onClick={() => promote(user._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-black transition-all"
                    style={{ backgroundColor: gold }}>
                    <Shield size={11} /> Make Admin
                  </button>
                )}
                {user.role === "admin" && (
                  <button onClick={() => demote(user._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#1a1a1a] text-xs text-[#787878] hover:text-red-400 transition-all">
                    <UserX size={11} /> Demote
                  </button>
                )}
                {user.role !== "superadmin" && (
                  <button onClick={() => deleteUser(user._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-transparent hover:border-red-500/20 text-xs text-red-400 transition-all ml-auto">
                    <Trash2 size={11} /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-[#525252] text-sm py-12">No users found</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}
            className="p-2 rounded-xl border border-[#1a1a1a] text-[#787878] hover:text-white hover:border-[#333] disabled:opacity-30 transition-all">
            <ChevronLeft size={16} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className="w-8 h-8 rounded-xl text-xs font-mono transition-all"
              style={{
                backgroundColor: page === i + 1 ? gold : "transparent",
                color: page === i + 1 ? "#000" : "#525252",
                border: `1px solid ${page === i + 1 ? gold : "#1a1a1a"}`,
              }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
            className="p-2 rounded-xl border border-[#1a1a1a] text-[#787878] hover:text-white hover:border-[#333] disabled:opacity-30 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <p className="text-center text-[#333] text-xs mt-6 font-mono">SUPERADMIN CANNOT BE DEMOTED OR DELETED</p>
    </div>
  );
}