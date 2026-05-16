    import React, { useRef } from 'react';
    import { QRCodeSVG } from 'qrcode.react';
    import logo from '../../assets/logo.png';

    const OrderReceipt = ({ order, staffName, onClose }) => {
    const receiptRef = useRef(null);

    const handlePrint = () => {
        const content = receiptRef.current;
        const printWindow = window.open('', '_blank', 'width=400,height=700');
        
        printWindow.document.write(`
        <html>
            <head>
            <title>Order Receipt - ${order.orderNumber || order.orderId?.slice(-6)}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 380px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
                .header img { height: 50px; margin-bottom: 8px; }
                .header h2 { font-size: 16px; font-weight: 800; margin: 4px 0; letter-spacing: 1px; }
                .header p { font-size: 10px; color: #555; margin: 2px 0; }
                .section { margin-bottom: 12px; }
                .section h4 { font-size: 11px; font-weight: 700; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                .row { display: flex; justify-content: space-between; font-size: 11px; margin: 4px 0; }
                .row .label { color: #666; }
                .row .value { font-weight: 600; text-align: right; }
                .total { font-size: 14px; font-weight: 800; border-top: 1px solid #000; padding-top: 8px; margin-top: 8px; }
                .qr-section { text-align: center; margin: 16px 0; padding: 12px; border: 1px solid #eee; border-radius: 8px; }
                .qr-section p { font-size: 10px; color: #666; margin-bottom: 8px; }
                .footer { text-align: center; font-size: 10px; color: #888; margin-top: 16px; border-top: 1px dashed #ccc; padding-top: 12px; }
                .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; }
                .badge-walkin { background: #fef3c7; color: #d97706; }
                .badge-online { background: #dbeafe; color: #1d4ed8; }
                @media print {
                body { padding: 0; }
                button { display: none; }
                }
            </style>
            </head>
            <body>
            <div>${content.innerHTML}</div>
            <script>window.onload = function() { window.print(); }</script>
            </body>
        </html>
        `);
        
        printWindow.document.close();
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
        }}>
        <div style={{
            maxWidth: '420px', width: '100%', maxHeight: '90vh',
            overflow: 'auto', background: 'white', borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
            {/* Receipt Content */}
            <div ref={receiptRef} style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
                <img src={logo} alt="Sampings" style={{ height: '50px', marginBottom: '8px' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '1px', margin: '4px 0', color: '#0f193c' }}>
                SAMPINGS SPORTSWEAR
                </h2>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0' }}>
                Benedicto St., Mandurriao, Iloilo City, 5000
                </p>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0' }}>
                Contact: 09306304986
                </p>
            </div>

            {/* Order Info */}
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#374151' }}>
                Order Details
                </h4>
                <Row label="Order Number" value={order.orderNumber || `#${order.orderId?.slice(-6)}`} />
                <Row label="Date" value={formatDate(order.orderDate || new Date())} />
                <Row label="Type" value={
                <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
                    background: order.orderType === 'online' ? '#dbeafe' : '#fef3c7',
                    color: order.orderType === 'online' ? '#1d4ed8' : '#d97706'
                }}>
                    {order.orderType?.toUpperCase()}
                </span>
                } />
                <Row label="Status" value={
                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {(order.status || 'pending').replace(/-/g, ' ')}
                </span>
                } />
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#374151' }}>
                Customer Information
                </h4>
                <Row label="Name" value={order.customerName} />
                <Row label="Contact" value={order.customerContact || '—'} />
                {order.customerEmail && <Row label="Email" value={order.customerEmail} />}
            </div>

            {/* Order Summary */}
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#374151' }}>
                Order Summary
                </h4>
                <Row label="Jersey Type" value={order.jerseyType === 'full-set' ? 'Full Jersey Set' : 'Top Only'} />
                <Row label="Price per Item" value={`₱${(order.pricePerItem || (order.jerseyType === 'full-set' ? 800 : 400)).toLocaleString()}`} />
                <Row label="Quantity" value={`${order.quantity} items`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, borderTop: '2px solid #0f193c', paddingTop: '8px', marginTop: '8px' }}>
                <span>TOTAL</span>
                <span style={{ color: '#0f193c' }}>₱{(order.totalAmount || 0).toLocaleString()}</span>
                </div>
            </div>

            {/* Staff Info */}
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#374151' }}>
                Processed By
                </h4>
                <Row label="Staff" value={staffName || order.processedByName || '—'} />
            </div>

            {/* QR Code */}
            <div style={{ textAlign: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '8px', fontWeight: 600 }}>
                Scan to track your order
                </p>
                <QRCodeSVG 
                value={`https://sampings-8e8d3.web.app/track/${order.orderNumber || order.orderId}`}
                size={120}
                />
                <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px' }}>
                {order.orderNumber || order.orderId?.slice(-6)}
                </p>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '10px', color: '#9ca3af', borderTop: '1px dashed #e5e7eb', paddingTop: '12px' }}>
                <p>Thank you for choosing Sampings!</p>
                <p>For inquiries, please contact us.</p>
                <p style={{ marginTop: '4px' }}>{formatDate(new Date())}</p>
            </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', padding: '16px 24px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: '0 0 16px 16px' }}>
            <button
                onClick={handlePrint}
                style={{
                flex: 1, padding: '12px', background: '#0f193c', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer'
                }}
            >
                🖨️ Print Receipt
            </button>
            <button
                onClick={onClose}
                style={{
                flex: 1, padding: '12px', background: '#e5e7eb', color: '#374151',
                border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
                cursor: 'pointer'
                }}
            >
                Close
            </button>
            </div>
        </div>
        </div>
    );
    };

    const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '4px 0' }}>
        <span style={{ color: '#6b7280' }}>{label}</span>
        <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
    );

    export default OrderReceipt;