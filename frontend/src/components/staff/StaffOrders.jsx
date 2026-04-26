import React from 'react';

const StaffOrders = ({ orders, updateStatus }) => {
  return (
    <div className="card">
      <div style={{marginBottom: '20px'}}>
        <h3>Active Order Queue</h3>
      </div>
      <table>
        <thead>
          <tr><th>ID</th><th>Customer</th><th>Type</th><th>Current Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer}</td>
              <td><span style={{fontSize: '0.8rem', color: '#666'}}>{o.type}</span></td>
              <td><span className={`status status-${o.status.toLowerCase().replace(/\s/g, '')}`}>{o.status}</span></td>
              <td>
                {o.status === 'Pending' && (
                  <>
                    <button className="btn-primary" onClick={() => updateStatus(o.id, 'Confirmed')}>Confirm</button>
                    <button className="btn-secondary" style={{marginLeft: '5px'}} onClick={() => {
                      const reason = prompt("Reason for decline:");
                      if(reason) updateStatus(o.id, 'Declined');
                    }}>Decline</button>
                  </>
                )}
                {o.status === 'Confirmed' && <button className="btn-primary" onClick={() => updateStatus(o.id, 'In Progress')}>Start Production</button>}
                {o.status === 'In Progress' && <button className="btn-primary" onClick={() => updateStatus(o.id, 'Ready for Pickup')}>Mark Ready</button>}
                {o.status === 'Ready for Pickup' && <button className="btn-primary" onClick={() => updateStatus(o.id, 'Completed')}>Finish & Close</button>}
                {o.status === 'Completed' && <span style={{color: '#999', fontSize: '0.8rem'}}>No actions</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffOrders;
