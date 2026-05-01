import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerOrders, getCustomerStats } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const { userData, currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      setLoading(true);

      // Fetch stats
      const statsResult = await getCustomerStats(currentUser.uid);
      if (statsResult.success) {
        setStats(statsResult.stats);
      }

      // Fetch orders
      const ordersResult = await getCustomerOrders(currentUser.uid);
      if (ordersResult.success) {
        setOrders(ordersResult.orders);
      }

      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { class: 'badge-amber', label: 'Pending' },
      'confirmed': { class: 'badge-purple', label: 'Confirmed' },
      'in-progress': { class: 'badge-purple', label: 'In Progress' },
      'ready-for-pickup': { class: 'badge-green', label: 'Ready for Pickup' },
      'completed': { class: 'badge-green', label: 'Completed' },
    };
    const s = statusMap[status] || { class: 'badge-amber', label: status };
    return <span className={`badge ${s.class}`}>{s.label}</span>;
  };

  const getOrderTypeBadge = (type) => {
    return type === 'online' 
      ? <span style={{ fontSize: '10px', background: 'var(--accent2)', color: 'var(--navy)', padding: '2px 8px', borderRadius: '10px' }}>Online</span>
      : <span style={{ fontSize: '10px', background: 'var(--amber-bg)', color: 'var(--amber)', padding: '2px 8px', borderRadius: '10px' }}>Walk-in</span>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
        Loading your orders...
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Message */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Welcome back, <strong style={{ color: 'var(--text)' }}>{userData?.fullName}</strong>!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Total Orders</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--amber)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Pending</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{stats.pending}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--purple)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>In Progress</div>
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{stats.inProgress}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--green)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Completed</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.completed}</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="bebas" style={{ fontSize: '22px', margin: 0 }}>My Orders</h3>
          <button 
            className="btn-yellow" 
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate('/customer/new-order')}
          >
            + New Order
          </button>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <p style={{ fontSize: '40px', marginBottom: '10px' }}>📦</p>
            <p>No orders yet. Place your first order!</p>
            <button 
              className="btn-yellow" 
              style={{ marginTop: '15px' }}
              onClick={() => navigate('/customer/new-order')}
            >
              Create New Order
            </button>
          </div>
        ) : (
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Jersey Type</th>
                <th>Qty</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="bebas" style={{ color: 'var(--navy)', fontSize: '14px' }}>
                     {o.orderNumber || `#${o.orderId?.slice(-6)}`}
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    {o.jerseyType === 'full-set' ? 'Full Jersey Set' : 'Top Only'}
                  </td>
                  <td>{o.quantity} pcs</td>
                  <td style={{ color: 'var(--muted)', fontSize: '12px' }}>
                    {o.orderDate?.toLocaleDateString?.() || new Date(o.orderDate).toLocaleDateString()}
                  </td>
                  <td>{getOrderTypeBadge(o.orderType)}</td>
                  <td>{getStatusBadge(o.status)}</td>
                  <td>
                    <button 
                      className="btn-navy" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => navigate(`/customer/orders/${o.id}`)}
                    >
                      Track Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;