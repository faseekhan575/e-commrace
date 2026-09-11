import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";
import { getAccessToken, getSessionRevision, readSessionValue, resetSessionCredentials, setAccessToken, writeSessionValue } from "../utils/session";

const message = (error, fallback) => error.response?.data?.message || error.message || fallback;
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

function parseAuthData(payload) {
  const user = payload?.user || payload;
  if (!user || typeof user !== "object" || !(user._id || user.id) || !user.email) {
    throw new Error("The server did not return a valid account. Please sign in again.");
  }
  return { user, role: user.role || "user", token: payload?.accessToken || payload?.token || null };
}
function authenticate(type, endpoint) {
  return createAsyncThunk(type, async (data, { rejectWithValue }) => {
    try {
      if (endpoint === "google" && !(data?.credential || data?.idToken)) {
        throw new Error("A verified Google credential is required. Please use email sign-in.");
      }
      const revision = getSessionRevision();
      const body = data.email ? { ...data, email: normalizeEmail(data.email) } : data;
      const response = await axios.post(`/api/v1/auth/${endpoint}`, body);
      if (revision !== getSessionRevision()) throw new Error("Your session changed. Please try again.");
      const parsed = parseAuthData(response.data.data);
      if (parsed.user.isVerified === false) throw new Error("Please verify your email before signing in.");
      setAccessToken(parsed.token);
      return { user: parsed.user, accessToken: parsed.token };
    } catch (error) { return rejectWithValue(message(error, "Unable to sign in")); }
  });
}
export const loginUser = authenticate("auth/login", "login");
export const loginWithGoogle = authenticate("auth/loginWithGoogle", "google");
export const verifyOtp = authenticate("auth/verifyOtp", "verify-otp");

export const registerUser = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/v1/auth/register", { ...data, email: normalizeEmail(data.email), username: data.username.trim(), fullname: data.fullname.trim() });
    return response.data;
  } catch (error) { return rejectWithValue(message(error, "Registration failed")); }
});
export const logoutUser = createAsyncThunk("auth/logout", async (_, { dispatch, rejectWithValue }) => {
  try { await axios.post("/api/v1/auth/logout", {}, { skipAuthRefresh: true }); }
  catch (error) { return rejectWithValue(message(error, "The server could not confirm sign-out. Your local session was cleared.")); }
  finally { dispatch(clearSession()); }
});
export const fetchProfile = createAsyncThunk("auth/profile", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/v1/auth/me");
    const parsed = parseAuthData(response.data.data);
    return { user: parsed.user, accessToken: getAccessToken() };
  } catch (error) {
    return rejectWithValue({ message: message(error, "Unable to check your session"), status: error.response?.status || 0 });
  }
}, { condition: (_, { getState }) => getState().auth.sessionStatus !== "checking" });

function clearAuthState(state) {
  resetSessionCredentials();
  state.user = null;
  state.token = null;
  state.role = null;
  state.isAuthenticated = false;
  state.initialized = true;
  state.sessionStatus = "guest";
  state.sessionError = null;
  state.profileRequestId = null;
  state.loading = false;
  state.error = null;
}
function applyAuthenticated(state, payload) {
  const { user, role, token } = parseAuthData(payload);
  state.user = user;
  state.token = token;
  state.role = role;
  state.isAuthenticated = true;
  state.initialized = true;
  state.sessionStatus = "authenticated";
  state.sessionError = null;
  state.loading = false;
  state.error = null;
  state.profileRequestId = null;
  writeSessionValue("userRole", role);
}
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, token: getAccessToken(), role: null, isAuthenticated: false,
    initialized: false, sessionStatus: "idle", sessionError: null, profileRequestId: null,
    loading: false, error: null, otpPending: !!readSessionValue("otpEmail"), otpEmail: readSessionValue("otpEmail"),
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSession: clearAuthState,
    sessionTokenRefreshed: (state, action) => { state.token = action.payload || null; },
    setOtpPending: (state, action) => {
      state.otpPending = true;
      state.otpEmail = normalizeEmail(action.payload);
      writeSessionValue("otpEmail", state.otpEmail);
    },
    clearOtpPending: (state) => { state.otpPending = false; state.otpEmail = null; writeSessionValue("otpEmail", null); },
  },
  extraReducers: (builder) => {
    [loginUser, loginWithGoogle, verifyOtp].forEach((thunk) => {
      builder.addCase(thunk.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(thunk.fulfilled, (state, action) => {
          applyAuthenticated(state, action.payload);
          state.otpPending = false;
          state.otpEmail = null;
          writeSessionValue("otpEmail", null);
        })
        .addCase(thunk.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Unable to sign in"; });
    });
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = false; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProfile.pending, (state, action) => { state.sessionStatus = "checking"; state.sessionError = null; state.profileRequestId = action.meta.requestId; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        if (state.profileRequestId === action.meta.requestId) applyAuthenticated(state, action.payload);
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        if (state.profileRequestId !== action.meta.requestId) return;
        if ([400, 401, 403].includes(action.payload?.status)) clearAuthState(state);
        else {
          state.initialized = true;
          state.sessionStatus = "error";
          state.sessionError = action.payload?.message || "Unable to check your session. Please retry.";
          state.profileRequestId = null;
        }
      });
  },
});
export const { clearError, clearSession, sessionTokenRefreshed, setOtpPending, clearOtpPending } = authSlice.actions;
export default authSlice.reducer;

