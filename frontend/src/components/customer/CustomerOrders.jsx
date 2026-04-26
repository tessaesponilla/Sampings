import React from 'react';
import StatCard from '../common/StatCard';

const CustomerOrders = ({ orders }) => {
  return (
    <div>
      <div className="stats-grid">
        <StatCard title="My Total Orders" value={orders.length} />
        <StatCard title="Currently Processing" value={orders.filter(o => !['Completed', 'Pending'].includes(o.status)).length} />
      </div>
      <div className="card">
        <h3>Live Order Tracking</h3>
        <table>
          <thead>
            <tr><th>Order ID</th><th>Item</th><th>Status</th><th>Track</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.item}</td>
                <td><span className={`status status-${o.status.toLowerCase().replace(/\s/g, '')}`}>{o.status}</span></td>
                <td>
                  <div style={{width: '100px', height: '8px', background: '#eee', borderRadius: '4px', marginTop: '5px'}}>
                    <div style={{
                      width: o.status === 'Pending' ? '20%' : o.status === 'Confirmed' ? '40%' : o.status === 'In Progress' ? '60%' : o.status === 'Ready for Pickup' ? '80%' : '100%',
                      height: '100%',
                      background: 'var(--primary-color)',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </td>
                <td>
                  {o.status === 'Pending' ? (
                    <button className="btn-secondary" style={{color: 'red'}}>Cancel</button>
                  ) : (
                    <span style={{fontSize: '0.8rem', color: '#999'}}>Locked</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>You haven't placed any orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerOrders;
