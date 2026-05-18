import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container" style={{
      minHeight: '100vh',
      background: 'var(--navy-ultra)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8rem',
        background: 'linear-gradient(135deg, var(--navy-ultra) 0%, var(--navy) 100%)',
        position: 'relative'
      }}>
        {/* Subtle dot overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }}></div>

        {/* Right side decorative blue curves */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '60%',
          overflow: 'hidden',
          zIndex: 1,
          pointerEvents: 'none'
        }}>
          <svg
            viewBox="0 0 800 800"
            preserveAspectRatio="xMaxYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <linearGradient id="blueShade1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0F1D4B" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="blueShade2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E4C9A" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#14264B" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="blueShade3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1A3B7B" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0A1A3A" stopOpacity="0.8" />
              </linearGradient>
              {/* New lighter shade gradient */}
              <linearGradient id="blueShadeLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4A6FB5" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2A4B8A" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Original curves */}
            <path d="M 800 0 Q 600 150, 450 300 T 300 700 L 800 800 Z" fill="url(#blueShade1)" />
            <path d="M 800 0 Q 500 250, 350 400 T 250 750 L 800 800 Z" fill="url(#blueShade2)" />
            <path d="M 800 200 Q 650 350, 500 500 T 400 800 L 800 800 Z" fill="url(#blueShade3)" />

            {/* New lighter curve – same angle, placed next to the others */}
            <path d="M 800 0 Q 700 100, 600 250 T 450 600 L 800 800 Z" fill="url(#blueShadeLight)" />
          </svg>
        </div>

        {/* Left side content */}
        <div style={{ maxWidth: '650px', zIndex: 3 }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            borderRadius: '30px',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '1.5rem',
            letterSpacing: '0.1em',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            EST. 2026 • ILOILO CITY
          </div>

          <h1 className="bebas" style={{
            fontSize: '100px',
            lineHeight: '0.85',
            color: 'white',
            marginBottom: '1.5rem',
            textTransform: 'uppercase'
          }}>
            SAMPINGS<br />
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>SPORTSWEAR</span>
          </h1>

          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
            maxWidth: '500px'
          }}>
            Order now and track its status real-time.
          </p>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              className="btn-yellow"
              style={{
                padding: '16px 42px',
                fontSize: '16px',
                borderRadius: '12px'
              }}
              onClick={() => navigate('/login')}
            >
              Get Started
            </button>
            <button
              className="btn-outline"
              style={{
                padding: '16px 42px',
                fontSize: '16px',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: '600',
                background: 'transparent',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/track/guest')}
            >
              Track Order
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;