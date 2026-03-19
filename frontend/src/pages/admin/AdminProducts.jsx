import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, X, Package,
  ChevronLeft, ChevronRight, Star, AlertCircle, Check
} from 'lucide-react';
import { productService, categoryService } from '../../services/api';
import { formatPrice, formatDate, truncate } from '../../utils/helpers';
import styles from './AdminDashboard.module.css';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', shortDescription: '',
  price: '', comparePrice: '', stock: '',
  category: '', brand: '', sku: '', tags: '',
  isFeatured: false, isTrending: false, isPublished: true,
  images: [{ url: '', alt: '', isMain: true }],
  discount: { percentage: 0, isActive: false },
  returnPolicy: '30 days return policy', warranty: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [deleteId, setDeleteId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.keyword = search;
      const { data } = await productService.getAll(params);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    categoryService.getAll()
      .then(r => setCategories(r.data.categories || []))
      .catch(() => {});
  }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      stock: product.stock || '',
      category: product.category?._id || product.category || '',
      brand: product.brand || '',
      sku: product.sku || '',
      tags: (product.tags || []).join(', '),
      isFeatured: product.isFeatured || false,
      isTrending: product.isTrending || false,
      isPublished: product.isPublished !== false,
      images: product.images?.length ? product.images : [{ url: '', alt: '', isMain: true }],
      discount: product.discount || { percentage: 0, isActive: false },
      returnPolicy: product.returnPolicy || '30 days return policy',
      warranty: product.warranty || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    if (!form.stock && form.stock !== 0) { toast.error('Stock is required'); return; }
    if (!form.category) { toast.error('Category is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images: form.images.filter(img => img.url.trim()),
      };

      if (editProduct) {
        await productService.update(editProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await productService.create(payload);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const updateImage = (idx, field, value) => {
    const imgs = [...form.images];
    imgs[idx] = { ...imgs[idx], [field]: value };
    setForm(p => ({ ...p, images: imgs }));
  };

  const addImageRow = () => {
    setForm(p => ({ ...p, images: [...p.images, { url: '', alt: '', isMain: false }] }));
  };

  const removeImageRow = (idx) => {
    setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>{totalProducts} total products</p>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: 38 }}
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Package size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-muted)' }}>No products found</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>
              <Plus size={16} /> Add First Product
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const img = product.images?.[0]?.url || product.images?.[0] || '';
                return (
                  <tr key={product._id}>
                    <td>
                      <div className={styles.productCell}>
                        {img ? (
                          <img src={img} alt={product.name} className={styles.productThumb} />
                        ) : (
                          <div className={styles.productThumb} style={{ background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={14} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>
                            {truncate(product.name, 40)}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {product.brand || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category?.name || '—'}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                        {formatPrice(product.effectivePrice || product.price)}
                      </div>
                      {product.comparePrice > product.price && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {formatPrice(product.comparePrice)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        color: product.stock <= 0 ? 'var(--status-error)' : product.stock <= 10 ? '#f59e0b' : 'var(--status-success)',
                        fontWeight: 600
                      }}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill="#d4af37" color="#d4af37" />
                        <span style={{ fontSize: 12 }}>{product.ratings?.average?.toFixed(1) || '0.0'}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({product.ratings?.count || 0})</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: product.isPublished ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: product.isPublished ? '#22c55e' : '#ef4444'
                      }}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {product.isFeatured && (
                        <span style={{ marginLeft: 4, padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(212,175,55,0.12)', color: '#d4af37' }}>
                          Featured
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(product)}
                          title="Edit"
                          style={{ padding: '6px 8px' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteId(product._id)}
                          title="Delete"
                          style={{ padding: '6px 8px', color: 'var(--status-error)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}
              onClick={e => e.stopPropagation()}
            >
              <AlertCircle size={40} style={{ color: 'var(--status-error)', marginBottom: 16 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 8 }}>Delete Product?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: 'var(--status-error)', borderColor: 'var(--status-error)' }} onClick={() => handleDelete(deleteId)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '24px 16px', overflowY: 'auto' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 20, width: '100%', maxWidth: 680, marginTop: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ padding: '6px 8px' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Basic Info */}
                <Section title="Basic Information">
                  <Field label="Product Name *">
                    <input className="input-field" placeholder="e.g. iPhone 15 Pro Max" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </Field>
                  <Row>
                    <Field label="Price (₹) *">
                      <input className="input-field" type="number" placeholder="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                    </Field>
                    <Field label="Compare Price (₹)">
                      <input className="input-field" type="number" placeholder="Original MRP" value={form.comparePrice} onChange={e => setForm(p => ({ ...p, comparePrice: e.target.value }))} />
                    </Field>
                    <Field label="Stock *">
                      <input className="input-field" type="number" placeholder="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Category *">
                      <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Brand">
                      <input className="input-field" placeholder="e.g. Apple" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
                    </Field>
                    <Field label="SKU">
                      <input className="input-field" placeholder="Optional" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
                    </Field>
                  </Row>
                </Section>

                {/* Description */}
                <Section title="Description">
                  <Field label="Full Description *">
                    <textarea className="input-field" rows={4} placeholder="Detailed product description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
                  </Field>
                  <Field label="Short Description">
                    <input className="input-field" placeholder="Brief one-line description" value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} />
                  </Field>
                  <Field label="Tags (comma separated)">
                    <input className="input-field" placeholder="e.g. mobile, apple, 5g" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
                  </Field>
                </Section>

                {/* Images */}
                <Section title="Product Images">
                  {form.images.map((img, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ flex: 2 }}>
                        <input
                          className="input-field"
                          placeholder={`Image URL ${idx + 1}`}
                          value={img.url}
                          onChange={e => updateImage(idx, 'url', e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          className="input-field"
                          placeholder="Alt text"
                          value={img.alt || ''}
                          onChange={e => updateImage(idx, 'alt', e.target.value)}
                        />
                      </div>
                      {form.images.length > 1 && (
                        <button className="btn btn-ghost btn-sm" onClick={() => removeImageRow(idx)} style={{ padding: '8px', color: 'var(--status-error)', flexShrink: 0 }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {form.images[0]?.url && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {form.images.filter(i => i.url).map((img, idx) => (
                        <img key={idx} src={img.url} alt="preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-medium)' }} onError={e => e.target.style.display = 'none'} />
                      ))}
                    </div>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={addImageRow} style={{ alignSelf: 'flex-start' }}>
                    <Plus size={14} /> Add Image URL
                  </button>
                </Section>

                {/* Settings */}
                <Section title="Settings">
                  <Row>
                    <Field label="Discount %">
                      <input className="input-field" type="number" min="0" max="100" placeholder="0" value={form.discount?.percentage || ''} onChange={e => setForm(p => ({ ...p, discount: { ...p.discount, percentage: Number(e.target.value), isActive: Number(e.target.value) > 0 } }))} />
                    </Field>
                    <Field label="Return Policy">
                      <input className="input-field" placeholder="30 days return policy" value={form.returnPolicy} onChange={e => setForm(p => ({ ...p, returnPolicy: e.target.value }))} />
                    </Field>
                    <Field label="Warranty">
                      <input className="input-field" placeholder="e.g. 1 year" value={form.warranty} onChange={e => setForm(p => ({ ...p, warranty: e.target.value }))} />
                    </Field>
                  </Row>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {[
                      { key: 'isPublished', label: 'Published' },
                      { key: 'isFeatured', label: 'Featured' },
                      { key: 'isTrending', label: 'Trending' },
                    ].map(({ key, label }) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                        <div
                          onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                          style={{
                            width: 20, height: 20, borderRadius: 6, border: `2px solid ${form[key] ? 'var(--accent-gold)' : 'var(--border-medium)'}`,
                            background: form[key] ? 'var(--accent-gold)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {form[key] && <Check size={12} color="#000" />}
                        </div>
                        {label}
                      </label>
                    ))}
                  </div>
                </Section>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : editProduct ? <><Check size={16} /> Update Product</> : <><Plus size={16} /> Create Product</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper components
function Section({ title, children }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'var(--font-ui)' }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  );
}

function Row({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${React.Children.count(children)}, 1fr)`, gap: 12 }}>
      {children}
    </div>
  );
}
