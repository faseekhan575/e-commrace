import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { Shield, UserX, Trash2, Search, Crown, X } from "lucide-react";

const gold = "#f9c938";

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

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v8/superadmin/admins");
      setAdmins(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch admins");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const ask = (message, onConfirm) => setConfirm({ message, onConfirm });

  const demote = (userId) => ask("Demote this Admin to regular User?", async () => {
    setConfirm(null);
    try {
      await axios.patch(`/api/v8/superadmin/demote/${userId}`);
      toast.success("Admin demoted");
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  });

  const deleteAdmin = (userId) => ask("Delete this admin permanently?", async () => {
    setConfirm(null);
    try {
      await axios.delete(`/api/v8/superadmin/delete/${userId}`);
      toast.success("Admin deleted");
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  });

  const filtered = admins.filter((a) =>
    a.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.username?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="font-display text-2xl sm:text-3xl font-700 text-white">Admins</h1>
          <p className="text-xs text-[#525252] mt-0.5">{filtered.length} active administrators</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border self-start"
          style={{ borderColor: "#a78bfa30", backgroundColor: "#a78bfa08" }}>
          <Shield size={13} style={{ color: "#a78bfa" }} />
          <span className="text-xs font-mono" style={{ color: "#a78bfa" }}>{admins.length} Admins</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#525252]" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search admins..."
          className="w-full bg-[#080808] border border-[#1a1a1a] pl-11 pr-10 py-3 rounded-xl text-white text-sm placeholder:text-[#333] outline-none transition-all"
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
              {["Admin", "Email", "Role", "Actions"].map((h, i) => (
                <th key={h} className={`px-5 py-4 text-[10px] font-mono uppercase tracking-widest text-[#525252] ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0d0d0d]">
            {loading ? [...Array(4)].map((_, i) => (
              <tr key={i}>
                {[...Array(4)].map((_, j) => (
                  <td key={j} className="px-5 py-4"><div className="h-4 bg-[#111] rounded animate-pulse" /></td>
                ))}
              </tr>
            )) : filtered.map((admin) => (
              <tr key={admin._id} className="hover:bg-[#0d0d0d] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {admin.avatar?.url
                      ? <img src={admin.avatar.url} className="w-9 h-9 rounded-xl object-cover border border-[#1a1a1a]" alt="" />
                      : <div className="w-9 h-9 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center">
                          <Shield size={14} style={{ color: "#a78bfa" }} />
                        </div>
                    }
                    <div>
                      <p className="text-sm font-medium text-white">{admin.fullname}</p>
                      <p className="text-xs text-[#525252]">@{admin.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-[#787878]">{admin.email}</td>
                <td className="px-5 py-4">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#a78bfa20", color: "#a78bfa" }}>
                    ADMIN
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => demote(admin._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a1a1a] text-xs text-[#787878] hover:border-red-500/30 hover:text-red-400 transition-all">
                      <UserX size={12} /> Demote
                    </button>
                    <button onClick={() => deleteAdmin(admin._id)}
                      className="p-2 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-[#525252] hover:text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="text-center text-[#525252] text-sm py-12">No admins found</p>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? [...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-[#080808] border border-[#1a1a1a] rounded-2xl animate-pulse" />
        )) : filtered.map((admin) => (
          <div key={admin._id} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              {admin.avatar?.url
                ? <img src={admin.avatar.url} className="w-10 h-10 rounded-xl object-cover border border-[#1a1a1a]" alt="" />
                : <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center">
                    <Shield size={15} style={{ color: "#a78bfa" }} />
                  </div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{admin.fullname}</p>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#a78bfa20", color: "#a78bfa" }}>ADMIN</span>
                </div>
                <p className="text-xs text-[#525252] truncate">{admin.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => demote(admin._id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#1a1a1a] text-xs text-[#787878] hover:text-red-400 transition-all">
                <UserX size={11} /> Demote to User
              </button>
              <button onClick={() => deleteAdmin(admin._id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-red-400 border border-transparent hover:border-red-500/20 transition-all ml-auto">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-[#525252] text-sm py-12">No admins found</p>
        )}
      </div>

      <p className="text-center text-[#1a1a1a] text-xs mt-8 font-mono uppercase tracking-widest">
        Superadmin cannot be demoted or deleted
      </p>
    </div>
  );
}