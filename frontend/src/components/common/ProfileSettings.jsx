import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, changeUserPassword } from '../../services/userService';

const ProfileSettings = () => {
  const { userData, currentUser } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    fullName: userData?.fullName || '',
    contactNumber: userData?.contactNumber || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    const result = await updateUserProfile(currentUser.uid, {
      fullName: profileForm.fullName,
      contactNumber: profileForm.contactNumber,
    });

    if (result.success) {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setProfileMsg({ type: 'error', text: result.error });
    }

    setProfileLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });

    const result = await changeUserPassword(passwordForm.newPassword);

    if (result.success) {
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } else {
      setPasswordMsg({ type: 'error', text: result.error });
    }

    setPasswordLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* Profile Information */}
      <div className="card">
        <h3 className="bebas" style={{ fontSize: '22px', marginBottom: '1.5rem' }}>Profile Information</h3>

        {/* Read-only fields */}
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            value={userData?.email || ''}
            disabled
            style={{ width: '100%', background: 'var(--off)', cursor: 'not-allowed', opacity: 0.7 }}
          />
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Email cannot be changed</span>
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Role</label>
          <input
            className="form-input"
            value={userData?.role?.toUpperCase() || ''}
            disabled
            style={{ width: '100%', background: 'var(--off)', cursor: 'not-allowed', opacity: 0.7, textTransform: 'capitalize' }}
          />
        </div>

        <form onSubmit={handleProfileUpdate}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              placeholder="Your full name"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Contact Number</label>
            <input
              className="form-input"
              type="text"
              value={profileForm.contactNumber}
              onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
              placeholder="+63 912 345 6789"
              style={{ width: '100%' }}
              required
            />
          </div>

          {profileMsg.text && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              background: profileMsg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
              color: profileMsg.type === 'success' ? 'var(--green)' : 'var(--red)',
            }}>
              {profileMsg.text}
            </div>
          )}

          <button
            type="submit"
            className="btn-yellow"
            style={{ padding: '10px 24px' }}
            disabled={profileLoading}
          >
            {profileLoading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="bebas" style={{ fontSize: '22px', marginBottom: '1.5rem' }}>Change Password</h3>

        <form onSubmit={handlePasswordChange}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-input"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
              style={{ width: '100%' }}
              required
            />
          </div>

          {passwordMsg.text && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              background: passwordMsg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
              color: passwordMsg.type === 'success' ? 'var(--green)' : 'var(--red)',
            }}>
              {passwordMsg.text}
            </div>
          )}

          <button
            type="submit"
            className="btn-yellow"
            style={{ padding: '10px 24px' }}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;