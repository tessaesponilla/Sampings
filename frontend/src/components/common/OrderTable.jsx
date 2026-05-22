import React from 'react';
import '../../styles/responsive.css';

const OrderTable = ({ orders }) => {
  return (
    <div className="card">
      <table>
        <thead>
          <tr><th>ID</th><th>Customer</th><th>Item</th><th>Type</th><th>Status</th><th>Total</th></tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer}</td>
              <td>{o.item}</td>
              <td>{o.type}</td>
              <td><span className={`status status-${o.status.toLowerCase().replace(/\s/g, '')}`}>{o.status}</span></td>
              <td>{o.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
