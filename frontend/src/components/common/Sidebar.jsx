import React from 'react';

const Sidebar = ({ user, currentView, setCurrentView, onLogout }) => {
  const customerLinks = [
    { id: 'dashboard', label: 'My Orders', icon: '📦' },
    { id: 'new-order', label: 'New Order', icon: '➕' },
    { id: 'profile', label: 'Account Settings', icon: '👤' },
  ];

  const staffLinks = [
    { id: 'dashboard', label: 'Order Queue', icon: '📋' },
    { id: 'walk-in', label: 'Walk-in Order', icon: '🚶' },
    { id: 'profile', label: 'Account Settings', icon: '👤' },
  ];

  const ownerLinks = [
    { id: 'dashboard', label: 'Insights', icon: '📊' },
    { id: 'staff-mgmt', label: 'Staff Management', icon: '👥' },
    { id: 'all-orders', label: 'All Orders', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📝' },
    { id: 'profile', label: 'Account Settings', icon: '👤' },
  ];

  const links = user.role === 'Owner' ? ownerLinks : user.role === 'Staff' ? staffLinks : customerLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-box">S</div>
        <span className="bebas" style={{ fontSize: '24px', letterSpacing: '0.05em' }}>SAMPINGS</span>
      </div>

      <div className="nav-links">
        {links.map((link) => (
          <div
            key={link.id}
            className={`nav-link ${currentView === link.id ? 'active' : ''}`}
            onClick={() => setCurrentView(link.id)}
          >
            <span style={{ marginRight: '10px' }}>{link.icon}</span>
            {link.label}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '1rem', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          Logged in as <strong style={{ color: 'white' }}>{user.role}</strong>
        </div>
        <button className="btn-navy" style={{ width: '100%', background: 'rgba(255,255,255,0.1)' }} onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
