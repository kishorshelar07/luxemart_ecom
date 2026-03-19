// Format currency to Indian Rupees
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (date, options = {}) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', ...options
  });
};

// Calculate discount percentage
export const getDiscountPercent = (originalPrice, salePrice) => {
  if (!originalPrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// Truncate text
export const truncate = (str, maxLength = 100) => {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
};

// Generate star rating array
export const generateStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full';
    if (i < rating) return 'half';
    return 'empty';
  });
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Slugify text
export const slugify = (text) => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

// Get order status color
export const getOrderStatusColor = (status) => {
  const map = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#06b6d4',
    out_for_delivery: '#f97316',
    delivered: '#22c55e',
    cancelled: '#ef4444',
    returned: '#6b7280',
    refunded: '#6b7280',
  };
  return map[status] || '#6b7280';
};

// Get payment status color
export const getPaymentStatusColor = (status) => {
  const map = { pending: '#f59e0b', paid: '#22c55e', failed: '#ef4444', refunded: '#6b7280' };
  return map[status] || '#6b7280';
};

// Format order status display
export const formatOrderStatus = (status) => {
  const map = {
    pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
    shipped: 'Shipped', out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned', refunded: 'Refunded',
  };
  return map[status] || status;
};

// Image placeholder
export const getImagePlaceholder = (width = 400, height = 400) =>
  `https://via.placeholder.com/${width}x${height}/1a1a1a/d4af37?text=LuxeMart`;

// Local storage helpers
export const storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  remove: (key) => localStorage.removeItem(key),
};

// Cart total calculation
export const calculateCartTotals = (items, couponDiscount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal >= 999 ? 0 : 99;
  const taxRate = 0.18;
  const afterCoupon = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round(afterCoupon * taxRate);
  const total = afterCoupon + shippingCost + tax;
  return { subtotal, shippingCost, tax, couponDiscount, total, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) };
};

// Validate email
export const isValidEmail = (email) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

// Validate Indian phone
export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));

// Format bytes
export const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

// Generate random ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Check if product in wishlist
export const isInWishlist = (wishlist, productId) =>
  wishlist.some(id => (id._id || id).toString() === productId.toString());
