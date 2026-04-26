import React, { useState } from 'react';
import logo from '../../assets/logo.png';

const RegisterPage = ({ onRegister, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    onRegister({ name: formData.name, role: 'Customer' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      {/* Background Mesh Texture */}
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
        {/* Logo Section */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src={logo} alt="Sampings Logo" style={{ height: '60px', width: 'auto' }} />
        </div>

        <div className="bebas" style={{ fontSize: '32px', color: 'white', textAlign: 'center', letterSpacing: '0.03em', marginBottom: '4px' }}>Create Account</div>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '2rem' }}>Join Sampings to place and track orders</p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Full Name</label>
              <input
                className="form-input"
                name="name"
                onChange={handleChange}
                placeholder="Juan dela Cruz"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Contact Number</label>
              <input
                className="form-input"
                name="phone"
                onChange={handleChange}
                placeholder="+63 9XX"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                required
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Email Address</label>
            <input
              className="form-input"
              name="email"
              type="email"
              onChange={handleChange}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                onChange={handleChange}
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
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Confirm</label>
              <input
                className="form-input"
                name="confirmPassword"
                type="password"
                onChange={handleChange}
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
          </div>
          <button type="submit" className="btn-primary" style={{
            width: '100%',
            padding: '12px',
            background: 'var(--yellow)',
            color: 'var(--navy-ultra)',
            border: 'none',
            fontWeight: '700',
            cursor: 'pointer'
          }}>Create Account →</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
          Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onBackToLogin(); }} style={{ color: 'var(--yellow)', fontWeight: '600', textDecoration: 'none' }}>Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
