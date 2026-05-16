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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
      const statsResult = await getCustomerStats(currentUser.uid);
      if (statsResult.success) setStats(statsResult.stats);
      const ordersResult = await getCustomerOrders(currentUser.uid);
      if (ordersResult.success) setOrders(ordersResult.orders);
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  const getStatusBadge = (status) => {
    const map = {
      'pending': { bg: 'var(--amber-bg)', color: 'var(--amber)', label: 'Pending' },
      'confirmed': { bg: '#ede9fe', color: '#7c3aed', label: 'Confirmed' },
      'in-progress': { bg: '#dbeafe', color: '#2563eb', label: 'In Progress' },
      'ready-for-pickup': { bg: '#d1fae5', color: '#059669', label: 'Ready' },
      'completed': { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Completed' },
    };
    const s = map[status] || { bg: 'var(--off)', color: 'var(--muted)', label: status };
    return <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{s.label}</span>;
  };

  
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>Loading your orders...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Welcome back, <strong style={{ color: 'var(--text)' }}>{userData?.fullName}</strong>!</p>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '2rem' }}>
        <div className="stat-card"><div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Total Orders</div><div className="stat-value">{stats.totalOrders}</div></div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--amber)' }}><div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Pending</div><div className="stat-value" style={{ color: 'var(--amber)' }}>{stats.pending}</div></div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--purple)' }}><div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>In Progress</div><div className="stat-value" style={{ color: 'var(--purple)' }}>{stats.inProgress}</div></div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--green)' }}><div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Completed</div><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.completed}</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="bebas" style={{ fontSize: '22px', margin: 0 }}>My Orders</h3>
          <button className="btn-yellow" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate('/customer/new-order')}>+ New Order</button>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <p style={{ fontSize: '40px', marginBottom: '10px' }}>📦</p>
            <p>No orders yet.</p>
            <button className="btn-yellow" style={{ marginTop: '15px' }} onClick={() => navigate('/customer/new-order')}>Place Your First Order</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--muted)' }}>
              Showing {paginatedOrders.length} of {orders.length} orders
            </div>
            <table className="order-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--border)' }}><th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Order ID</th><th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Jersey</th><th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Qty</th><th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date</th><th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Status</th><th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}></th></tr></thead>
              <tbody>
                {paginatedOrders.map(o => (
                  <tr key={o.id} onClick={() => navigate(`/customer/orders/${o.id}`)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px', fontFamily: 'Bebas Neue', color: 'var(--navy)', fontSize: '14px' }}>{o.orderNumber || `#${o.orderId?.slice(-6)}`}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{o.jerseyType === 'full-set' ? 'Full Set' : 'Top Only'}</td>
                    <td style={{ padding: '12px' }}>{o.quantity}</td>
                    <td style={{ padding: '12px', color: 'var(--muted)', fontSize: '12px' }}>{o.orderDate?.toLocaleDateString?.() || new Date(o.orderDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>{getStatusBadge(o.status)}</td>
                    <td style={{ padding: '12px' }}><button className="btn-navy" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={(e) => { e.stopPropagation(); navigate(`/customer/orders/${o.id}`); }}>Track</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, fontWeight: 600, fontSize: '13px' }}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: currentPage === i + 1 ? '2px solid var(--navy)' : '1px solid var(--border)', background: currentPage === i + 1 ? 'var(--navy)' : 'white', color: currentPage === i + 1 ? 'white' : 'var(--text)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>{i + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, fontWeight: 600, fontSize: '13px' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;