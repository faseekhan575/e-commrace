import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../store/authSlice";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { User, Camera, Save, Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setForm({
        fullname: user.fullname || "",
        username: user.username || "",
        email: user.email || "",
      });
      setAvatarPreview(user.avatar?.url);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await axios.patch("/api/v2/user/profile/update", form);
      toast.success("Profile updated successfully");
      dispatch(fetchProfile());
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await axios.patch("/api/v2/user/avatar", formData);
      toast.success("Avatar updated successfully");
      dispatch(fetchProfile());
    } catch (err) {
      toast.error("Failed to update avatar");
      setAvatarPreview(user?.avatar?.url);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    setUpdatingPass(true);
    try {
      await axios.patch("/api/v2/user/password", passwordForm);
      toast.success("Password changed successfully");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-700 text-[#1a1a14] mb-10">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#e8e8e0] rounded-3xl p-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6 group">
              <img
                src={avatarPreview || "/default-avatar.png"}
                alt="Profile"
                className="w-full h-full rounded-2xl object-cover border-4 border-white shadow-md"
              />
              <label className="absolute bottom-2 right-2 w-9 h-9 bg-[#1a1a14] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#3c3c30] transition-colors">
                <Camera size={18} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <h3 className="font-semibold text-xl text-[#1a1a14]">{user?.fullname}</h3>
            <p className="text-[#78786a] text-sm mt-1">@{user?.username}</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-[#e8e8e0] rounded-3xl p-8">
            <h2 className="font-display text-2xl font-700 mb-6">Personal Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#78786a] uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={form.fullname}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-2xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#78786a] uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-2xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#78786a] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-5 py-3.5 rounded-2xl border border-[#e8e8e0] bg-[#f5f5f0] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#1a1a14] text-white rounded-2xl hover:bg-[#3c3c30] transition-colors disabled:opacity-70"
              >
                <Save size={18} />
                {updatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-[#e8e8e0] rounded-3xl p-8">
            <h2 className="font-display text-2xl font-700 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#78786a] uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none pr-12"
                  />
                  <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78786a]">
                    {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#78786a] uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none pr-12"
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78786a]">
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPass}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#1a1a14] text-white rounded-2xl hover:bg-[#3c3c30] transition-colors disabled:opacity-70"
              >
                {updatingPass ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}