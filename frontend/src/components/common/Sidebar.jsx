import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/authService';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;


  const customerLinks = [
    { path: '/customer/dashboard', label: 'My Orders', icon: '📦' },
    { path: '/customer/new-order', label: 'New Order', icon: '➕' },
    { path: '/customer/orders', label: 'Order History', icon: '📋' },
    { path: '/customer/profile', label: 'Account Settings', icon: '👤' },
  ];

  const staffLinks = [
    { path: '/staff/queue', label: 'Order Queue', icon: '📋' },
    { path: '/staff/walk-in', label: 'Walk-in Order', icon: '🚶' },
    { path: '/staff/profile', label: 'Account Settings', icon: '👤' },
  ];


  const ownerLinks = [
    { path: '/owner/dashboard', label: 'Insights', icon: '📊' },
    { path: '/owner/all-orders', label: 'All Orders', icon: '📋' },
    { path: '/owner/staff-management', label: 'Staff Management', icon: '👥' },
    { path: '/owner/reports', label: 'Reports', icon: '📝' },
    { path: '/owner/profile', label: 'Account Settings', icon: '👤' },
  ];

  const links = userData?.role === 'owner' ? ownerLinks 
    : userData?.role === 'staff' ? staffLinks 
    : customerLinks;

  if (!userData) {
    return null; 
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-box">S</div>
        <span className="bebas" style={{ fontSize: '24px', letterSpacing: '0.05em' }}>SAMPINGS</span>
      </div>

      <div className="nav-links">
        {links.map((link) => (
          <div
            key={link.path}
            className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            <span style={{ marginRight: '10px' }}>{link.icon}</span>
            {link.label}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '1rem', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          Logged in as <strong style={{ color: 'white', textTransform: 'capitalize' }}>{userData?.role}</strong>
        </div>
        <button className="btn-navy" style={{ width: '100%', background: 'rgba(255,255,255,0.1)' }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;