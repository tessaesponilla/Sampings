import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { checkLoginAttempts, recordFailedAttempt, clearLoginAttempts } from '../../services/userService';
import logo from '../../assets/logo.png';
import '../../styles/responsive.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUserData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

  const lockStatus = await checkLoginAttempts(email);
  if (lockStatus.locked) {
    setError(`Account temporarily locked. Try again in ${lockStatus.remainingMin} minute(s).`);
    setLoading(false);
    return;
  }

  try {
    const result = await loginUser(email, password);

    if (result.success) {
      await clearLoginAttempts(email);  
      setFailedAttempts(0); 
      setUserData(result.userData);

      const role = result.userData.role;
      if (role === 'customer') navigate('/customer/dashboard');
      else if (role === 'staff') navigate('/staff/queue');
      else if (role === 'owner') navigate('/owner/dashboard');
      else navigate('/');
    } else {
      await recordFailedAttempt(email);  

      const updated = await checkLoginAttempts(email);
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      if (updated.locked) {
        setError('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        const remaining = 5 - newCount;
        setError(`${result.error || 'Login failed'} — ${remaining} attempt(s) remaining.`);
      }
      setLoading(false);
    }
  } catch (err) {
    await recordFailedAttempt(email);
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
      justifyContent: 'center',
      padding: '1rem'
    }}>
    
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.04,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        maxWidth: '380px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5)',
        zIndex: 2,
        padding: '1.5rem'
      }}>

        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '1rem',
            padding: 0
          }}
        >
          <span style={{ fontSize: '16px' }}>↩</span>
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img src={logo} alt="Sampings Logo" style={{ height: '40px', width: 'auto' }} />
        </div>

        <div className="bebas" style={{ fontSize: '24px', color: 'white', textAlign: 'center', letterSpacing: '0.03em', marginBottom: '2px' }}>
          Welcome Back
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '1.25rem' }}>
          Sign in to your account
        </p>

        {error && (
          <div style={{
            background: 'rgba(255, 71, 87, 0.2)',
            border: '1px solid rgba(255, 71, 87, 0.4)',
            color: '#ff4757',
            padding: '8px',
            borderRadius: '6px',
            marginBottom: '0.75rem',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '10px', marginBottom: '3px' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '13px'
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px', position: 'relative' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '10px', marginBottom: '3px' }}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 36px 8px 10px',
                borderRadius: '6px',
                fontSize: '13px'
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '28px',
                background: 'none',
                border: 'none',
                color: 'rgba(0, 0, 0, 0.6)',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          <button 
            type="submit" 
            className="btn-yellow" 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
          No account? <Link to="/register" style={{ color: 'var(--yellow)', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;