import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, MapPin, User } from 'lucide-react';
import { orderService } from '../services/api';
import { formatPrice, formatDate, formatOrderStatus, getOrderStatusColor } from '../utils/helpers';
import { useSelector } from 'react-redux';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(s => s.auth);
  const { items: wishlist } = useSelector(s => s.wishlist);

  useEffect(() => {
    orderService.getMyOrders({ limit: 5 }).then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, link: '/dashboard/orders' },
    { label: 'Wishlist Items', value: wishlist?.length || 0, icon: Heart, link: '/dashboard/wishlist' },
    { label: 'Saved Addresses', value: user?.addresses?.length || 0, icon: MapPin, link: '/dashboard/profile' },
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 8 }}>
            My Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, <strong style={{ color: 'var(--accent-gold)' }}>{user?.name}</strong></p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 48 }}>
          {stats.map(s => (
            <Link key={s.label} to={s.link} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
              <div style={{ width: 48, height: 48, background: 'var(--accent-gold-glow)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                <s.icon size={22} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 28, fontWeight: 700 }}>{s.value}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 20 }}>Recent Orders</h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array(3).fill(null).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Package size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: 16, marginBottom: 20 }}>No orders yet</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => (
              <Link key={order._id} to={`/dashboard/orders/${order._id}`} className="card" style={{ padding: '20px 24px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: 4 }}>{order.orderId}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(order.createdAt)} · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                </div>
                <span className="badge" style={{ background: `${getOrderStatusColor(order.orderStatus)}22`, color: getOrderStatusColor(order.orderStatus), border: `1px solid ${getOrderStatusColor(order.orderStatus)}44` }}>
                  {formatOrderStatus(order.orderStatus)}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 17 }}>{formatPrice(order.pricing?.total)}</span>
              </Link>
            ))}
            <Link to="/dashboard/orders" className="btn btn-outline" style={{ alignSelf: 'flex-start', marginTop: 8 }}>View All Orders</Link>
          </div>
        )}
      </div>
    </div>
  );
}
