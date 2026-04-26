import React from 'react';

const LiveTracking = () => {
  return (
    <div>
      <div className="card" id="trackResult">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div className="bebas" style={{ fontSize: '28px', color: 'var(--navy)', letterSpacing: '0.05em' }} id="trackOrderId">ORD-2026-0042</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '2px' }}>Placed: 04/18/2026 · Full Sublimation Jersey × 15</div>
          </div>
          <span className="badge badge-inprogress" id="trackBadge">In Progress</span>
        </div>

        <div style={{ position: 'relative', margin: '2rem 0' }}>
            <div className="progress-steps" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Step num="1" label="Pending" status="done" />
                <Step num="2" label="Confirmed" status="done" />
                <Step num="3" label="In Progress" status="active" />
                <Step num="4" label="Ready" status="" />
                <Step num="5" label="Completed" status="" />
            </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border)', margin: '2rem 0' }}></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Order Details</div>
            <DetailRow label="Customer" val="Juan dela Cruz" />
            <DetailRow label="Item" val="Full Sublimation Jersey" />
            <DetailRow label="Quantity" val="15 pcs" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Cost Summary</div>
            <DetailRow label="Unit Price" val="₱450.00" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: 'var(--navy)', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '6px' }}>
              <span>Total</span>
              <span>₱6,750.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step = ({ num, label, status }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
    <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: status === 'done' ? 'var(--navy)' : status === 'active' ? 'white' : 'var(--border)',
        color: status === 'active' ? 'var(--navy)' : 'white',
        border: status === 'active' ? '3px solid var(--navy)' : '3px solid white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700',
        zIndex: 2
    }}>
      {num}
    </div>
    <div style={{ fontSize: '11px', fontWeight: '600', color: status === '' ? 'var(--muted)' : 'var(--navy)', textAlign: 'center' }}>{label}</div>
  </div>
);

const DetailRow = ({ label, val }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
    <span style={{ color: 'var(--muted)' }}>{label}</span>
    <span style={{ fontWeight: '600' }}>{val}</span>
  </div>
);

export default LiveTracking;
