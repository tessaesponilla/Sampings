import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { registerStaff } from '../../services/authService';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ fullName: '', email: '', password: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'staff'));
      const querySnapshot = await getDocs(q);
      const staff = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffList(staff);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

const handleAddStaff = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    const result = await registerStaff(
      newStaff.fullName, 
      newStaff.email, 
      newStaff.contactNumber,  // ADD THIS
      newStaff.password
    );

    if (result.success) {
      setShowModal(false);
      setNewStaff({ fullName: '', email: '', contactNumber: '', password: '' });
      fetchStaff();
    } else {
      setError(result.error);
    }
    setActionLoading(false);
  };

  const toggleStaffStatus = async (staffId, currentStatus) => {
    const { doc, updateDoc } = await import('firebase/firestore');
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await updateDoc(doc(db, 'users', staffId), { status: newStatus });
    fetchStaff();
  };

  return (
    <div className="card">
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center'}}>
        <h3 className="bebas">Staff Directory</h3>
        <button className="btn-yellow" onClick={() => setShowModal(true)}>+ Add New Staff</button>
      </div>

      {infoMessage && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--accent2)',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--navy)'
        }}>
          ℹ️ {infoMessage}
        </div>
      )}

      {loading ? (
        <p>Loading staff...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Orders Processed</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px' }}>{s.fullName}</td>
                <td style={{ padding: '12px' }}>{s.email}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${s.status === 'active' ? 'badge-completed' : 'badge-amber'}`}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{s.processedOrders || 0}</td>
                <td style={{ padding: '12px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.8rem', color: s.status === 'active' ? '#ff4757' : 'var(--green)' }}
                    onClick={() => toggleStaffStatus(s.id, s.status)}
                  >
                    {s.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {staffList.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No staff members found.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px', background: 'var(--navy-light)' }}>
            <h3 className="bebas">Add New Staff</h3>
            {error && <p style={{ color: '#ff4757', fontSize: '14px' }}>{error}</p>}
            <form onSubmit={handleAddStaff}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text" className="form-input" required
                  value={newStaff.fullName}
                  onChange={(e) => setNewStaff({...newStaff, fullName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email" className="form-input" required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>
              <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text" className="form-input"
                value={newStaff.contactNumber}
                onChange={(e) => setNewStaff({...newStaff, contactNumber: e.target.value})}
                placeholder="+63 912 345 6789"
              />
            </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password" className="form-input" required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-yellow" disabled={actionLoading} style={{ flex: 1 }}>
                  Create Staff Account
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;