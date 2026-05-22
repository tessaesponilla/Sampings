import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, changeUserPassword } from '../../services/userService';
import '../../styles/responsive.css';

const ProfileSettings = () => {
  const { userData, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: userData?.fullName || '',
    contactNumber: userData?.contactNumber || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
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
    if (result.success) setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    else setProfileMsg({ type: 'error', text: result.error });
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setPasswordMsg({ type: 'error', text: 'Password must include at least one uppercase letter.' });
      return;
    }
    if (!/[a-z]/.test(passwordForm.newPassword)) {
      setPasswordMsg({ type: 'error', text: 'Password must include at least one lowercase letter.' });
      return;
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordMsg({ type: 'error', text: 'Password must include at least one number.' });
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordMsg({ type: 'error', text: 'New password must be different from your current password.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });

    const result = await changeUserPassword(passwordForm.currentPassword, passwordForm.newPassword);

    if (result.success) {
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordMsg({ type: 'error', text: result.error });
    }
    setPasswordLoading(false);
  };

  return (
    <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
      {/* Account Info Header */}
      <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--accent2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '22px' }}>
          {userData?.fullName?.charAt(0) || '?'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--navy)' }}>{userData?.fullName}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{userData?.email}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'capitalize', marginTop: '2px' }}>
            <span style={{ background: 'var(--navy)', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>{userData?.role}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--off)', borderRadius: '10px', padding: '4px' }}>
        <button onClick={() => setActiveTab('profile')}
          style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: activeTab === 'profile' ? 'white' : 'transparent', color: activeTab === 'profile' ? 'var(--navy)' : 'var(--muted)', boxShadow: activeTab === 'profile' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
          👤 Edit Profile
        </button>
        <button onClick={() => setActiveTab('password')}
          style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: activeTab === 'password' ? 'white' : 'transparent', color: activeTab === 'password' ? 'var(--navy)' : 'var(--muted)', boxShadow: activeTab === 'password' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
          🔒 Password
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} placeholder="Your full name" style={{ width: '100%' }} required />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Contact Number</label>
            <input className="form-input" type="text" value={profileForm.contactNumber} onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })} placeholder="+63 912 345 6789" style={{ width: '100%' }} required />
          </div>
          {profileMsg.text && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', background: profileMsg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: profileMsg.type === 'success' ? 'var(--green)' : 'var(--red)' }}>{profileMsg.text}</div>
          )}
          <button type="submit" className="btn-yellow" style={{ padding: '10px 24px', width: '100%' }} disabled={profileLoading}>
            {profileLoading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange}>
          <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
            <label className="form-label">Current Password</label>
            <input
              className="form-input"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Enter current password"
              style={{ width: '100%' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              style={{ position: 'absolute', right: '8px', top: '32px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '2px' }}
            >
              {showCurrentPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>

          <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="••••••••"
              style={{ width: '100%', paddingRight: '36px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{ position: 'absolute', right: '8px', top: '32px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '2px' }}
            >
              {showNewPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>

          <div className="form-group" style={{ marginBottom: '20px', position: 'relative' }}>
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-input"
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••"
              style={{ width: '100%', paddingRight: '36px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', right: '8px', top: '32px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '2px' }}
            >
              {showConfirmPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>

          {passwordMsg.text && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', background: passwordMsg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: passwordMsg.type === 'success' ? 'var(--green)' : 'var(--red)' }}>{passwordMsg.text}</div>
          )}
          <button type="submit" className="btn-yellow" style={{ padding: '10px 24px', width: '100%' }} disabled={passwordLoading}>
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileSettings;