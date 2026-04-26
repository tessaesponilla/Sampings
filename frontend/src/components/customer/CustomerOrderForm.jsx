import React from 'react';

const CustomerOrderForm = () => {
  return (
    <div className="card" style={{maxWidth: '600px'}}>
      <h3>Customize Your Order</h3>
      <p style={{color: '#666', marginBottom: '20px'}}>Standard production time: 5-7 business days.</p>
      <div className="form-group">
        <label>Jersey Style</label>
        <select>
          <option>Full Sublimation Jersey</option>
          <option>Semi-Sublimation Jersey</option>
          <option>Standard Sports Tee</option>
        </select>
      </div>
      <div className="form-group">
        <label>Quantity</label>
        <input type="number" placeholder="How many pieces?" />
      </div>
      <div className="form-group">
        <label>Special Instructions</label>
        <textarea className="form-group" style={{width: '100%', height: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd'}} placeholder="Size breakdown, design references, etc."></textarea>
      </div>
      <button className="btn-primary" style={{width: '100%'}}>Place Order</button>
    </div>
  );
};

export default CustomerOrderForm;
