import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, Users, Package, ShoppingBag, TrendingUp, ArrowUp, ArrowDown, DollarSign, Eye, Edit2, Trash2, Plus } from 'lucide-react';
import { adminService } from '../../services/api';
import { formatPrice, formatDate, formatOrderStatus, getOrderStatusColor } from '../../utils/helpers';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './AdminDashboard.module.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAnalytics()
      .then(r => setAnalytics(r.data.analytics))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminSkeleton />;
  if (!analytics) return null;

  const { overview, monthlyRevenue, topProducts, categorySales, recentOrders, orderStatusDist } = analytics;

  const chartData = monthlyRevenue.map(m => ({
    month: MONTHS[(m._id.month - 1) % 12],
    revenue: m.revenue,
    orders: m.orders
  }));

  const statusColors = { pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6', shipped: '#06b6d4', delivered: '#22c55e', cancelled: '#ef4444' };
  const pieData = orderStatusDist.map(s => ({ name: s._id, value: s.count, color: statusColors[s._id] || '#6b7280' }));

  const STAT_CARDS = [
    { label: 'Total Revenue', value: formatPrice(overview.totalRevenue), icon: DollarSign, trend: `${overview.revenueGrowth > 0 ? '+' : ''}${overview.revenueGrowth}% this month`, positive: overview.revenueGrowth >= 0 },
    { label: 'Monthly Revenue', value: formatPrice(overview.monthRevenue), icon: TrendingUp, trend: `${overview.monthOrders} orders this month`, positive: true },
    { label: 'Total Orders', value: overview.totalOrders.toLocaleString(), icon: ShoppingBag, trend: `${overview.pendingOrders} pending`, positive: overview.pendingOrders < 50 },
    { label: 'Total Users', value: overview.totalUsers.toLocaleString(), icon: Users, trend: `+${overview.newUsersMonth} this month`, positive: true },
    { label: 'Total Products', value: overview.totalProducts.toLocaleString(), icon: Package, trend: `${overview.lowStockProducts} low stock`, positive: overview.lowStockProducts < 5 },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Welcome back — here's what's happening today.</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/products" className="btn btn-primary btn-sm"><Plus size={16} /> Add Product</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={styles.statTop}>
              <div className={styles.statIcon}>
                <stat.icon size={20} />
              </div>
              <span className={`${styles.statTrend} ${stat.positive ? styles.trendUp : styles.trendDown}`}>
                {stat.positive ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                {stat.trend}
              </span>
            </div>
            <p className={styles.statValue}>{stat.value}</p>
            <p className={styles.statLabel}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        {/* Revenue Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Revenue & Orders (12 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 8, color: 'var(--text-primary)' }}
                formatter={(v, name) => [name === 'revenue' ? formatPrice(v) : v, name === 'revenue' ? 'Revenue' : 'Orders']}
              />
              <Line type="monotone" dataKey="revenue" stroke="var(--accent-gold)" strokeWidth={2} dot={{ fill: 'var(--accent-gold)', r: 4 }} />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.pieLegend}>
            {pieData.map(item => (
              <div key={item.name} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: item.color }} />
                <span>{item.name}</span>
                <span className={styles.legendCount}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomGrid}>
        {/* Top Products */}
        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.chartTitle}>Top Selling Products</h3>
            <Link to="/admin/products" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className={styles.productCell}>
                      {p.image && <img src={p.image} alt={p.name} className={styles.productThumb} />}
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-info">{p.totalSold}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--accent-gold)' }}>{formatPrice(p.revenue)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.chartTitle}>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Status</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td><span style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>{order.orderId}</span></td>
                  <td>{order.user?.name}</td>
                  <td>
                    <span className="badge" style={{ background: `${getOrderStatusColor(order.orderStatus)}22`, color: getOrderStatusColor(order.orderStatus), border: `1px solid ${getOrderStatusColor(order.orderStatus)}44`, fontSize: 11 }}>
                      {formatOrderStatus(order.orderStatus)}
                    </span>
                  </td>
                  <td><span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600 }}>{formatPrice(order.pricing?.total)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className={styles.quickLinks}>
        {[
          { label: 'Manage Products', link: '/admin/products', icon: Package },
          { label: 'Manage Orders', link: '/admin/orders', icon: ShoppingBag },
          { label: 'Manage Users', link: '/admin/users', icon: Users },
        ].map(({ label, link, icon: Icon }) => (
          <Link key={link} to={link} className={styles.quickLink}>
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.statsGrid}>
        {Array(5).fill(null).map((_, i) => <div key={i} className={`skeleton ${styles.statCard}`} style={{ height: 120 }} />)}
      </div>
    </div>
  );
}
