import React from 'react';

const ProfileUpdate = () => {
  return (
    <div className="card" style={{maxWidth: '600px'}}>
      <h3>Account Settings</h3>
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" defaultValue="Demo User" />
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" defaultValue="user@example.com" />
      </div>
      <div className="form-group">
        <label>Contact Number</label>
        <input type="text" defaultValue="0912-345-6789" />
      </div>
      <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #eee'}} />
      <div className="form-group">
        <label>New Password</label>
        <input type="password" placeholder="Leave blank to keep current" />
      </div>
      <button className="btn-primary">Update Profile</button>
    </div>
  );
};

export default ProfileUpdate;
