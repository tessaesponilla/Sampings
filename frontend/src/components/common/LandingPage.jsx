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
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }}></div>

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

        {/* Right Side - same as before, keep all the decorative elements */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
          perspective: '1000px',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)', top: '-20%', right: '-15%', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)', bottom: '-20%', left: '-5%', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: '-5%', left: '10%', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(0, 212, 255, 0.1)', bottom: '5%', right: '15%', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', top: '-15%', right: '10%', opacity: 0.15, transform: 'rotate(15deg)', zIndex: 1 }}>
            <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
            </svg>
          </div>
          <div style={{ position: 'absolute', bottom: '5%', left: '0%', opacity: 0.12, transform: 'rotate(-20deg)', zIndex: 1 }}>
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
              <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
              <path d="M2 12h20" />
            </svg>
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: i % 2 === 0 ? '12px' : '20px',
              height: i % 2 === 0 ? '12px' : '20px',
              borderRadius: '50%',
              background: i % 2 === 0 ? 'rgba(0, 212, 255, 0.15)' : 'rgba(124, 58, 237, 0.1)',
              top: `${15 + i * 15}%`,
              left: `${(i * 137) % 100}%`,
              filter: 'blur(1px)',
              zIndex: 1,
              opacity: 0.6
            }}></div>
          ))}
          <div style={{
            width: '380px',
            height: '460px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            transform: 'rotateY(-20deg) rotateX(10deg)',
            padding: '2.5rem',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            zIndex: 2,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px'
            }}>
                <img src={logo} alt="Sampings Logo" style={{ width: '45px', height: 'auto' }} />
                <span className="bebas" style={{ color: 'white', fontSize: '18px', letterSpacing: '0.1em', opacity: 0.8 }}>SAMPINGS</span>
            </div>
            <div style={{ height: '1px', width: '100%', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', color: 'var(--navy-ultra)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', opacity: 0.5 }}>ORD-2026</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 8px', background: 'var(--purple-bg)', color: 'var(--purple)', borderRadius: '20px' }}>IN PROGRESS</span>
               </div>
               <div style={{ height: '14px', width: '140px', background: 'var(--navy)', borderRadius: '4px', marginBottom: '1.5rem', opacity: 0.8 }}></div>
               <div style={{ height: '6px', width: '100%', background: '#f0f0f0', borderRadius: '10px', position: 'relative' }}>
                  <div style={{ height: '100%', width: '65%', background: 'var(--navy)', borderRadius: '10px' }}></div>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '600', opacity: 0.4 }}>Status</span>
                  <span style={{ fontSize: '9px', fontWeight: '700' }}>Production</span>
               </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', flex: 1, padding: '1.5rem' }}>
               <div style={{ height: '10px', width: '100px', background: 'white', opacity: 0.1, borderRadius: '4px', marginBottom: '10px' }}></div>
               <div style={{ height: '10px', width: '60px', background: 'white', opacity: 0.1, borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          right: '-10%',
          top: '0',
          width: '60%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.02))',
          pointerEvents: 'none',
          zIndex: 1
        }}></div>
      </main>
    </div>
  );
};

export default LandingPage;