import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { setCartOpen, updateCartItem, removeFromCart } from '../../redux/slices/index';
import { formatPrice, calculateCartTotals } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartOpen } = useSelector(s => s.ui);
  const { items, coupon } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);

  const totals = calculateCartTotals(items, coupon?.discount || 0);

  const handleUpdateQty = async (itemId, qty) => {
    if (qty < 1) return handleRemove(itemId);
    try {
      await dispatch(updateCartItem({ itemId, quantity: qty })).unwrap();
    } catch (err) { toast.error(err || 'Failed to update quantity'); }
  };

  const handleRemove = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success('Item removed');
    } catch { toast.error('Failed to remove item'); }
  };

  const handleCheckout = () => {
    dispatch(setCartOpen(false));
    if (!user) { navigate('/login?redirect=/checkout'); return; }
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setCartOpen(false))}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <motion.aside
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <ShoppingBag size={20} />
                <h2 className={styles.title}>Your Cart</h2>
                {totals.itemCount > 0 && (
                  <span className={styles.itemCount}>{totals.itemCount}</span>
                )}
              </div>
              <button className={`btn btn-ghost btn-icon`} onClick={() => dispatch(setCartOpen(false))}>
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className={styles.items}>
              {items.length === 0 ? (
                <div className={styles.emptyState}>
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Your cart is empty</p>
                  <Link to="/products" className="btn btn-primary btn-sm" onClick={() => dispatch(setCartOpen(false))}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => {
                    const product = item.product || {};
                    const image = product.images?.[0]?.url || product.images?.[0] || '';
                    return (
                      <motion.div
                        key={item._id}
                        className={styles.item}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link to={`/products/${product.slug || product._id}`} onClick={() => dispatch(setCartOpen(false))}>
                          <img src={image} alt={product.name} className={styles.itemImg} />
                        </Link>
                        <div className={styles.itemInfo}>
                          <Link to={`/products/${product.slug || product._id}`} className={styles.itemName} onClick={() => dispatch(setCartOpen(false))}>
                            {product.name}
                          </Link>
                          {item.variant && (
                            <div className={styles.variants}>
                              {item.variant.size && <span>Size: {item.variant.size}</span>}
                              {item.variant.color && <span>Color: {item.variant.color}</span>}
                            </div>
                          )}
                          <div className={styles.itemBottom}>
                            <span className={styles.itemPrice}>{formatPrice(item.price)}</span>
                            <div className={styles.qtyControl}>
                              <button className={styles.qtyBtn} onClick={() => handleUpdateQty(item._id, item.quantity - 1)}>
                                <Minus size={14} />
                              </button>
                              <span className={styles.qty}>{item.quantity}</span>
                              <button className={styles.qtyBtn} onClick={() => handleUpdateQty(item._id, item.quantity + 1)}>
                                <Plus size={14} />
                              </button>
                            </div>
                            <button className={styles.removeBtn} onClick={() => handleRemove(item._id)}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className={styles.footer}>
                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                  </div>
                  {totals.couponDiscount > 0 && (
                    <div className={`${styles.summaryRow} ${styles.discount}`}>
                      <span>Discount</span>
                      <span>-{formatPrice(totals.couponDiscount)}</span>
                    </div>
                  )}
                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span className={totals.shippingCost === 0 ? styles.free : ''}>
                      {totals.shippingCost === 0 ? 'FREE' : formatPrice(totals.shippingCost)}
                    </span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Total</span>
                    <span>{formatPrice(totals.total)}</span>
                  </div>
                </div>

                {totals.shippingCost > 0 && (
                  <p className={styles.freeShippingMsg}>
                    Add {formatPrice(999 - totals.subtotal)} more for FREE shipping
                  </p>
                )}

                <button className={`btn btn-primary ${styles.checkoutBtn}`} onClick={handleCheckout}>
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
                <Link to="/cart" className={`btn btn-outline ${styles.viewCartBtn}`} onClick={() => dispatch(setCartOpen(false))}>
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
