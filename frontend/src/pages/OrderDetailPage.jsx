import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { orderService } from '../services/api';
import { formatPrice, formatDate, formatOrderStatus, getOrderStatusColor } from '../utils/helpers';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderService.getOne(id).then(r => setOrder(r.data.order)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const r = await orderService.cancel(id, 'Cancelled by customer');
      setOrder(r.data.order);
    } catch { alert('Failed to cancel order'); }
    finally { setCancelling(false); }
  };

  if (loading) return <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!order) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Order not found</div>;

  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.orderStatus);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <Link to="/dashboard/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 32, fontSize: 14 }}>
          <ChevronLeft size={16} /> Back to Orders
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: 6 }}>Order Details</h1>
            <p style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>{order.orderId}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="badge" style={{ background: `${getOrderStatusColor(order.orderStatus)}22`, color: getOrderStatusColor(order.orderStatus), border: `1px solid ${getOrderStatusColor(order.orderStatus)}44`, fontSize: 13, padding: '6px 14px' }}>
              {formatOrderStatus(order.orderStatus)}
            </span>
            {canCancel && (
              <button className="btn btn-outline btn-sm" onClick={handleCancel} disabled={cancelling}
                style={{ color: 'var(--status-error)', borderColor: 'var(--status-error)' }}>
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Items */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, marginBottom: 20 }}>Order Items ({order.items?.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {order.items?.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                    <img src={item.image} alt={item.name} style={{ width: 80, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, marginBottom: 6 }}>{item.name}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, marginBottom: 12 }}>Delivery Address</h3>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>{order.shippingAddress?.fullName}</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}<br />
                {order.shippingAddress?.phone}
              </p>
            </div>

            {/* Timeline */}
            {order.timeline?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, marginBottom: 20 }}>Order Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[...order.timeline].reverse().map((event, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'var(--accent-gold-glow)' : 'var(--bg-tertiary)', border: `2px solid ${i === 0 ? 'var(--accent-gold)' : 'var(--border-medium)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle size={13} color={i === 0 ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14, textTransform: 'capitalize' }}>{event.status}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{event.message}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(event.timestamp, { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="card" style={{ padding: 24, position: 'sticky', top: 'calc(var(--navbar-height) + 20px)' }}>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, marginBottom: 20 }}>Order Summary</h3>
            {[
              ['Subtotal', formatPrice(order.pricing?.subtotal)],
              ['Shipping', order.pricing?.shippingCost === 0 ? 'FREE' : formatPrice(order.pricing?.shippingCost)],
              ['Tax (GST)', formatPrice(order.pricing?.tax)],
              ...(order.pricing?.discount > 0 ? [['Discount', `-${formatPrice(order.pricing?.discount)}`]] : []),
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>{label}</span>
                <span style={{ color: label === 'Discount' ? 'var(--status-success)' : 'inherit', fontWeight: label === 'Discount' ? 600 : 400 }}>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 14, marginTop: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 17 }}>Total</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 20, color: 'var(--accent-gold)' }}>{formatPrice(order.pricing?.total)}</span>
            </div>
            <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Payment Method</p>
              <p style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 14 }}>{order.payment?.method}</p>
              <p style={{ fontSize: 12, color: order.payment?.status === 'paid' ? 'var(--status-success)' : 'var(--status-warning)', marginTop: 4, fontWeight: 500 }}>
                {order.payment?.status?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
