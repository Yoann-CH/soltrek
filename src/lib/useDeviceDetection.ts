import { useState, useEffect } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  isLandscape: boolean;
  isPortrait: boolean;
  isTouchDevice: boolean;
}

/**
 * Hook pour détecter le type d'appareil et l'orientation de l'écran
 * Utile pour adapter l'interface et le comportement en fonction de l'appareil
 */
export function useDeviceDetection(): DeviceInfo {
  // Valeurs par défaut (côté serveur)
  const defaultInfo: DeviceInfo = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: 'desktop',
    isLandscape: true,
    isPortrait: false,
    isTouchDevice: false
  };

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(defaultInfo);

  useEffect(() => {
    // Détection uniquement côté client
    if (typeof window === 'undefined') return;

    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      
      // Détection du type d'appareil basée sur la largeur d'écran
      let deviceType: DeviceType = 'desktop';
      let isMobile = false;
      let isTablet = false;
      let isDesktop = true;
      
      if (width < 768) {
        deviceType = 'mobile';
        isMobile = true;
        isTablet = false;
        isDesktop = false;
      } else if (width < 1024) {
        deviceType = 'tablet';
        isMobile = false;
        isTablet = true;
        isDesktop = false;
      }
      
      // Détection des capacités tactiles
      const isTouchDevice = 'ontouchstart' in window || 
                            navigator.maxTouchPoints > 0 || 
                            ('msMaxTouchPoints' in navigator && (navigator as unknown as {msMaxTouchPoints: number}).msMaxTouchPoints > 0);
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        isLandscape,
        isPortrait: !isLandscape,
        isTouchDevice
      });
    };
    
    // Vérification initiale
    checkDevice();
    
    // Mettre à jour lors des changements de taille d'écran
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return deviceInfo;
}

/**
 * Règle le comportement tactile pour un élément en fonction du type d'appareil
 */
export function getTouchProps(deviceInfo: DeviceInfo) {
  if (deviceInfo.isMobile || deviceInfo.isTablet) {
    return {
      style: { 
        touchAction: 'auto', 
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'auto'
      },
      className: 'mobile-optimized'
    };
  }
  
  return {};
}

export default useDeviceDetection; 