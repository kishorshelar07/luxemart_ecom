import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, List, X, ChevronDown, ChevronUp, Star, Search } from 'lucide-react';
import { fetchProducts } from '../redux/slices/index';
import ProductCard from '../components/product/ProductCard';
import { categoryService } from '../services/api';
import { debounce } from '../utils/helpers';
import styles from './ProductsPage.module.css';

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Best Rated', value: '-ratings.average' },
  { label: 'Most Popular', value: '-soldCount' },
  { label: 'Most Reviewed', value: '-ratings.count' },
];

const PRICE_RANGES = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 - ₹20,000', min: 5000, max: 20000 },
  { label: '₹20,000 - ₹1,00,000', min: 20000, max: 100000 },
  { label: 'Above ₹1,00,000', min: 100000, max: 9999999 },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list: products, loading, totalPages, currentPage, totalProducts } = useSelector(s => s.products);

  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layout, setLayout] = useState('grid');
  const [expandedSections, setExpandedSections] = useState({ categories: true, price: true, rating: true });

  // Filter state from URL
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    categoryService.getAll().then(r => setCategories(r.data.categories || []));
  }, []);

  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.minRating = minRating;
    params.page = page;
    params.limit = 12;
    dispatch(fetchProducts(params));
  }, [dispatch, keyword, category, sort, minPrice, maxPrice, minRating, page]);

  const updateFilter = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = keyword || category || minPrice || maxPrice || minRating;

  const toggleSection = (section) => {
    setExpandedSections(p => ({ ...p, [section]: !p[section] }));
  };

  const FilterSection = ({ title, section, children }) => (
    <div className={styles.filterSection}>
      <button className={styles.filterSectionHeader} onClick={() => toggleSection(section)}>
        <span>{title}</span>
        {expandedSections[section] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.filterSectionBody}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              {keyword ? `Results for "${keyword}"` : 'All Products'}
            </h1>
            <p className={styles.pageCount}>
              {loading ? 'Loading...' : `${totalProducts.toLocaleString()} products found`}
            </p>
          </div>
          <div className={styles.headerActions}>
            {/* Sort */}
            <div className={styles.sortWrapper}>
              <select
                value={sort}
                onChange={e => updateFilter('sort', e.target.value)}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* Layout toggle */}
            <div className={styles.layoutToggle}>
              <button
                className={`${styles.layoutBtn} ${layout === 'grid' ? styles.active : ''}`}
                onClick={() => setLayout('grid')}
              ><Grid3X3 size={18} /></button>
              <button
                className={`${styles.layoutBtn} ${layout === 'list' ? styles.active : ''}`}
                onClick={() => setLayout('list')}
              ><List size={18} /></button>
            </div>
            {/* Filter toggle (mobile) */}
            <button
              className={`btn btn-outline btn-sm ${styles.filterToggle}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className={styles.activeFilters}>
            {keyword && <FilterTag label={`Search: ${keyword}`} onRemove={() => updateFilter('keyword', '')} />}
            {category && <FilterTag label={`Category: ${category}`} onRemove={() => updateFilter('category', '')} />}
            {(minPrice || maxPrice) && <FilterTag label={`Price: ₹${minPrice || 0} - ₹${maxPrice || '∞'}`} onRemove={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }} />}
            {minRating && <FilterTag label={`Rating: ${minRating}+ stars`} onRemove={() => updateFilter('minRating', '')} />}
            <button className={styles.clearAll} onClick={clearFilters}>Clear All <X size={14} /></button>
          </div>
        )}

        <div className={styles.layout}>
          {/* ===== FILTERS SIDEBAR ===== */}
          <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Filters</h2>
              <button className={`btn btn-ghost btn-icon`} onClick={() => setFiltersOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Categories */}
            <FilterSection title="Categories" section="categories">
              <div className={styles.filterList}>
                <label className={styles.filterOption}>
                  <input type="radio" name="category" checked={!category} onChange={() => updateFilter('category', '')} />
                  <span>All Categories</span>
                </label>
                {categories.map(cat => (
                  <label key={cat._id} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="category"
                      checked={category === cat._id || category === cat.slug}
                      onChange={() => updateFilter('category', cat._id)}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range" section="price">
              <div className={styles.filterList}>
                {PRICE_RANGES.map(range => (
                  <label key={range.label} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="price"
                      checked={minPrice === String(range.min) && maxPrice === String(range.max)}
                      onChange={() => {
                        updateFilter('minPrice', range.min);
                        updateFilter('maxPrice', range.max);
                      }}
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
              <div className={styles.customPrice}>
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={e => updateFilter('minPrice', e.target.value)}
                  className={styles.priceInput}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={e => updateFilter('maxPrice', e.target.value)}
                  className={styles.priceInput}
                />
              </div>
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Customer Rating" section="rating">
              <div className={styles.filterList}>
                {[4, 3, 2, 1].map(r => (
                  <label key={r} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === String(r)}
                      onChange={() => updateFilter('minRating', r)}
                    />
                    <div className={styles.ratingOption}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < r ? 'var(--accent-gold)' : 'none'} stroke={i < r ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                      ))}
                      <span>& above</span>
                    </div>
                  </label>
                ))}
              </div>
            </FilterSection>

            {hasActiveFilters && (
              <button className={`btn btn-outline ${styles.clearBtn}`} onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Sidebar overlay (mobile) */}
          {filtersOpen && <div className={styles.sidebarOverlay} onClick={() => setFiltersOpen(false)} />}

          {/* ===== PRODUCTS GRID ===== */}
          <main className={styles.main}>
            {loading ? (
              <div className={layout === 'grid' ? 'grid-products' : styles.listProducts}>
                {Array(12).fill(null).map((_, i) => (
                  <div key={i} className="card">
                    <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 0 }} />
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="skeleton" style={{ height: 12, width: '60%' }} />
                      <div className="skeleton" style={{ height: 16, width: '90%' }} />
                      <div className="skeleton" style={{ height: 16, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className={styles.noResults}>
                <Search size={48} strokeWidth={1} />
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className={layout === 'grid' ? 'grid-products' : styles.listProducts}>
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} layout={layout} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={`btn btn-outline btn-sm`}
                  disabled={page <= 1}
                  onClick={() => updateFilter('page', page - 1)}
                >Previous</button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) pageNum = i + 1;
                    else if (page <= 4) pageNum = i + 1;
                    else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                    else pageNum = page - 3 + i;

                    return (
                      <button
                        key={pageNum}
                        className={`${styles.pageBtn} ${pageNum === page ? styles.pageBtnActive : ''}`}
                        onClick={() => updateFilter('page', pageNum)}
                      >{pageNum}</button>
                    );
                  })}
                </div>

                <button
                  className={`btn btn-outline btn-sm`}
                  disabled={page >= totalPages}
                  onClick={() => updateFilter('page', page + 1)}
                >Next</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--accent-gold-glow)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-full)', fontSize: 13, color: 'var(--accent-gold)', cursor: 'default' }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'inherit' }}><X size={13} /></button>
    </span>
  );
}
