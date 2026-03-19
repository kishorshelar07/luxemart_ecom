import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, User, Menu, X, Sun, Moon, ChevronDown, LogOut, Settings, Package, LayoutDashboard } from 'lucide-react';
import { toggleTheme, toggleCart, setMobileMenuOpen, logoutUser } from '../../redux/slices/index';
import { productService } from '../../services/api';
import { debounce, formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'New Arrivals', path: '/products?sort=-createdAt' },
  { label: 'Electronics', path: '/category/electronics' },
  { label: 'Fashion', path: '/category/fashion' },
  { label: 'Home & Living', path: '/category/home-living' },
  { label: 'Sale', path: '/products?discount=true', highlight: true },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(s => s.auth);
  const { items: cartItems } = useSelector(s => s.cart);
  const { items: wishlistItems } = useSelector(s => s.wishlist);
  const { theme, mobileMenuOpen } = useSelector(s => s.ui);

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const cartCount = cartItems?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const wishlistCount = wishlistItems?.length || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { dispatch(setMobileMenuOpen(false)); }, [location.pathname]);

  const fetchSuggestions = debounce(async (q) => {
    if (q.length < 2) { setSuggestions({ products: [], categories: [] }); return; }
    setSearchLoading(true);
    try {
      const { data } = await productService.autocomplete(q);
      setSuggestions(data.suggestions);
    } catch {} finally { setSearchLoading(false); }
  }, 300);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchSuggestions(val);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSuggestions({ products: [], categories: [] });
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setUserMenuOpen(false);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const isTransparent = location.pathname === '/' && !scrolled;

  return (
    <>
      <motion.header
        className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${isTransparent ? styles.transparent : ''}`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={`container ${styles.navInner}`}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <span className={styles.logoText}>LUXE</span>
            <span className={styles.logoAccent}>MART</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className={styles.navLinks}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.navLink} ${link.highlight ? styles.navLinkHighlight : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search */}
            <button
              className={`btn btn-ghost btn-icon ${styles.actionBtn}`}
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <button
              className={`btn btn-ghost btn-icon ${styles.actionBtn}`}
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Wishlist */}
            {user && (
              <Link to="/dashboard/wishlist" className={`btn btn-ghost btn-icon ${styles.actionBtn} ${styles.iconBadge}`} data-count={wishlistCount || undefined}>
                <Heart size={20} />
              </Link>
            )}

            {/* Cart */}
            <button
              className={`btn btn-ghost btn-icon ${styles.actionBtn} ${styles.iconBadge}`}
              data-count={cartCount || undefined}
              onClick={() => dispatch(toggleCart())}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
            </button>

            {/* User Menu */}
            {user ? (
              <div ref={userMenuRef} className={styles.userMenuWrapper}>
                <button className={styles.userAvatar} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <img src={user.avatar?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                  <ChevronDown size={14} className={userMenuOpen ? styles.chevronOpen : ''} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className={styles.userDropdown}
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className={styles.dropdownUser}>
                        <p className={styles.dropdownName}>{user.name}</p>
                        <p className={styles.dropdownEmail}>{user.email}</p>
                      </div>
                      <div className={styles.dropdownDivider} />
                      <Link to="/dashboard" className={styles.dropdownItem}><LayoutDashboard size={16} /> Dashboard</Link>
                      <Link to="/dashboard/orders" className={styles.dropdownItem}><Package size={16} /> My Orders</Link>
                      <Link to="/dashboard/profile" className={styles.dropdownItem}><Settings size={16} /> Profile</Link>
                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <Link to="/admin" className={`${styles.dropdownItem} ${styles.adminLink}`}><LayoutDashboard size={16} /> Admin Panel</Link>
                      )}
                      <div className={styles.dropdownDivider} />
                      <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className={`btn btn-ghost btn-icon ${styles.mobileMenuBtn}`}
              onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              ref={searchRef}
              className={styles.searchOverlay}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search for products, brands..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                  className={styles.searchInput}
                />
                <button type="button" onClick={() => { setSearchOpen(false); setSuggestions({ products: [], categories: [] }); }}>
                  <X size={20} />
                </button>
              </form>
              <AnimatePresence>
                {(suggestions.products?.length > 0 || suggestions.categories?.length > 0) && (
                  <motion.div className={styles.suggestions} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {suggestions.categories?.length > 0 && (
                      <div className={styles.suggestionGroup}>
                        <p className={styles.suggestionLabel}>Categories</p>
                        {suggestions.categories.map(cat => (
                          <Link key={cat._id} to={`/category/${cat.slug}`} className={styles.suggestionItem}
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                            <Search size={14} /> {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    {suggestions.products?.length > 0 && (
                      <div className={styles.suggestionGroup}>
                        <p className={styles.suggestionLabel}>Products</p>
                        {suggestions.products.map(p => (
                          <Link key={p._id} to={`/products/${p.slug}`} className={styles.suggestionItem}
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                            {p.image && <img src={p.image} alt={p.name} className={styles.suggestionImg} />}
                            <span>{p.name}</span>
                            {p.brand && <span className={styles.suggestionBrand}>{p.brand}</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <nav className={styles.mobileNav}>
              {NAV_LINKS.map(link => (
                <Link key={link.path} to={link.path} className={`${styles.mobileNavLink} ${link.highlight ? styles.navLinkHighlight : ''}`}>
                  {link.label}
                </Link>
              ))}
              <div className={styles.mobileDivider} />
              {user ? (
                <>
                  <Link to="/dashboard" className={styles.mobileNavLink}>Dashboard</Link>
                  <Link to="/dashboard/orders" className={styles.mobileNavLink}>My Orders</Link>
                  <Link to="/dashboard/wishlist" className={styles.mobileNavLink}>Wishlist</Link>
                  <button className={`${styles.mobileNavLink} ${styles.logoutBtn}`} onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className={styles.mobileNavLink}>Sign In</Link>
                  <Link to="/register" className={styles.mobileNavLink}>Create Account</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      {mobileMenuOpen && <div className={styles.mobileOverlay} onClick={() => dispatch(setMobileMenuOpen(false))} />}
    </>
  );
}
