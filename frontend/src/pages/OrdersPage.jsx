import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { orderService } from '../services/api';
import { formatPrice, formatDate, formatOrderStatus, getOrderStatusColor } from '../utils/helpers';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') || 'all';

  useEffect(() => {
    const params = {};
    if (activeStatus !== 'all') params.status = activeStatus;
    orderService.getMyOrders(params).then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, [activeStatus]);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 32 }}>My Orders</h1>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setSearchParams(s === 'all' ? {} : { status: s })}
              className={`btn btn-sm ${activeStatus === s ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array(5).fill(null).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Package size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: 16, marginBottom: 20 }}>No orders found</p>
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => (
              <Link key={order._id} to={`/dashboard/orders/${order._id}`} className="card" style={{ padding: '20px 24px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 16 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: 4 }}>{order.orderId}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(order.createdAt)} · {order.items?.length} items</p>
                </div>
                <span className="badge" style={{ background: `${getOrderStatusColor(order.orderStatus)}22`, color: getOrderStatusColor(order.orderStatus), border: `1px solid ${getOrderStatusColor(order.orderStatus)}44` }}>
                  {formatOrderStatus(order.orderStatus)}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 17 }}>{formatPrice(order.pricing?.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
