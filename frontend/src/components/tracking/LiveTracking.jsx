import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderDetails } from '../../services/orderService';

const LiveTracking = () => {
  const { orderId } = useParams(); // For direct URL /track/ORD-0001
  const [searchOrderId, setSearchOrderId] = useState(orderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchOrder = async (e) => {
      e?.preventDefault();
      if (!searchOrderId.trim()) return;

      setLoading(true);
      setError('');
      setOrder(null);

      const searchTerm = searchOrderId.trim();

      // If it looks like a Firestore ID (long, no ORD- prefix), try direct lookup
      if (!searchTerm.startsWith('ORD-')) {
        const result = await getOrderDetails(searchTerm);
        if (result?.success) {
          setOrder(result.order);
          setLoading(false);
          return;
        }
      }

      // Try by orderNumber
      const { db } = await import('../../config/firebase');
      const { collection, query, where, getDocs } = await import('firebase/firestore');

      const q = query(collection(db, 'orders'), where('orderNumber', '==', searchTerm));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const orderDoc = snapshot.docs[0];
        const result = await getOrderDetails(orderDoc.id);
        if (result?.success) {
          setOrder(result.order);
        } else {
          setError('Error loading order details.');
        }
      } else {
        setError('Order not found. Please check the order number.');
      }

      setLoading(false);
    };

  // Auto-search if orderId from URL
  React.useEffect(() => {
    if (orderId) {
      setSearchOrderId(orderId);
      searchOrder();
    }
  }, [orderId]);

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'in-progress', 'ready-for-pickup', 'completed'];
    return steps.indexOf(status);
  };

  const statusLabels = [
    { label: 'Order Placed', icon: '📝' },
    { label: 'Confirmed', icon: '✅' },
    { label: 'In Production', icon: '🏭' },
    { label: 'Ready for Pickup', icon: '📦' },
    { label: 'Completed', icon: '🎉' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--navy-ultra) 0%, var(--navy) 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="bebas" style={{ fontSize: '36px', color: 'white', letterSpacing: '0.05em' }}>
            SAMPINGS
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Track your order in real-time
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={searchOrder} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              placeholder="Enter Order Number (e.g. ORD-0001)"
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '12px',
                border: '2px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--yellow)',
                color: 'var(--navy-ultra)',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {loading ? '...' : 'Track'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            padding: '16px',
            background: 'rgba(255,71,87,0.2)',
            borderRadius: '12px',
            color: '#ff4757',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Order Number</div>
                  <div className="bebas" style={{ color: 'white', fontSize: '24px' }}>
                    {order.orderNumber || `#${order.orderId?.slice(-6)}`}
                  </div>
                </div>
                <div style={{ 
                  background: order.status === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(250,204,21,0.2)',
                  color: order.status === 'completed' ? '#22c55e' : '#facc15',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'capitalize'
                }}>
                  {order.status?.replace(/-/g, ' ')}
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Progress bar background */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '0',
                  right: '0',
                  height: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px'
                }}></div>
                {/* Progress bar fill */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '0',
                  width: `${(getStatusStep(order.status) / 4) * 100}%`,
                  height: '4px',
                  background: 'var(--yellow)',
                  borderRadius: '2px',
                  transition: 'width 0.5s ease'
                }}></div>

                {statusLabels.map((step, idx) => (
                  <div key={idx} style={{ 
                    textAlign: 'center', 
                    zIndex: 1,
                    width: '60px'
                  }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: idx <= getStatusStep(order.status) ? 'var(--yellow)' : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 6px',
                      fontSize: '16px'
                    }}>
                      {idx <= getStatusStep(order.status) ? step.icon : '○'}
                    </div>
                    <div style={{
                      fontSize: '9px',
                      color: idx <= getStatusStep(order.status) ? 'white' : 'rgba(255,255,255,0.3)',
                      fontWeight: 600
                    }}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Info */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Customer</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{order.customerName}</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Jersey Type</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>
                    {order.jerseyType === 'full-set' ? 'Full Set' : 'Top Only'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Quantity</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{order.quantity} items</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Total</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>₱{order.totalAmount?.toLocaleString()}</div>
                </div>
              </div>
              {order.processedByName && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Processed By</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{order.processedByName}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTracking;