import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";

const DEFAULT_SPOTLIGHT = {
  _id: "default-spotlight-1",
  eyebrow: "FESTIVE EDITORIAL 2026",
  title: "Raw Silk Zari Kurta with Organza Dupatta",
  description: "Crafted from pure 80-gram raw silk with intricate antique kora-dabka neckline hand embroidery, paired with a laser-cut organza dupatta with scalloped borders.",
  price: 12500,
  currency: "PKR",
  dispatchBadge: "✓ Ready to Dispatch in 24h",
  hotspot: {
    text: "✨ Shop The Model's Kurta",
    posX: 35,
    posY: 42,
  },
  image: {
    url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85",
  },
  primaryCta: {
    text: "SHOP THIS COMPLETE OUTFIT",
    link: "/products",
  },
  secondaryCta: {
    text: "VIEW FULL LOOKBOOK",
    link: "/products?category=luxury-pret",
  },
  isActive: true,
};

export const fetchActiveSpotlights = createAsyncThunk(
  "spotlight/fetchActive",
  async (sectionTag = "festive_spotlight", { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v11/spotlight?sectionTag=${sectionTag}`, { timeout: 8000 });
      const data = res.data.data;
      if (Array.isArray(data) && data.length > 0) return data;
      return [DEFAULT_SPOTLIGHT];
    } catch {
      return [DEFAULT_SPOTLIGHT];
    }
  }
);

export const fetchAdminSpotlights = createAsyncThunk("spotlight/fetchAdmin", async (params = {}, { rejectWithValue }) => {
  try { const response = await axios.get("/api/v11/spotlight/admin/all", { params }); const data = response.data.data; return Array.isArray(data) ? data : data?.spotlights || []; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to load spotlights"); }
});

export const createSpotlight = createAsyncThunk(
  "spotlight/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/v11/spotlight/create", formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create spotlight");
    }
  }
);

export const updateSpotlight = createAsyncThunk(
  "spotlight/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/api/v11/spotlight/${id}/update`, formData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update spotlight");
    }
  }
);

export const toggleSpotlightActive = createAsyncThunk(
  "spotlight/toggleActive",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/api/v11/spotlight/${id}/toggle-active`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to toggle spotlight status");
    }
  }
);

export const deleteSpotlight = createAsyncThunk(
  "spotlight/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/v11/spotlight/${id}/delete`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete spotlight");
    }
  }
);

const spotlightSlice = createSlice({
  name: "spotlight",
  initialState: {
    activeSpotlight: DEFAULT_SPOTLIGHT,
    adminList: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveSpotlights.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveSpotlights.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.activeSpotlight = action.payload[0];
        }
      })
      .addCase(fetchActiveSpotlights.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchAdminSpotlights.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdminSpotlights.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAdminSpotlights.fulfilled, (state, action) => {
        state.loading = false; state.adminList = action.payload || [];
      })
      .addCase(createSpotlight.fulfilled, (state, action) => {
        state.adminList.unshift(action.payload);
        state.activeSpotlight = action.payload;
      })
      .addCase(updateSpotlight.fulfilled, (state, action) => {
        const idx = state.adminList.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.adminList[idx] = action.payload;
        if (state.activeSpotlight?._id === action.payload._id) {
          state.activeSpotlight = action.payload;
        }
      })
      .addCase(toggleSpotlightActive.fulfilled, (state, action) => {
        const idx = state.adminList.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.adminList[idx] = action.payload;
        if (state.activeSpotlight?._id === action.payload._id) {
          state.activeSpotlight = action.payload;
        }
      })
      .addCase(deleteSpotlight.fulfilled, (state, action) => {
        state.adminList = state.adminList.filter((s) => s._id !== action.payload);
        if (state.activeSpotlight?._id === action.payload) {
          state.activeSpotlight = state.adminList[0] || DEFAULT_SPOTLIGHT;
        }
      });
  },
});

export default spotlightSlice.reducer;
