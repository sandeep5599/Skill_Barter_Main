// src/hooks/useResponsive.js
import { useState, useEffect } from 'react';

// Define breakpoints that can be imported across the application
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

/**
 * A custom hook that provides responsive viewport information
 * @returns {Object} Various boolean flags indicating viewport size
 */
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;
    
    // Handler to call on window resize
    const handleResize = () => {
      // Update window dimensions
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  // Return convenient boolean values based on breakpoints
  return {
    windowSize,
    isMobile: windowSize.width < breakpoints.md,
    isTablet: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isDesktop: windowSize.width >= breakpoints.lg,
    isLargeDesktop: windowSize.width >= breakpoints.xl,
    isSmallMobile: windowSize.width < breakpoints.sm,
  };
};

export default useResponsive;