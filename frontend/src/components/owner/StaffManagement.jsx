import React from 'react';

const MOCK_STAFF = [
  { id: 1, name: 'Alice Johnson', email: 'alice@sampings.com', role: 'Staff' },
  { id: 2, name: 'Bob Wilson', email: 'bob@sampings.com', role: 'Staff' },
];

const StaffManagement = () => {
  return (
    <div className="card">
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center'}}>
        <h3>Staff Directory</h3>
        <button className="btn-primary">+ Add New Staff</button>
      </div>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role/Position</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {MOCK_STAFF.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>Production Specialist</td>
              <td><span className="status status-ready">Active</span></td>
              <td>
                <button className="btn-secondary" style={{padding: '5px 10px', fontSize: '0.8rem'}}>Edit</button>
                <button className="btn-secondary" style={{padding: '5px 10px', fontSize: '0.8rem', marginLeft: '5px', color: 'red'}}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffManagement;
