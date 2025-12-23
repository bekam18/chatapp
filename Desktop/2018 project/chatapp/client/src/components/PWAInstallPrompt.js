import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember user dismissed it (optional - could use localStorage)
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if user already dismissed or if already installed
  if (!showInstallPrompt || localStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="pwa-install-banner">
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          📱 Install ChatApp
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Add to your home screen for a better experience
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={handleInstallClick}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#667eea',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          Install
        </button>
        <button 
          onClick={handleDismiss}
          className="close-btn"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;