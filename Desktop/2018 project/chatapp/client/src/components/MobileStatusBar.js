import React, { useEffect, useState } from 'react';
import { useMobileGestures } from '../hooks/useMobileGestures';

const MobileStatusBar = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isMobile } = useMobileGestures();

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone === true;
      setIsStandalone(standalone);
    };

    // Get battery information (if supported)
    const getBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        } catch (error) {
          console.log('Battery API not supported');
        }
      }
    };

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    checkStandalone();
    getBatteryInfo();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show on mobile in standalone mode
  if (!isMobile() || !isStandalone) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'env(safe-area-inset-top, 24px)',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      fontSize: '12px',
      color: 'white',
      fontWeight: '500',
      zIndex: 9998
    }}>
      {/* Left side - Time */}
      <div>
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Right side - Status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Online/Offline indicator */}
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isOnline ? '#4CAF50' : '#F44336'
        }} />

        {/* Battery level (if available) */}
        {batteryLevel !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{batteryLevel}%</span>
            <div style={{
              width: '20px',
              height: '10px',
              border: '1px solid white',
              borderRadius: '2px',
              position: 'relative'
            }}>
              <div style={{
                width: `${batteryLevel}%`,
                height: '100%',
                background: batteryLevel > 20 ? '#4CAF50' : '#F44336',
                borderRadius: '1px'
              }} />
            </div>
          </div>
        )}

        {/* Signal strength indicator */}
        <div style={{ display: 'flex', alignItems: 'end', gap: '1px' }}>
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              style={{
                width: '3px',
                height: `${bar * 2 + 2}px`,
                background: 'white',
                opacity: isOnline ? 1 : 0.3
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileStatusBar;