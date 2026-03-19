import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ====================== AUTH SLICE ======================
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('token'), loading: false, error: null, initialized: false },
  reducers: {
    clearError: (state) => { state.error = null; },
    setInitialized: (state) => { state.initialized = true; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, { payload }) => { state.loading = false; state.user = payload.user; state.token = payload.token; state.initialized = true; })
      .addCase(loginUser.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, { payload }) => { state.loading = false; state.user = payload.user; state.token = payload.token; state.initialized = true; })
      .addCase(registerUser.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => { state.user = payload.user; state.initialized = true; })
      .addCase(fetchCurrentUser.rejected, (state) => { state.user = null; state.token = null; state.initialized = true; localStorage.removeItem('token'); })
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.token = null; })
      .addCase(updateProfile.fulfilled, (state, { payload }) => { state.user = payload.user; });
  }
});
export const { clearError, setInitialized } = authSlice.actions;
export const authReducer = authSlice.reducer;

// ====================== CART SLICE ======================
export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/cart'); return data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk('cart/add', async (item, { rejectWithValue }) => {
  try { const { data } = await api.post('/cart/add', item); return data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/cart/update/${itemId}`, { quantity }); return data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try { const { data } = await api.delete(`/cart/remove/${itemId}`); return data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const clearCart = createAsyncThunk('cart/clear', async () => {
  await api.delete('/cart/clear');
  return { items: [], coupon: null };
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], coupon: null, loading: false, error: null },
  reducers: {
    setCart: (state, { payload }) => { if (payload) { state.items = payload.items || []; state.coupon = payload.coupon; } },
    applyCoupon: (state, { payload }) => { state.coupon = payload; },
    removeCoupon: (state) => { state.coupon = null; },
    clearLocalCart: (state) => { state.items = []; state.coupon = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, { payload }) => { state.loading = false; if (payload) { state.items = payload.items || []; state.coupon = payload.coupon; } })
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })
      .addCase(addToCart.fulfilled, (state, { payload }) => { if (payload) { state.items = payload.items || []; } })
      .addCase(updateCartItem.fulfilled, (state, { payload }) => { if (payload) { state.items = payload.items || []; } })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => { if (payload) { state.items = payload.items || []; } })
      .addCase(clearCart.fulfilled, (state) => { state.items = []; state.coupon = null; });
  }
});
export const { setCart, applyCoupon, removeCoupon, clearLocalCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

// ====================== WISHLIST SLICE ======================
export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/wishlist'); return data.wishlist; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const toggleWishlistItem = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try { const { data } = await api.post('/wishlist/toggle', { productId }); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, { payload }) => { state.items = payload || []; })
      .addCase(toggleWishlistItem.fulfilled, (state, { payload }) => {
        if (payload.added) {
          // Will be refetched on next mount
        }
      });
  }
});
export const wishlistReducer = wishlistSlice.reducer;

// ====================== PRODUCT SLICE ======================
export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/products?${queryString}`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/products/${id}`); return data.product; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchFeaturedProducts = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/products/featured'); return data.products; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchTrendingProducts = createAsyncThunk('products/trending', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/products/trending'); return data.products; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    list: [], featured: [], trending: [], currentProduct: null,
    loading: false, error: null, totalPages: 1, currentPage: 1, totalProducts: 0
  },
  reducers: { clearCurrentProduct: (state) => { state.currentProduct = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => { state.loading = false; state.list = payload.products; state.totalPages = payload.totalPages; state.currentPage = payload.currentPage; state.totalProducts = payload.totalProducts; })
      .addCase(fetchProducts.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; })
      .addCase(fetchProduct.fulfilled, (state, { payload }) => { state.loading = false; state.currentProduct = payload; })
      .addCase(fetchProduct.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, { payload }) => { state.featured = payload; })
      .addCase(fetchTrendingProducts.fulfilled, (state, { payload }) => { state.trending = payload; });
  }
});
export const { clearCurrentProduct } = productSlice.actions;
export const productReducer = productSlice.reducer;

// ====================== UI SLICE ======================
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: localStorage.getItem('theme') || 'dark',
    cartOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
    loading: false
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    setTheme: (state, { payload }) => {
      state.theme = payload;
      localStorage.setItem('theme', payload);
      document.documentElement.setAttribute('data-theme', payload);
    },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    setCartOpen: (state, { payload }) => { state.cartOpen = payload; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    setMobileMenuOpen: (state, { payload }) => { state.mobileMenuOpen = payload; },
    setGlobalLoading: (state, { payload }) => { state.loading = payload; },
  }
});
export const { toggleTheme, setTheme, toggleCart, setCartOpen, toggleSearch, toggleMobileMenu, setMobileMenuOpen, setGlobalLoading } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

export default {
  auth: authReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  products: productReducer,
  ui: uiReducer,
};
