import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerOrders, getOrderDetails } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';

const CustomerOrders = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        console.log('DEBUG: No currentUser');
        return;
      }
      console.log('DEBUG: currentUser.uid =', currentUser.uid);
      setLoading(true);
      const result = await getCustomerOrders(currentUser.uid);
      console.log('DEBUG: getCustomerOrders result =', result);
      if (result.success) {
        console.log('DEBUG: Orders count =', result.orders.length);
        setOrders(result.orders);
      } else {
        console.error('DEBUG: Error =', result.error);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [currentUser]);

  const viewOrderDetails = async (orderId) => {
    setDetailLoading(true);
    const result = await getOrderDetails(orderId);
    if (result.success) {
      setSelectedOrder(result.order);
    }
    setDetailLoading(false);
  };

  const getStatusBadge = (status) => {
    const map = {
      'pending': { bg: 'var(--amber-bg)', color: 'var(--amber)', label: 'Pending' },
      'confirmed': { bg: '#ede9fe', color: '#7c3aed', label: 'Confirmed' },
      'in-progress': { bg: '#dbeafe', color: '#2563eb', label: 'In Progress' },
      'ready-for-pickup': { bg: '#d1fae5', color: '#059669', label: 'Ready for Pickup' },
      'completed': { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Completed' },
    };
    const s = map[status] || { bg: 'var(--off)', color: 'var(--muted)', label: status };
    return (
      <span style={{
        background: s.bg,
        color: s.color,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 700
      }}>
        {s.label}
      </span>
    );
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchTerm || 
      o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="card"><p>Loading orders...</p></div>;
  }

  return (
    <div>
      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div className="card" style={{ 
            maxWidth: '700px', width: '100%', maxHeight: '80vh', 
            overflow: 'auto', background: 'white' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="bebas" style={{ fontSize: '22px', margin: 0 }}>
                Order #{selectedOrder.orderId?.slice(-6)}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p><strong>{selectedOrder.jerseyType === 'full-set' ? 'Full Jersey Set' : 'Top Only'}</strong></p>
              <p>{selectedOrder.quantity} items · ₱{selectedOrder.totalAmount?.toLocaleString()}</p>
              <p>{getStatusBadge(selectedOrder.status)}</p>
              {selectedOrder.designReferenceURL && (
                <img 
                  src={selectedOrder.designReferenceURL} 
                  alt="Design" 
                  style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '10px' }} 
                />
              )}
            </div>

            {/* Items Table */}
            <h4 style={{ marginBottom: '10px' }}>Items</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>#</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>Size</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>Number</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>Surname</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>{idx + 1}</td>
                    <td style={{ padding: '8px' }}>{item.size}</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{item.number}</td>
                    <td style={{ padding: '8px' }}>{item.surname}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Status History */}
            <h4 style={{ marginBottom: '10px' }}>Status History</h4>
            <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '20px' }}>
              {selectedOrder.statusHistory?.map((h, idx) => (
                <div key={h.id} style={{ marginBottom: '12px', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: '-26px', top: '4px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: idx === selectedOrder.statusHistory.length - 1 ? 'var(--navy)' : 'var(--border)'
                  }}></div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    {h.status?.replace(/-/g, ' ')} 
                    <span style={{ textTransform: 'capitalize' }}></span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {h.timestamp?.toLocaleString?.() || new Date(h.timestamp).toLocaleString()}
                  </div>
                  {h.notes && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{h.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="bebas" style={{ fontSize: '22px', margin: 0 }}>Order History</h3>
          <button 
            className="btn-yellow" 
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate('/customer/new-order')}
          >
            + New Order
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="ready-for-pickup">Ready for Pickup</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <p style={{ fontSize: '40px', marginBottom: '10px' }}>📦</p>
            <p>No orders found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Jersey</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Qty</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontFamily: 'Bebas Neue', color: 'var(--navy)' }}>
                    {o.orderNumber || `#${o.orderId?.slice(-6)}`}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>
                    {o.jerseyType === 'full-set' ? 'Full Set' : 'Top Only'}
                  </td>
                  <td style={{ padding: '12px' }}>{o.quantity}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>₱{o.totalAmount?.toLocaleString()}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: 'var(--muted)' }}>
                    {o.orderDate?.toLocaleDateString?.() || new Date(o.orderDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>{getStatusBadge(o.status)}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      className="btn-navy"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => viewOrderDetails(o.id)}
                    >
                      View Details
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

export default CustomerOrders;