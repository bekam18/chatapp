import { useEffect, useRef } from 'react';

export const useMobileGestures = () => {
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  useEffect(() => {
    // Prevent pull-to-refresh on mobile
    const preventPullToRefresh = (e) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const isAtTop = window.scrollY === 0;
      const isPullingDown = touch.clientY > touchStartY.current;
      
      if (isAtTop && isPullingDown) {
        e.preventDefault();
      }
    };

    // Handle touch start
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    // Handle touch move
    const handleTouchMove = (e) => {
      preventPullToRefresh(e);
    };

    // Handle touch end for swipe gestures
    const handleTouchEnd = (e) => {
      touchEndY.current = e.changedTouches[0].clientY;
      handleSwipeGesture();
    };

    // Detect swipe gestures
    const handleSwipeGesture = () => {
      const swipeThreshold = 50;
      const swipeDistance = touchStartY.current - touchEndY.current;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          // Swipe up
          document.dispatchEvent(new CustomEvent('swipeUp'));
        } else {
          // Swipe down
          document.dispatchEvent(new CustomEvent('swipeDown'));
        }
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return {
    // Utility functions for mobile interactions
    vibrate: (pattern = [100]) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    },
    
    isStandalone: () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    },
    
    isMobile: () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  };
};