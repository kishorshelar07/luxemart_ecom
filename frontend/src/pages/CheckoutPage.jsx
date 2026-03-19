import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CreditCard, Truck, Tag, Plus, Check, Lock } from 'lucide-react';
import { orderService, couponService } from '../services/api';
import { clearLocalCart } from '../redux/slices/index';
import { formatPrice, calculateCartTotals } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './CheckoutPage.module.css';

const STEPS = ['Cart', 'Delivery', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, coupon } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0] || null);
  const [newAddress, setNewAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(!user?.addresses?.length);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(coupon || null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', pincode: '', country: 'India' });

  const totals = calculateCartTotals(items, appliedCoupon?.discount || 0);

  useEffect(() => {
    if (!items.length) navigate('/cart');
  }, [items.length]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponService.validate(couponCode, totals.subtotal);
      setAppliedCoupon({ code: data.coupon.code, discount: data.coupon.calculatedDiscount });
      toast.success(`Coupon applied! You save ${formatPrice(data.coupon.calculatedDiscount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  const handlePlaceOrder = async () => {
    const addr = showAddressForm ? addressForm : selectedAddress;
    if (!addr?.street || !addr?.city || !addr?.pincode) {
      toast.error('Please complete delivery address');
      setStep(1);
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        items: items.map(i => ({
          product: i.product._id || i.product,
          quantity: i.quantity,
          variant: i.variant
        })),
        shippingAddress: addr,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      if (paymentMethod === 'cod') {
        const { data } = await orderService.create(orderData);
        dispatch(clearLocalCart());
        navigate(`/order-success/${data.order._id}`);
        return;
      }

      // Razorpay flow
      const updatedTotals = calculateCartTotals(items, appliedCoupon?.discount || 0);
      const { data: rzpData } = await orderService.createRazorpayOrder(updatedTotals.total);

      const options = {
        key: rzpData.key,
        amount: rzpData.order.amount,
        currency: rzpData.order.currency,
        name: 'LuxeMart',
        description: 'Premium Shopping Experience',
        image: '/logo.png',
        order_id: rzpData.order.id,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone || '' },
        theme: { color: '#d4af37' },
        handler: async (response) => {
          const { data: orderResult } = await orderService.create(orderData);
          await orderService.verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderResult.order._id
          });
          dispatch(clearLocalCart());
          navigate(`/order-success/${orderResult.order._id}`);
        },
        modal: { ondismiss: () => { setPlacing(false); toast.error('Payment cancelled'); } }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  const shippingAddress = showAddressForm ? addressForm : selectedAddress;

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.pageTitle}>Checkout</h1>

        {/* Progress Steps */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`${styles.step} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
                <div className={styles.stepDot}>
                  {i < step ? <Check size={14} /> : <span>{i + 1}</span>}
                </div>
                <span className={styles.stepLabel}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className={styles.layout}>
          {/* ===== LEFT: FORM ===== */}
          <div className={styles.form}>
            {/* DELIVERY ADDRESS */}
            <div className={`${styles.section} ${step >= 1 ? '' : styles.sectionDisabled}`}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}><Truck size={18} /></div>
                <h2 className={styles.sectionTitle}>Delivery Address</h2>
                {step > 1 && shippingAddress && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ marginLeft: 'auto' }}>Change</button>
                )}
              </div>

              <AnimatePresence>
                {(step === 1 || !selectedAddress) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Saved Addresses */}
                    {user?.addresses?.length > 0 && !showAddressForm && (
                      <div className={styles.savedAddresses}>
                        {user.addresses.map(addr => (
                          <label key={addr._id} className={`${styles.addressCard} ${selectedAddress?._id === addr._id ? styles.addressCardActive : ''}`}>
                            <input type="radio" name="address" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} className={styles.radioHidden} />
                            <div className={styles.addressCardInner}>
                              <div className={styles.addressRadio}>
                                <div className={`${styles.radioCircle} ${selectedAddress?._id === addr._id ? styles.radioCircleActive : ''}`} />
                              </div>
                              <div>
                                <div className={styles.addressTop}>
                                  <span className={`badge badge-gold ${styles.addressLabel}`}>{addr.label}</span>
                                  {addr.isDefault && <span className={`badge badge-success`}>Default</span>}
                                </div>
                                <p className={styles.addressName}>{addr.fullName} — {addr.phone}</p>
                                <p className={styles.addressText}>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                        <button className={`btn btn-outline btn-sm`} onClick={() => setShowAddressForm(true)}>
                          <Plus size={16} /> Add New Address
                        </button>
                      </div>
                    )}

                    {/* Address Form */}
                    {showAddressForm && (
                      <div className={styles.addressForm}>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>Full Name *</label>
                            <input className="input-field" value={addressForm.fullName} onChange={e => setAddressForm(p => ({ ...p, fullName: e.target.value }))} placeholder="John Doe" required />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Phone *</label>
                            <input className="input-field" value={addressForm.phone} onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" required />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label>Street Address *</label>
                          <input className="input-field" value={addressForm.street} onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))} placeholder="House/Flat no, Street, Area" required />
                        </div>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>City *</label>
                            <input className="input-field" value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" required />
                          </div>
                          <div className={styles.formGroup}>
                            <label>State *</label>
                            <input className="input-field" value={addressForm.state} onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} placeholder="Maharashtra" required />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Pincode *</label>
                            <input className="input-field" value={addressForm.pincode} onChange={e => setAddressForm(p => ({ ...p, pincode: e.target.value }))} placeholder="400001" required maxLength={6} />
                          </div>
                        </div>
                        {user?.addresses?.length > 0 && (
                          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddressForm(false)}>Use Saved Address</button>
                        )}
                      </div>
                    )}

                    <button className="btn btn-primary" onClick={() => {
                      if (!shippingAddress?.street) { toast.error('Please enter a valid address'); return; }
                      setStep(2);
                    }}>
                      Continue to Payment <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {step > 1 && shippingAddress && (
                <div className={styles.addressSummary}>
                  <p className={styles.addressName}>{shippingAddress.fullName} — {shippingAddress.phone}</p>
                  <p className={styles.addressText}>{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                </div>
              )}
            </div>

            {/* PAYMENT METHOD */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  className={styles.section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}><CreditCard size={18} /></div>
                    <h2 className={styles.sectionTitle}>Payment Method</h2>
                  </div>

                  <div className={styles.paymentOptions}>
                    {[
                      { id: 'razorpay', label: 'Online Payment', sub: 'Cards, UPI, Net Banking, Wallets', icon: '💳' },
                      { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive', icon: '💵' },
                    ].map(method => (
                      <label key={method.id} className={`${styles.paymentCard} ${paymentMethod === method.id ? styles.paymentCardActive : ''}`}>
                        <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className={styles.radioHidden} />
                        <span className={styles.paymentEmoji}>{method.icon}</span>
                        <div>
                          <p className={styles.paymentLabel}>{method.label}</p>
                          <p className={styles.paymentSub}>{method.sub}</p>
                        </div>
                        <div className={`${styles.radioCircle} ${paymentMethod === method.id ? styles.radioCircleActive : ''}`} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                      </label>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className={styles.couponSection}>
                    <div className={styles.sectionHeader} style={{ marginBottom: 12 }}>
                      <div className={styles.sectionIcon}><Tag size={16} /></div>
                      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600 }}>Apply Coupon</span>
                    </div>
                    {appliedCoupon ? (
                      <div className={styles.appliedCoupon}>
                        <Tag size={16} />
                        <span><strong>{appliedCoupon.code}</strong> — {formatPrice(appliedCoupon.discount)} off</span>
                        <button className={styles.removeCoupon} onClick={() => setAppliedCoupon(null)}>&times;</button>
                      </div>
                    ) : (
                      <div className={styles.couponInput}>
                        <input
                          className="input-field"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        />
                        <button className="btn btn-outline" onClick={applyCoupon} disabled={couponLoading}>
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ===== RIGHT: ORDER SUMMARY ===== */}
          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            {/* Items */}
            <div className={styles.summaryItems}>
              {items.map(item => {
                const product = item.product || {};
                const img = product.images?.[0]?.url || product.images?.[0] || '';
                return (
                  <div key={item._id} className={styles.summaryItem}>
                    <div className={styles.summaryItemImg}>
                      <img src={img} alt={product.name} />
                      <span className={styles.qtyBadge}>{item.quantity}</span>
                    </div>
                    <div className={styles.summaryItemInfo}>
                      <p className={styles.summaryItemName}>{product.name}</p>
                      {item.variant && (
                        <p className={styles.summaryItemVariant}>
                          {Object.entries(item.variant).filter(([,v]) => v).map(([k,v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className={styles.summaryItemPrice}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="divider" />

            {/* Totals */}
            <div className={styles.totalsBlock}>
              <div className={styles.totalRow}><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
              {appliedCoupon?.discount > 0 && <div className={`${styles.totalRow} ${styles.discountRow}`}><span>Discount ({appliedCoupon.code})</span><span>-{formatPrice(appliedCoupon.discount)}</span></div>}
              <div className={styles.totalRow}><span>Shipping</span><span className={totals.shippingCost === 0 ? styles.free : ''}>{totals.shippingCost === 0 ? 'FREE' : formatPrice(totals.shippingCost)}</span></div>
              <div className={styles.totalRow}><span>GST (18%)</span><span>{formatPrice(totals.tax)}</span></div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>Total</span><span>{formatPrice(totals.total)}</span></div>
            </div>

            {step >= 2 && (
              <motion.button
                className={`btn btn-primary btn-lg ${styles.placeOrderBtn}`}
                onClick={handlePlaceOrder}
                disabled={placing}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Lock size={18} />
                {placing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Securely'}
              </motion.button>
            )}

            <p className={styles.secureNote}>
              <Lock size={12} /> 100% Secure & Encrypted Checkout
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
