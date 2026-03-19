import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, X } from 'lucide-react';
import { updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon } from '../redux/slices/index';
import { couponService } from '../services/api';
import { formatPrice, calculateCartTotals } from '../utils/helpers';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, coupon } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const totals = calculateCartTotals(items, coupon?.discount || 0);

  const handleUpdateQty = async (itemId, qty) => {
    try { await dispatch(updateCartItem({ itemId, quantity: qty })).unwrap(); }
    catch (err) { toast.error(err || 'Failed to update'); }
  };

  const handleRemove = async (itemId) => {
    try { await dispatch(removeFromCart(itemId)).unwrap(); toast.success('Removed'); }
    catch { toast.error('Failed to remove'); }
  };

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponService.validate(couponCode, totals.subtotal);
      dispatch(applyCoupon({ code: data.coupon.code, discount: data.coupon.calculatedDiscount }));
      toast.success(`Coupon applied! You save ${formatPrice(data.coupon.calculatedDiscount)}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); }
    finally { setCouponLoading(false); }
  };

  if (items.length === 0) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40, gap: 20 }}>
      <ShoppingBag size={64} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-muted)' }}>Add some amazing products to your cart</p>
      <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
    </div>
  );

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 40 }}>
          Shopping Cart <span style={{ fontFamily: 'var(--font-ui)', fontSize: '1rem', color: 'var(--text-muted)' }}>({totals.itemCount} items)</span>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {items.map(item => {
                const product = item.product || {};
                const img = product.images?.[0]?.url || product.images?.[0] || '';
                return (
                  <motion.div key={item._id} className="card" layout
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, height: 0 }}
                    style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'center' }}>
                    <Link to={`/products/${product.slug || product._id}`}>
                      <img src={img} alt={product.name} style={{ width: 100, height: 116, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/products/${product.slug || product._id}`} style={{ textDecoration: 'none' }}>
                        <p style={{ fontWeight: 500, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{product.name}</p>
                      </Link>
                      {product.brand && <p style={{ fontSize: 12, color: 'var(--accent-gold)', fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{product.brand}</p>}
                      {item.variant && (
                        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                          {Object.entries(item.variant).filter(([,v]) => v).map(([k,v]) => (
                            <span key={k} style={{ fontSize: 11, background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 4, color: 'var(--text-muted)' }}>{k}: {v}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', borderRadius: 8, padding: '6px 14px' }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }} onClick={() => handleUpdateQty(item._id, item.quantity - 1)}><Minus size={15} /></button>
                          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }} onClick={() => handleUpdateQty(item._id, item.quantity + 1)}><Plus size={15} /></button>
                        </div>
                        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 18 }}>{formatPrice(item.price * item.quantity)}</span>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', marginLeft: 'auto', padding: 6, borderRadius: 6, transition: 'all 0.2s' }}
                          onClick={() => handleRemove(item._id)}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--status-error)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Coupon */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Tag size={18} style={{ color: 'var(--accent-gold)' }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600 }}>Apply Coupon</span>
              </div>
              {coupon ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px' }}>
                  <Tag size={14} style={{ color: 'var(--status-success)' }} />
                  <span style={{ fontSize: 14, color: 'var(--status-success)', flex: 1 }}><strong>{coupon.code}</strong> — saved {formatPrice(coupon.discount)}</span>
                  <button onClick={() => dispatch(removeCoupon())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-error)', display: 'flex', fontSize: 18 }}>&times;</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <input className="input-field" placeholder="Enter code (try WELCOME10)" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleCoupon()} />
                  <button className="btn btn-outline" onClick={handleCoupon} disabled={couponLoading}>{couponLoading ? 'Applying...' : 'Apply'}</button>
                </div>
              )}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Try: WELCOME10 · LUXE500 · FESTIVE20</p>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, position: 'sticky', top: 'calc(var(--navbar-height) + 20px)' }}>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, marginBottom: 20 }}>Order Summary</h2>
            {[['Subtotal', formatPrice(totals.subtotal)], ['Shipping', totals.shippingCost === 0 ? 'FREE' : formatPrice(totals.shippingCost)], ...(coupon?.discount > 0 ? [['Coupon Discount', `-${formatPrice(coupon.discount)}`]] : []), ['Tax (GST 18%)', formatPrice(totals.tax)]].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>{l}</span>
                <span style={{ color: l.includes('Discount') ? 'var(--status-success)' : l === 'Shipping' && totals.shippingCost === 0 ? 'var(--status-success)' : 'inherit', fontWeight: l.includes('Discount') || (l === 'Shipping' && totals.shippingCost === 0) ? 600 : 400 }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 4, display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 17 }}>Total</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 22 }}>{formatPrice(totals.total)}</span>
            </div>
            {totals.shippingCost > 0 && (
              <p style={{ fontSize: 12, color: 'var(--accent-gold)', background: 'var(--accent-gold-glow)', border: '1px solid var(--border-gold)', borderRadius: 6, padding: '8px 12px', textAlign: 'center', marginBottom: 16 }}>
                Add {formatPrice(999 - totals.subtotal)} more for FREE shipping
              </p>
            )}
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { if (!user) { navigate('/login?redirect=/checkout'); return; } navigate('/checkout'); }}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <Link to="/products" className="btn btn-outline btn-sm" style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
