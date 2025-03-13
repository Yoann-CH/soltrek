import { useState, useEffect, ReactNode } from 'react';
import LoadingScreen from './LoadingScreen';
import { useLoading } from '../lib/loadingContext';
import useDeviceDetection, { getTouchProps } from '../lib/useDeviceDetection';

interface AppWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(true);
  const { setAppLoaded } = useLoading();
  const deviceInfo = useDeviceDetection();
  
  // Appliquer les classes globales pour le défilement sur mobile
  useEffect(() => {
    if (deviceInfo.isMobile || deviceInfo.isTablet) {
      // Classes pour le corps de la page pour garantir le défilement normal
      document.body.classList.add('mobile-device');
      document.documentElement.classList.add('mobile-device');
      
      // Désactiver explicitement l'overscroll pour éviter les rebonds
      document.body.style.overscrollBehavior = 'auto';
      document.body.style.touchAction = 'auto';
      document.documentElement.style.touchAction = 'auto';
    }
    
    return () => {
      document.body.classList.remove('mobile-device');
      document.documentElement.classList.remove('mobile-device');
    };
  }, [deviceInfo.isMobile, deviceInfo.isTablet]);

  // Écouteur d'événement pour le rafraîchissement de la page
  useEffect(() => {
    // Afficher l'écran de chargement à chaque chargement initial
    setIsLoadingScreenVisible(true);

    // Gérer les événements de navigation et de rechargement
    const handleBeforeUnload = () => {
      // Stocke une indication que la page est en cours de rechargement
      sessionStorage.setItem('isReloading', 'true');
    };

    // Écouter l'événement beforeunload pour détecter les rafraîchissements
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Fonction appelée UNIQUEMENT par le LoadingScreen lorsqu'il a terminé son animation
  const handleLoadingComplete = () => {
    setIsLoadingScreenVisible(false);
    // Marquer l'application comme chargée pour déclencher les animations des composants
    setAppLoaded(true);
  };

  // Récupérer les props adaptés à l'appareil
  const touchProps = getTouchProps(deviceInfo);

  // Styles pour garantir le défilement sur mobile
  const touchActionStyles = {
    touchAction: 'auto',
    overscrollBehavior: 'auto' as const,
  } as React.CSSProperties;

  return (
    <div 
      className={`app-wrapper ${touchProps.className || ''} ${deviceInfo.isMobile ? 'mobile-device' : ''}`}
      style={touchActionStyles}
    >
      {isLoadingScreenVisible && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      {children}
    </div>
  );
} 