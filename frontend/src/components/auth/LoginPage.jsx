import React, { useState } from 'react';
import logo from '../../assets/logo.png';

const LoginPage = ({ onLogin, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Customer');

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin({ name: email.split('@')[0] || 'Demo User', role });
  };

  return (
    <div className="auth-wrapper" style={{
      background: 'linear-gradient(135deg, var(--navy-ultra) 0%, var(--navy) 100%)',
      position: 'relative',
      overflow: 'hidden'
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
        {/* Logo Section */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src={logo} alt="Sampings Logo" style={{ height: '60px', width: 'auto' }} />
        </div>

        <div className="bebas" style={{ fontSize: '32px', color: 'white', textAlign: 'center', letterSpacing: '0.03em', marginBottom: '4px' }}>Welcome Back</div>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '2rem' }}>Sign in to your account</p>

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Sign in as</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <option value="Customer" style={{ color: 'black' }}>Customer</option>
              <option value="Staff" style={{ color: 'black' }}>Staff</option>
              <option value="Owner" style={{ color: 'black' }}>Owner</option>
            </select>
          </div>

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

          <button type="submit" className="btn-yellow" style={{ width: '100%', padding: '12px' }}>Sign In →</button>
        </form>

        {role === 'Customer' && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
            No account? <a href="#" onClick={(e) => { e.preventDefault(); onShowRegister(); }} style={{ color: 'var(--yellow)', fontWeight: '600', textDecoration: 'none' }}>Register here</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
