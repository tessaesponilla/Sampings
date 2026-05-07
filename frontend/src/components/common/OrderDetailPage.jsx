import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails } from '../../services/orderService';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
        setLoading(true);
        const result = await getOrderDetails(orderId);
        if (result.success) {
            setOrder(result.order);
        } else {
            setError('Order not found.');
        }
        setLoading(false);
        };
        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading order details...</p>
        </div>
        );
    }

    if (error || !order) {
        return (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</p>
            <p>{error || 'Order not found.'}</p>
            <button className="btn-yellow" onClick={() => navigate(-1)} style={{ marginTop: '15px' }}>
            ← Go Back
            </button>
        </div>
        );
    }

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
        <span style={{ background: s.bg, color: s.color, padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, textTransform: 'capitalize' }}>
            {s.label}
        </span>
        );
    };

    return (
        <div>
        {/* Back Button */}
        <button 
            onClick={() => navigate(-1)}
            style={{ 
            marginBottom: '20px', padding: '8px 16px', 
            background: 'var(--off)', border: '1px solid var(--border)', 
            borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' 
            }}
        >
            ← Back to Orders
        </button>

        {/* Order Header */}
        <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
                <h2 className="bebas" style={{ fontSize: '28px', margin: '0 0 4px 0', color: 'var(--navy)' }}>
                Order {order.orderNumber || `#${order.orderId?.slice(-6)}`}
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                Created: {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
                </p>
            </div>
            <div>{getStatusBadge(order.status)}</div>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {/* Customer & Order Info */}
            <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--navy)' }}>Order Information</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
                <InfoRow label="Customer" value={order.customerName} />
                <InfoRow label="Contact" value={order.customerContact || '—'} />
                <InfoRow label="Email" value={order.customerEmail || '—'} />
                <InfoRow label="Order Type" value={<span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{order.orderType}</span>} />
                <InfoRow label="Jersey Type" value={order.jerseyType === 'full-set' ? 'Full Jersey Set' : 'Top Only'} />
                <InfoRow label="Price per Item" value={`₱${order.pricePerItem?.toLocaleString()}`} />
                <InfoRow label="Quantity" value={`${order.quantity} items`} />
                <InfoRow 
                label="Total Amount" 
                value={<span style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: 'var(--navy)' }}>₱{order.totalAmount?.toLocaleString()}</span>} 
                />
                {order.processedByName && <InfoRow label="Processed By" value={order.processedByName} />}
            </div>
            </div>

            {/* Status History */}
            <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--navy)' }}>Status History</h3>
            <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
                {order.statusHistory?.map((h, idx) => (
                <div key={h.id || idx} style={{ marginBottom: '16px', position: 'relative' }}>
                    <div style={{
                    position: 'absolute', left: '-29px', top: '4px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: idx === 0 ? 'var(--navy)' : idx === (order.statusHistory?.length || 0) - 1 ? 'var(--green)' : 'var(--border)',
                    border: '2px solid white'
                    }}></div>
                    <div style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>
                    {(h.status || '').replace(/-/g, ' ')}
                    {h.changedByName && <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px' }}> by {h.changedByName}</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}
                    </div>
                    {h.notes && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{h.notes}</div>}
                </div>
                ))}
            </div>
            </div>
        </div>

        {/* Design Reference */}
        {order.designReferenceURL && (
            <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--navy)' }}>Design Reference</h3>
            <img 
                src={order.designReferenceURL} 
                alt="Design Reference" 
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', border: '1px solid var(--border)' }} 
            />
            </div>
        )}

        {/* Player Details Table */}
        <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--navy)' }}>
            Player Details ({order.items?.length || 0} items)
            </h3>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                <tr style={{ background: 'var(--off)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>#</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>SIZE</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>NUMBER</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>SURNAME</th>
                </tr>
                </thead>
                <tbody>
                {order.items?.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No items found.</td></tr>
                ) : (
                    order.items?.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', color: 'var(--muted)', fontSize: '12px' }}>{idx + 1}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{item.size}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--navy)', fontFamily: 'Bebas Neue', fontSize: '16px' }}>{item.number}</td>
                        <td style={{ padding: '12px', fontWeight: 500 }}>{item.surname}</td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
    };

    const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{label}</span>
        <span style={{ fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
    );

    export default OrderDetailPage;