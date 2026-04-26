import React from 'react';

const CustomerDashboard = ({ user }) => {
  const orders = [
    { id: 'ORD-2026-0042', item: 'Full Sublimation Jersey', qty: 15, date: '04/18/2026', status: 'inprogress' },
    { id: 'ORD-2026-0038', item: 'Team Uniform Set', qty: 20, date: '04/14/2026', status: 'completed' },
  ];

  return (
    <div>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Total Orders</div>
          <div className="stat-value">12</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--amber)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Pending</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>2</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--purple)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>In Progress</div>
          <div className="stat-value" style={{ color: 'var(--purple)' }}>3</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--green)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Completed</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>7</div>
        </div>
      </div>

      <div className="card">
        <h3 className="bebas" style={{ marginBottom: '1rem', fontSize: '22px' }}>My Active Orders</h3>
        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td className="bebas" style={{ color: 'var(--navy)', fontSize: '16px' }}>{o.id}</td>
                <td style={{ fontWeight: '600' }}>{o.item}</td>
                <td>{o.qty} pcs</td>
                <td style={{ color: 'var(--muted)' }}>{o.date}</td>
                <td><span className={`badge badge-${o.status}`}>{o.status.replace('-', ' ')}</span></td>
                <td>
                  <button className="btn-navy" style={{ padding: '6px 12px', fontSize: '12px' }}>Track Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerDashboard;
