import React, { useState } from 'react';
import './App.css';

// Components
import Sidebar from './components/common/Sidebar';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import LandingPage from './components/common/LandingPage';
import CustomerDashboard from './components/customer/CustomerDashboard';
import CustomerOrderForm from './components/customer/CustomerOrderForm';
import StaffQueue from './components/staff/StaffQueue';
import WalkInOrder from './components/staff/WalkInOrder';
import OwnerDashboard from './components/owner/OwnerDashboard';
import StaffMgmt from './components/owner/StaffMgmt';
import ProfileSettings from './components/common/ProfileSettings';

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('landing'); // 'landing', 'login', 'register'
  const [currentView, setCurrentView] = useState('dashboard');

  // Logic to determine which "screen" to show
  if (!user) {
    if (authMode === 'login') {
      return (
        <LoginPage
          onLogin={(userData) => {
            setUser(userData);
            setAuthMode('landing');
            setCurrentView('dashboard');
          }}
          onShowRegister={() => setAuthMode('register')}
        />
      );
    }
    if (authMode === 'register') {
      return (
        <RegisterPage
          onRegister={(userData) => {
            setUser(userData);
            setAuthMode('landing');
            setCurrentView('dashboard');
          }}
          onBackToLogin={() => setAuthMode('login')}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setAuthMode('login')}
        onTrackOrder={() => setAuthMode('login')}
      />
    );
  }

  const renderContent = () => {
    switch (user.role) {
      case 'Customer':
        switch (currentView) {
          case 'dashboard': return <CustomerDashboard user={user} />;
          case 'new-order': return <CustomerOrderForm />;
          case 'profile': return <ProfileSettings />;
          default: return <CustomerDashboard user={user} />;
        }
      case 'Staff':
        switch (currentView) {
          case 'dashboard': return <StaffQueue user={user} />;
          case 'walk-in': return <WalkInOrder />;
          case 'profile': return <ProfileSettings />;
          default: return <StaffQueue user={user} />;
        }
      case 'Owner':
        switch (currentView) {
          case 'dashboard': return <OwnerDashboard />;
          case 'staff-mgmt': return <StaffMgmt />;
          case 'all-orders': return <StaffQueue user={user} readOnly={true} />;
          case 'reports': return <div className="card">Reports & PDF Export (Coming Soon)</div>;
          case 'profile': return <ProfileSettings />;
          default: return <OwnerDashboard />;
        }
      default:
        return <div className="card">Unauthorized Access</div>;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return user.role === 'Owner' ? 'Business Insights' :
               user.role === 'Staff' ? 'Order Queue' : 'My Orders';
      case 'new-order': return 'Place New Order';
      case 'walk-in': return 'Create Walk-in Order';
      case 'staff-mgmt': return 'Staff Management';
      case 'all-orders': return 'All System Orders (Read-Only)';
      case 'reports': return 'Sales Reports';
      case 'profile': return 'Account Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={() => {
          setUser(null);
          setAuthMode('landing');
          setCurrentView('dashboard');
        }}
      />
      <main className="main-wrapper">
        <header className="page-header">
          <h1 className="bebas" style={{ fontSize: '32px', margin: 0 }}>{getPageTitle()}</h1>
          <div style={{ color: 'var(--muted)', fontSize: '14px' }}>{new Date().toLocaleDateString()}</div>
        </header>
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
