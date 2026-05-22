import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/authService';
import logo from '../../assets/logo.png';
import '../../styles/responsive.css';

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
    { path: '/customer/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/customer/new-order', label: 'New Order', icon: <PlusIcon /> },
    { path: '/customer/orders', label: 'Order History', icon: <ListIcon /> },
    { path: '/customer/profile', label: 'Settings', icon: <UserIcon /> },
  ];

  const staffLinks = [
    { path: '/staff/queue', label: 'Order Queue', icon: <QueueIcon /> },
    { path: '/staff/walk-in', label: 'Walk-in Order', icon: <WalkIcon /> },
    { path: '/staff/profile', label: 'Settings', icon: <UserIcon /> },
  ];

  const ownerLinks = [
    { path: '/owner/dashboard', label: 'Insights', icon: <ChartIcon /> },
    { path: '/owner/all-orders', label: 'All Orders', icon: <ListIcon /> },
    { path: '/owner/staff-management', label: 'Staff Management', icon: <TeamIcon /> },
     { path: '/owner/price-settings', label: 'Price Settings', icon: <PriceIcon /> },
    { path: '/owner/reports', label: 'Reports', icon: <ReportIcon /> },
    { path: '/owner/profile', label: 'Settings', icon: <UserIcon /> },
  ];

  const links = userData?.role === 'owner' ? ownerLinks 
    : userData?.role === 'staff' ? staffLinks 
    : customerLinks;

  if (!userData) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <img src={logo} alt="Sampings" />
        </div>
        <div className="sidebar-logo-text">
          <span className="bebas" style={{ fontSize: '22px', letterSpacing: '0.05em', color: 'white', lineHeight: 1.2 }}>SAMPINGS</span>
          <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>Sportswear</span>
        </div>
      </div>

      <div className="nav-links">
        {links.map((link) => (
          <div
            key={link.path}
            className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            <span style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>{link.icon}</span>
            {link.label}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '1rem', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          Logged in as <strong style={{ color: 'white', textTransform: 'capitalize' }}>{userData?.role}</strong>
        </div>
        <button className="btn-navy" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleLogout}>
          <LogoutIcon /> Logout
        </button>
      </div>
    </aside>
  );
};


const HomeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const PlusIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>);
const ListIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>);
const UserIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const QueueIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>);
const WalkIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"><circle cx="12" cy="5" r="2"/><path d="M10 22v-5l-2-3 2-4h4l2 4-2 3v5"/></svg>);
const ChartIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);
const TeamIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>);
const ReportIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
const LogoutIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const PriceIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>);

export default Sidebar;