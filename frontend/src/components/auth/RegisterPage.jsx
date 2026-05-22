import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerCustomer } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import '../../styles/responsive.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUserData } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must include at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must include at least one lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('Password must include at least one number.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerCustomer(
        formData.fullName,
        formData.contactNumber,
        formData.email,
        formData.password
      );

      if (result.success) {
        setUserData(result.userData);
        navigate('/customer/dashboard');
      } else {
        setLoading(false);
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An error occurred during registration');
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
          Create Account
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '1.25rem' }}>
          Join Sampings to place and track orders
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
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '10px', marginBottom: '3px' }}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="ex: Jose Mari Chan"
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
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '10px', marginBottom: '3px' }}>Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="+63 XXX XXX XXXX"
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
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '10px', marginBottom: '3px' }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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

          {/* Password with Eye Toggle */}
          <div className="form-group" style={{ marginBottom: '12px', position: 'relative' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '10px', marginBottom: '3px' }}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
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

          {/* Confirm Password with Eye Toggle */}
          <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '10px', marginBottom: '3px' }}>Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '28px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              {showConfirmPassword ? (
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
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--yellow)', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;