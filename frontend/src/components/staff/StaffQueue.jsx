import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveOrders, getAllOrders, confirmOrder, updateOrderStatus } from '../../services/orderService';

const StaffQueue = ({ readOnly = false }) => {
  const { userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchOrders = async () => {
    setLoading(true);
    const result = readOnly ? await getAllOrders() : await getActiveOrders();
    if (result.success) {
      setOrders(result.orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [readOnly]);

  const handleConfirm = async (orderId) => {
    setActionLoading(orderId);
    const result = await confirmOrder(orderId);
    if (result.success) fetchOrders();
    setActionLoading(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) fetchOrders();
    setActionLoading(null);
  };

  const getStatusBadge = (status) => {
    const map = {
      'pending': '🟡 Pending',
      'confirmed': '🟣 Confirmed',
      'in-progress': '🔵 In Progress',
      'ready-for-pickup': '🟢 Ready',
      'completed': '✅ Completed'
    };
    return map[status] || status;
  };

  // Filter & Sort logic
  const filteredOrders = orders
    .filter(o => {
      // Search by customer name or order ID
      const matchesSearch = !searchTerm ||
        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.orderDate) - new Date(a.orderDate);
        case 'oldest':
          return new Date(a.orderDate) - new Date(b.orderDate);
        case 'name-asc':
          return (a.customerName || '').localeCompare(b.customerName || '');
        case 'name-desc':
          return (b.customerName || '').localeCompare(a.customerName || '');
        default:
          return new Date(b.orderDate) - new Date(a.orderDate);
      }
    });

  if (loading) return <div className="card"><p>Loading orders...</p></div>;

  return (
    <div className="card">
      <div style={{ marginBottom: '20px' }}>
        <h3 className="bebas" style={{ fontSize: '22px' }}>
          {readOnly ? 'All System Orders' : 'Active Order Queue'}
        </h3>
        {!readOnly && (
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            Processed by: <strong>{userData?.fullName}</strong>
          </p>
        )}
      </div>

      {/* Search & Filters Bar */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '20px',
        flexWrap: 'wrap', alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', fontSize: '14px'
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search customer name or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '13px',
              background: 'white'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '16px', color: 'var(--muted)'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            fontSize: '13px',
            background: 'white',
            cursor: 'pointer',
            minWidth: '140px'
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in-progress">In Progress</option>
          <option value="ready-for-pickup">Ready for Pickup</option>
          <option value="completed">Completed</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            fontSize: '13px',
            background: 'white',
            cursor: 'pointer',
            minWidth: '140px'
          }}
        >
          <option value="newest">Date: Newest First</option>
          <option value="oldest">Date: Oldest First</option>
          <option value="name-asc">Name: A → Z</option>
          <option value="name-desc">Name: Z → A</option>
        </select>
      </div>

      {/* Results count */}
      <div style={{
        marginBottom: '12px', fontSize: '12px', color: 'var(--muted)'
      }}>
        Showing {filteredOrders.length} of {orders.length} orders
        {(searchTerm || statusFilter !== 'all') && ' (filtered)'}
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
          <p style={{ fontSize: '40px' }}>📋</p>
          <p>
            {searchTerm || statusFilter !== 'all'
              ? 'No orders match your filters'
              : readOnly ? 'No orders yet' : 'No active orders in queue'}
          </p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Order ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Jersey</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Qty</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              {readOnly ? (
                <>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Processed By</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                </>
              ) : (
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px', fontFamily: 'Bebas Neue', color: 'var(--navy)', fontSize: '14px' }}>
                  {o.orderNumber || `#${o.orderId?.slice(-6)}`}
                </td>
                <td style={{ padding: '10px' }}>
                  <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{o.customerContact}</div>
                </td>
                <td style={{ padding: '10px' }}>
                  {o.jerseyType === 'full-set' ? 'Full Set' : 'Top Only'}
                </td>
                <td style={{ padding: '10px', fontWeight: 600 }}>{o.quantity}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 700,
                    background: o.orderType === 'online' ? 'var(--accent2)' : 'var(--amber-bg)',
                    color: o.orderType === 'online' ? 'var(--navy)' : 'var(--amber)'
                  }}>
                    {o.orderType}
                  </span>
                </td>
                <td style={{ padding: '10px', fontSize: '12px' }}>{getStatusBadge(o.status)}</td>

                {readOnly ? (
                  <>
                    <td style={{ padding: '10px', fontSize: '12px', color: 'var(--muted)' }}>
                      {o.processedByName || '—'}
                    </td>
                    <td style={{ padding: '10px', fontSize: '12px', color: 'var(--muted)' }}>
                      {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : ''}
                    </td>
                  </>
                ) : (
                  <td style={{ padding: '10px' }}>
                    {o.status === 'pending' && (
                      <button className="btn-navy" style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleConfirm(o.id)} disabled={actionLoading === o.id}>
                        {actionLoading === o.id ? '...' : 'Confirm'}
                      </button>
                    )}
                    {o.status === 'confirmed' && (
                      <button className="btn-navy" style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleUpdateStatus(o.id, 'in-progress')} disabled={actionLoading === o.id}>
                        Start Production
                      </button>
                    )}
                    {o.status === 'in-progress' && (
                      <button className="btn-navy" style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleUpdateStatus(o.id, 'ready-for-pickup')} disabled={actionLoading === o.id}>
                        Mark Ready
                      </button>
                    )}
                    {o.status === 'ready-for-pickup' && (
                      <button className="btn-navy" style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleUpdateStatus(o.id, 'completed')} disabled={actionLoading === o.id}>
                        Complete
                      </button>
                    )}
                    {o.status === 'completed' && (
                      <span style={{ color: 'var(--green)', fontSize: '12px' }}>✅ Done</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffQueue;