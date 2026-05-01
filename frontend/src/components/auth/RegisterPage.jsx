import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerCustomer } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

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

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
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
        // Update context immediately
        setUserData(result.userData);
        // Redirect to customer dashboard
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
        maxWidth: '450px',
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

        <div className="bebas" style={{ fontSize: '32px', color: 'white', textAlign: 'center', letterSpacing: '0.03em', marginBottom: '4px' }}>Create Account</div>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '2rem' }}>Join Sampings to place and track orders</p>

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
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Full Name</label>
            <input
              className="form-input"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email Address</label>
            <input
              className="form-input"
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
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Contact Number</label>
            <input
              className="form-input"
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Confirm Password</label>
            <input
              className="form-input"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px'
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
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--yellow)', fontWeight: '600', textDecoration: 'none' }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;