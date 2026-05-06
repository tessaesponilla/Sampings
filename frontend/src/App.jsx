import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Components
import Sidebar from './components/common/Sidebar';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import LandingPage from './components/common/LandingPage';
import CustomerDashboard from './components/customer/CustomerDashboard';
import CustomerOrderForm from './components/customer/CustomerOrderForm';
import CustomerOrders from './components/customer/CustomerOrders';
import StaffQueue from './components/staff/StaffQueue';
import WalkInOrder from './components/staff/WalkInOrder';
import OwnerDashboard from './components/owner/OwnerDashboard';
import StaffManagement from './components/owner/StaffManagement';
import OwnerReports from './components/owner/OwnerReports';
import ProfileSettings from './components/common/ProfileSettings';
import LiveTracking from './components/tracking/LiveTracking';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--navy)',
        color: 'white',
        fontFamily: 'Bebas Neue'
      }}>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!userData || !allowedRoles.includes(userData.role))) {
    if (userData?.role) {
      switch (userData.role) {
        case 'customer':
          return <Navigate to="/customer/dashboard" replace />;
        case 'staff':
          return <Navigate to="/staff/queue" replace />;
        case 'owner':
          return <Navigate to="/owner/dashboard" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
    return <div style={{ background: 'var(--navy)', height: '100vh' }}></div>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      {children}
    </div>
  );
};

// Main App Layout with Sidebar
const AppLayout = ({ children, title }) => (
  <>
    <main className="main-wrapper">
      <header className="page-header">
        <h1 className="bebas" style={{ fontSize: '32px', margin: 0 }}>{title}</h1>
        <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </header>
      <div className="content-body">
        {children}
      </div>
    </main>
  </>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/track/:orderId" element={<LiveTracking />} />
          <Route path="/track" element={<LiveTracking />} />

          {/* Customer Routes */}
          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <AppLayout title="My Orders">
                <CustomerDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/customer/new-order" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <AppLayout title="Place New Order">
                <CustomerOrderForm />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/customer/orders" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <AppLayout title="Order History">
                <CustomerOrders />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/customer/profile" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <AppLayout title="Account Settings">
                <ProfileSettings />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff/queue" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <AppLayout title="Order Queue">
                <StaffQueue />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/staff/walk-in" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <AppLayout title="Create Walk-in Order">
                <WalkInOrder />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/staff/profile" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <AppLayout title="Account Settings">
                <ProfileSettings />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Owner Routes */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AppLayout title="Business Insights">
                <OwnerDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/owner/staff-management" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AppLayout title="Staff Management">
                <StaffManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/owner/all-orders" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AppLayout title="All System Orders">
                <StaffQueue readOnly={true} />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/owner/reports" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AppLayout title="Reports">
                <OwnerReports />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/owner/profile" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <AppLayout title="Account Settings">
                <ProfileSettings />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;