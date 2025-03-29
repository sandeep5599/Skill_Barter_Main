import { useState, useEffect } from 'react';
import { breakpoints } from '../styles/breakpoints';

const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
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
  }, []);

  return {
    isMobile: windowSize.width <= breakpoints.sm,
    isTablet: windowSize.width > breakpoints.sm && windowSize.width <= breakpoints.lg,
    isDesktop: windowSize.width > breakpoints.lg,
    isLargeScreen: windowSize.width > breakpoints.xl,
    windowSize,
    breakpoint: 
      windowSize.width <= breakpoints.sm ? 'sm' :
      windowSize.width <= breakpoints.md ? 'md' :
      windowSize.width <= breakpoints.lg ? 'lg' :
      windowSize.width <= breakpoints.xl ? 'xl' : 'xxl'
  };
};

export default useResponsive;
