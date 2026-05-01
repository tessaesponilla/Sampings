import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUserData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        // Update context immediately
        setUserData(result.userData);

        // Navigate based on role
        const role = result.userData.role;
        if (role === 'customer') {
          navigate('/customer/dashboard');
        } else if (role === 'staff') {
          navigate('/staff/queue');
        } else if (role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setLoading(false);
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An error occurred during login');
    }
  };

  return (
    <div className="auth-wrapper" style={{
      background: 'linear-gradient(135deg, var(--navy-ultra) 0%, var(--navy) 100%)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }}></div>

      <div className="login-card" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        zIndex: 2,
        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src={logo} alt="Sampings Logo" style={{ height: '60px', width: 'auto' }} />
        </div>

        <div className="bebas" style={{ fontSize: '32px', color: 'white', textAlign: 'center', letterSpacing: '0.03em', marginBottom: '4px' }}>Welcome Back</div>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '2rem' }}>Sign in to your account</p>

        {error && (
          <div style={{
            background: 'rgba(255, 71, 87, 0.2)',
            border: '1px solid rgba(255, 71, 87, 0.4)',
            color: '#ff4757',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email Address</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-yellow" 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '16px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
          No account? <Link to="/register" style={{ color: 'var(--yellow)', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;