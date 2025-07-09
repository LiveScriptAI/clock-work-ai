import { useState, useEffect } from 'react';

export type DeviceBreakpoint = 'mobile' | 'tablet' | 'desktop';

export function useDeviceBreakpoint(): DeviceBreakpoint {
  const [breakpoint, setBreakpoint] = useState<DeviceBreakpoint>('mobile');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBreakpoint('mobile');
      } else if (width >= 640 && width <= 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}