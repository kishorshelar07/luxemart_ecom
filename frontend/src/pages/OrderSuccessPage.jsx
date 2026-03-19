import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { orderService } from '../services/api';
import { formatPrice, formatDate } from '../utils/helpers';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) orderService.getOne(orderId).then(r => setOrder(r.data.order)).catch(() => {});
  }, [orderId]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ width: 80, height: 80, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '2px solid rgba(34,197,94,0.3)' }}
        >
          <CheckCircle size={40} color="var(--status-success)" />
        </motion.div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 12 }}>Order Placed! 🎉</h1>
        {order && <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Order ID: <strong style={{ color: 'var(--accent-gold)' }}>{order.orderId}</strong></p>}
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Thank you for shopping with LuxeMart. You'll receive a confirmation email shortly.</p>

        {order && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 32, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Total Amount</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 18, color: 'var(--accent-gold)' }}>{formatPrice(order.pricing?.total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Payment Method</span>
              <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase' }}>{order.payment?.method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Estimated Delivery</span>
              <span style={{ fontSize: 14, color: 'var(--status-success)', fontWeight: 500 }}>3–7 Business Days</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard/orders" className="btn btn-primary">
            <Package size={18} /> Track Order
          </Link>
          <Link to="/products" className="btn btn-outline">
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
