import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails } from '../../services/orderService';
import { Html5Qrcode } from 'html5-qrcode';

const LiveTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchOrderId, setSearchOrderId] = useState(orderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const searchOrder = async (id) => {
    const searchTerm = id || searchOrderId;
    if (!searchTerm?.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    // Try direct document ID if not starting with ORD-
    if (!searchTerm.startsWith('ORD-')) {
      const result = await getOrderDetails(searchTerm);
      if (result?.success) {
        setOrder(result.order);
        setLoading(false);
        return;
      }
    }

    // Search by orderNumber
    try {
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
    } catch (err) {
      setError('An error occurred while searching.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (orderId) {
      setSearchOrderId(orderId);
      searchOrder(orderId);
    }
  }, [orderId]);

  // Camera Scanner
  const startScanner = async () => {
    setShowScanner(true);
    setError('');
    try {
      // Small delay to ensure DOM element is rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Stop scanner after successful scan
          await html5QrCode.stop();
          setShowScanner(false);
          let extractedId = decodedText;
          if (decodedText.includes('/track/')) {
            extractedId = decodedText.split('/track/').pop();
          }
          setSearchOrderId(extractedId);
          searchOrder(extractedId);
        },
        () => {} // ignore scan errors
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setShowScanner(false);
      setError('Could not start camera. Please ensure camera permissions are granted and you are on HTTPS/localhost.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {}
      scannerRef.current = null;
    }
    setShowScanner(false);
  };

  // Upload QR Image
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const html5QrCode = new Html5Qrcode("qr-reader-file");
      const decodedText = await html5QrCode.scanFile(file, true);
      let extractedId = decodedText;
      if (decodedText.includes('/track/')) {
        extractedId = decodedText.split('/track/').pop();
      }
      setSearchOrderId(extractedId);
      await searchOrder(extractedId);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Could not read QR code from image. Please try a clearer image or use the camera.');
    }
    setLoading(false);
  };

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

  const getStatusColor = (status) => {
    const map = {
      'pending': '#f59e0b', 'confirmed': '#7c3aed',
      'in-progress': '#2563eb', 'ready-for-pickup': '#f97316', 'completed': '#22c55e'
    };
    return map[status] || '#f59e0b';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a1432 0%, #0f193c 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          style={{
            marginBottom: '20px', padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 600, fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content'
          }}
        >
          ↩
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="bebas" style={{ fontSize: '36px', color: 'white', letterSpacing: '0.05em' }}>SAMPINGS</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Track your order in real-time</p>
        </div>

        {/* Search & Scan */}
        <div style={{ marginBottom: '2rem' }}>
          <form onSubmit={(e) => { e.preventDefault(); searchOrder(); }} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={searchOrderId} onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="Enter Order Number (e.g. ORD-0001)"
                style={{ flex: 1, padding: '14px 18px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '16px' }} />
              <button type="submit" disabled={loading}
                style={{ padding: '14px 24px', borderRadius: '12px', border: 'none', background: 'var(--yellow)',
                  color: '#0a1432', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
                {loading ? '...' : 'Track'}
              </button>
            </div>
          </form>

          {!showScanner ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={startScanner}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px dashed rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', fontWeight: 600,
                  fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                📷 Scan QR Code
              </button>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} id="qr-file-input" />
              <button onClick={() => document.getElementById('qr-file-input').click()}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px dashed rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', fontWeight: 600,
                  fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                🖼️ Upload QR Image
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '12px' }}>
              <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden' }}></div>
              <button onClick={stopScanner}
                style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '10px', border: 'none',
                  background: 'rgba(255,71,87,0.2)', color: '#ff4757', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                Cancel Scan
              </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: '16px', background: 'rgba(255,71,87,0.2)', borderRadius: '12px',
            color: '#ff4757', textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {order && (
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem',
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Order Number</div>
                  <div className="bebas" style={{ color: 'white', fontSize: '24px' }}>
                    {order.orderNumber || `#${order.orderId?.slice(-6)}`}
                  </div>
                </div>
                <div style={{ background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status),
                  padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, textTransform: 'capitalize' }}>
                  {order.status?.replace(/-/g, ' ')}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '4px',
                  background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', top: '15px', left: '0',
                  width: `${(getStatusStep(order.status) / 4) * 100}%`, height: '4px',
                  background: 'var(--yellow)', borderRadius: '2px', transition: 'width 0.5s ease' }}></div>
                {statusLabels.map((step, idx) => (
                  <div key={idx} style={{ textAlign: 'center', zIndex: 1, width: '60px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%',
                      background: idx <= getStatusStep(order.status) ? 'var(--yellow)' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '16px' }}>
                      {idx <= getStatusStep(order.status) ? step.icon : '○'}
                    </div>
                    <div style={{ fontSize: '9px', color: idx <= getStatusStep(order.status) ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{step.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Customer</div><div style={{ color: 'white', fontWeight: 600 }}>{order.customerName}</div></div>
                <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Jersey Type</div><div style={{ color: 'white', fontWeight: 600 }}>{order.jerseyType === 'full-set' ? 'Full Set' : 'Top Only'}</div></div>
                <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Quantity</div><div style={{ color: 'white', fontWeight: 600 }}>{order.quantity} items</div></div>
                <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Total</div><div style={{ color: 'white', fontWeight: 600 }}>₱{order.totalAmount?.toLocaleString()}</div></div>
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