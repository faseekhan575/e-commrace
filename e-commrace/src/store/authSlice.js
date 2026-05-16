import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";

export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/v1/auth/login", credentials);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const registerUser = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/v1/auth/register", data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const verifyOtp = createAsyncThunk("auth/verifyOtp", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/v1/auth/verify-otp", data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "OTP verification failed");
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await axios.post("/api/v1/auth/logout");
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Logout failed");
  }
});

export const fetchProfile = createAsyncThunk("auth/profile", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/api/v2/user/profile");
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    role: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    otpPending: false,
    otpEmail: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setOtpPending: (state, action) => {
      state.otpPending = true;
      state.otpEmail = action.payload;
    },
    clearOtpPending: (state) => {
      state.otpPending = false;
      state.otpEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // REGISTER
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = false; })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // VERIFY OTP
      .addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.otpPending = false;
        state.otpEmail = null;
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        localStorage.removeItem("accessToken");
      })
      // PROFILE
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.role = action.payload.role;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        localStorage.removeItem("accessToken");
      });
  },
});

export const { clearError, setOtpPending, clearOtpPending } = authSlice.actions;
export default authSlice.reducer;