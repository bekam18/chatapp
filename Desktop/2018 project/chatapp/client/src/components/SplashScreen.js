import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: isVisible ? 'none' : 'fadeOut 0.3s ease-out forwards'
    }}>
      {/* App Logo */}
      <div style={{
        width: '120px',
        height: '120px',
        background: 'white',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <div style={{
          fontSize: '48px',
          color: '#667eea'
        }}>
          💬
        </div>
      </div>

      {/* App Name */}
      <h1 style={{
        color: 'white',
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        ChatApp
      </h1>

      {/* Tagline */}
      <p style={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '16px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        Real-Time Messaging
      </p>

      {/* Loading Animation */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%',
              animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;