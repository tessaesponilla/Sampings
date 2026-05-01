import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveOrders, confirmOrder, updateOrderStatus } from '../../services/orderService';

const StaffQueue = () => {
  const { userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await getActiveOrders();
    if (result.success) {
      setOrders(result.orders);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  if (loading) return <div className="card"><p>Loading orders...</p></div>;

  return (
    <div className="card">
      <div style={{ marginBottom: '20px' }}>
        <h3 className="bebas" style={{ fontSize: '22px' }}>Active Order Queue</h3>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
          Processed by: <strong>{userData?.fullName}</strong>
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
          <p style={{ fontSize: '40px' }}>📋</p>
          <p>No active orders in queue</p>
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
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px', fontFamily: 'Bebas Neue', color: 'var(--navy)' }}>
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
                <td style={{ padding: '10px' }}>
                  {o.status === 'pending' && (
                    <button
                      className="btn-navy"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleConfirm(o.id)}
                      disabled={actionLoading === o.id}
                    >
                      {actionLoading === o.id ? '...' : 'Confirm'}
                    </button>
                  )}
                  {o.status === 'confirmed' && (
                    <button
                      className="btn-navy"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleUpdateStatus(o.id, 'in-progress')}
                      disabled={actionLoading === o.id}
                    >
                      Start Production
                    </button>
                  )}
                  {o.status === 'in-progress' && (
                    <button
                      className="btn-navy"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleUpdateStatus(o.id, 'ready-for-pickup')}
                      disabled={actionLoading === o.id}
                    >
                      Mark Ready
                    </button>
                  )}
                  {o.status === 'ready-for-pickup' && (
                    <button
                      className="btn-navy"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleUpdateStatus(o.id, 'completed')}
                      disabled={actionLoading === o.id}
                    >
                      Complete
                    </button>
                  )}
                  {o.status === 'completed' && (
                    <span style={{ color: 'var(--green)', fontSize: '12px' }}>✅ Done</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffQueue;