import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";
import { DEFAULT_BANNERS } from "../data/bannerData";

export const fetchActiveBanners = createAsyncThunk("banners/fetchActive", async (collectionType = "", { rejectWithValue }) => {
  try {
    const url = collectionType ? `/api/v10/banner?collectionType=${collectionType}` : "/api/v10/banner";
    const res = await axios.get(url, { timeout: 8000 });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Using fallback banners");
  }
});

export const fetchAdminBanners = createAsyncThunk("banners/fetchAdmin", async (params = {}, { rejectWithValue }) => {
  try {
    const { collectionType = "", isActive = "" } = params;
    const query = new URLSearchParams({
      ...(collectionType && { collectionType }),
      ...(isActive !== "" && { isActive }),
    });
    const res = await axios.get(`/api/v10/banner/admin/all?${query}`, { timeout: 8000 });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createBanner = createAsyncThunk("banners/create", async (formData, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/v10/banner/create", formData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to create banner");
  }
});

export const updateBanner = createAsyncThunk("banners/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`/api/v10/banner/${id}/update`, formData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update banner");
  }
});

export const toggleBannerActive = createAsyncThunk("banners/toggleActive", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`/api/v10/banner/${id}/toggle-active`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteBanner = createAsyncThunk("banners/delete", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/v10/banner/${id}/delete`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const bannerSlice = createSlice({
  name: "banners",
  initialState: {
    activeList: DEFAULT_BANNERS,
    adminList: DEFAULT_BANNERS,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveBanners.fulfilled, (state, action) => {
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.activeList = action.payload;
        }
      })
      .addCase(fetchAdminBanners.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminBanners.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.banners) {
          state.adminList = action.payload.banners;
        } else if (Array.isArray(action.payload)) {
          state.adminList = action.payload;
        }
      })
      .addCase(fetchAdminBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.adminList.unshift(action.payload);
        state.activeList.unshift(action.payload);
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        const idx = state.adminList.findIndex((b) => b._id === action.payload._id || b.id === action.payload._id);
        if (idx !== -1) state.adminList[idx] = action.payload;
        const actIdx = state.activeList.findIndex((b) => b._id === action.payload._id || b.id === action.payload._id);
        if (actIdx !== -1) state.activeList[actIdx] = action.payload;
      })
      .addCase(toggleBannerActive.fulfilled, (state, action) => {
        const target = state.adminList.find((b) => b._id === action.payload._id || b.id === action.payload._id);
        if (target) target.isActive = action.payload.isActive;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.adminList = state.adminList.filter((b) => b._id !== action.payload && b.id !== action.payload);
        state.activeList = state.activeList.filter((b) => b._id !== action.payload && b.id !== action.payload);
      });
  },
});

export default bannerSlice.reducer;
