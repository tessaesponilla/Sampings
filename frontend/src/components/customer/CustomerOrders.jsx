import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerOrders } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';
import '../../styles/responsive.css';

const CustomerOrders = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      setLoading(true);
      const result = await getCustomerOrders(currentUser.uid);
      if (result.success) setOrders(result.orders);
      setLoading(false);
    };
    fetchOrders();
  }, [currentUser]);

  const getStatusBadge = (status) => {
    const map = {
      'pending': { bg: '#fff7ed', color: '#ea580c', label: 'Pending' },
      'confirmed': { bg: '#f5f3ff', color: '#7c3aed', label: 'Confirmed' },
      'in-progress': { bg: '#eff6ff', color: '#3b82f6', label: 'In Progress' },
      'ready-for-pickup': { bg: '#dbeafe', color: '#2563eb', label: 'Ready' },
      'completed': { bg: '#f0fdf4', color: '#16a34a', label: 'Completed' },
    };
    const s = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
    return <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{s.label}</span>;
  };

  const refreshOrders = async () => {
    setLoading(true);
    const result = await getCustomerOrders(currentUser.uid);
    if (result.success) setOrders(result.orders);
    setLoading(false);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchTerm || 
      o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  if (loading) return <div className="card"><p>Loading orders...</p></div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 0 60%' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
          <input type="text" placeholder="Search by Order ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'white' }} />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--muted)' }}>✕</button>
          )}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ flex: '0 0 25%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'white', color: 'var(--text)', cursor: 'pointer' }}>
          <option value="all">📋 All Status</option>
          <option value="pending">🟠 Pending</option>
          <option value="confirmed">🟣 Confirmed</option>
          <option value="in-progress">🔵 In Progress</option>
          <option value="ready-for-pickup">🔷 Ready</option>
          <option value="completed">🟢 Completed</option>
        </select>
        <button onClick={refreshOrders} disabled={loading}
          style={{ flex: '0 0 auto', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1, fontSize: '14px', fontWeight: 500 }}>
          ↻ {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
          <p style={{ fontSize: '40px', marginBottom: '10px' }}>📦</p>
          <p>No orders found.</p>
          <button className="btn-yellow" style={{ marginTop: '15px' }} onClick={() => navigate('/customer/new-order')}>Place Your First Order</button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--muted)' }}>Showing {paginatedOrders.length} of {filteredOrders.length} orders</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Jersey</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Qty</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(o => (
                <tr key={o.id} onClick={() => navigate(`/customer/orders/${o.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  title="Click to view order details">
                  <td style={{ padding: '12px', fontFamily: 'Bebas Neue', color: 'var(--navy)', fontSize: '15px' }}>{o.orderNumber || `#${o.orderId?.slice(-6)}`}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{o.jerseyType === 'full-set' ? 'Full Set' : 'Top Only'}</td>
                  <td style={{ padding: '12px' }}>{o.quantity}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>₱{o.totalAmount?.toLocaleString()}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: 'var(--muted)' }}>{o.orderDate?.toLocaleDateString?.() || new Date(o.orderDate).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{getStatusBadge(o.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>

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
  );
};

export default CustomerOrders;