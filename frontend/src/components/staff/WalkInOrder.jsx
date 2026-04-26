import React from 'react';

const WalkInOrder = () => {
  return (
    <div className="card" style={{maxWidth: '600px'}}>
      <h3>New Walk-in Transaction</h3>
      <div className="form-group">
        <label>Customer Name</label>
        <input type="text" placeholder="Enter name or 'Walk-in Guest'" />
      </div>
      <div className="form-group">
        <label>Jersey Details</label>
        <select>
          <option>Full Sublimation (₱1,250.00)</option>
          <option>Semi-Sublimation (₱900.00)</option>
          <option>Basic Print (₱600.00)</option>
        </select>
      </div>
      <div style={{display: 'flex', gap: '15px'}}>
        <div className="form-group" style={{flex: 1}}>
          <label>Quantity</label>
          <input type="number" defaultValue="1" />
        </div>
        <div className="form-group" style={{flex: 1}}>
          <label>Price per Unit</label>
          <input type="text" value="₱1,250.00" readOnly />
        </div>
      </div>
      <div className="form-group">
        <label>Tracking Preference</label>
        <select>
          <option>Receipt with QR Code (Recommended)</option>
          <option>None / No Tracking</option>
        </select>
      </div>
      <button className="btn-primary" style={{width: '100%'}}>Process Order & Print QR</button>
    </div>
  );
};

export default WalkInOrder;
