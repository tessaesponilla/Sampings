    import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { getOrderDetails } from '../../services/orderService';

    const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        const fetchOrder = async () => {
        setLoading(true);
        const result = await getOrderDetails(orderId);
        if (result.success) setOrder(result.order);
        else setError('Order not found.');
        setLoading(false);
        };
        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) return <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading order details...</div>;

    if (error || !order) {
        return (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</p>
            <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '20px' }}>{error || 'Order not found.'}</p>
            <button className="btn-yellow" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
        );
    }

    const getStatusBadge = (status) => {
        const map = {
        'pending': { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
        'confirmed': { bg: '#ede9fe', color: '#7c3aed', label: 'Confirmed' },
        'in-progress': { bg: '#dbeafe', color: '#2563eb', label: 'In Progress' },
        'ready-for-pickup': { bg: '#d1fae5', color: '#059669', label: 'Ready' },
        'completed': { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
        };
        const s = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
        return <span style={{ background: s.bg, color: s.color, padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>{s.label}</span>;
    };

    const tabs = [
        { key: 'info', label: ' Information' },
        { key: 'players', label: ` Player Details (${order.items?.length || 0})` },
        { key: 'timeline', label: ' Timeline' },
        { key: 'design', label: ' Design Reference' },
    ];

    return (
        <div>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '16px', padding: '8px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            ← Back
        </button>

        <div className="card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
                <h2 className="bebas" style={{ fontSize: '24px', margin: 0, color: 'var(--navy)' }}>
                Order {order.orderNumber || `#${order.orderId?.slice(-6)}`}
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '4px 0 0 0' }}>
                {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                </p>
            </div>
            {getStatusBadge(order.status)}
            </div>

            <div style={{ display: 'flex', gap: '4px', marginTop: '16px', background: 'var(--off)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
            {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                    padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap',
                    background: activeTab === tab.key ? 'white' : 'transparent',
                    color: activeTab === tab.key ? 'var(--navy)' : 'var(--muted)',
                    boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}>
                {tab.label}
                </button>
            ))}
            </div>
        </div>

        <div className="card" style={{ padding: '24px', minHeight: '300px' }}>
            {/* INFORMATION TAB */}
            {activeTab === 'info' && (
            <div style={{ maxWidth: '500px' }}>
                <InfoRow label="Customer" value={order.customerName} />
                <InfoRow label="Contact Number" value={order.customerContact || '—'} />
                {order.customerEmail && <InfoRow label="Email Address" value={order.customerEmail} />}
                <InfoRow label="Order Type" value={<span style={{ textTransform: 'capitalize', fontWeight: 600, color: order.orderType === 'walk-in' ? 'var(--amber)' : 'var(--navy)' }}>{order.orderType}</span>} />
                <InfoRow label="Jersey Type" value={order.jerseyType === 'full-set' ? 'Full Jersey Set (Shirt & Shorts)' : 'Top Only (Shirt)'} />
                <InfoRow label="Price per Item" value={`₱${(order.pricePerItem || (order.jerseyType === 'full-set' ? 800 : 400)).toLocaleString()}`} />
                <InfoRow label="Quantity" value={`${order.quantity} items`} />
                <InfoRow label="Total Amount" value={<span style={{ fontFamily: 'Bebas Neue', fontSize: '20px', color: 'var(--navy)' }}>₱{order.totalAmount?.toLocaleString()}</span>} />
                {order.processedByName && <InfoRow label="Processed By" value={order.processedByName} />}
            </div>
            )}

            {/* PLAYERS TAB */}
            {activeTab === 'players' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ background: 'var(--off)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>#</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Size</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Number</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Surname</th>
                </tr>
                </thead>
                <tbody>
                {!order.items || order.items.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No player details.</td></tr>
                ) : (
                    order.items.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px', color: 'var(--muted)', fontSize: '13px' }}>{idx + 1}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{item.size}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--navy)', fontFamily: 'Bebas Neue', fontSize: '16px' }}>{item.number}</td>
                        <td style={{ padding: '12px', fontWeight: 500, textTransform: 'uppercase' }}>{item.surname}</td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
            <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '20px', marginLeft: '8px', maxWidth: '500px' }}>
                {!order.statusHistory || order.statusHistory.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>No history yet.</p>
                ) : (
                order.statusHistory.map((h, idx) => (
                    <div key={h.id || idx} style={{ marginBottom: idx === order.statusHistory.length - 1 ? 0 : '20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-27px', top: '6px', width: '12px', height: '12px', borderRadius: '50%', background: idx === 0 ? 'var(--navy)' : idx === order.statusHistory.length - 1 ? '#16a34a' : 'var(--border)', border: '2px solid white', boxShadow: '0 0 0 2px var(--border)' }}></div>
                    <div style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize', color: 'var(--text)' }}>{(h.status || '').replace(/-/g, ' ')}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{h.timestamp ? new Date(h.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                    {h.changedByName && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>by {h.changedByName}</div>}
                    {h.notes && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', fontStyle: 'italic' }}>{h.notes}</div>}
                    </div>
                ))
                )}
            </div>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
            order.designReferenceURL ? (
                <div style={{ textAlign: 'center' }}>
                <img src={order.designReferenceURL} alt="Design" style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '12px', border: '1px solid var(--border)' }} />
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                <p style={{ fontSize: '40px', marginBottom: '8px' }}>📸</p>
                <p>No design reference uploaded.</p>
                </div>
            )
            )}
        </div>
        </div>
    );
    };

    const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 500, textAlign: 'right', fontSize: '13px' }}>{value}</span>
    </div>
    );

    export default OrderDetailPage;