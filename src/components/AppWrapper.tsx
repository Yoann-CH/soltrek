import { useState, useEffect, ReactNode } from 'react';
import LoadingScreen from './LoadingScreen';
import { useLoading } from '../lib/loadingContext';

interface AppWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(true);
  const { setAppLoaded } = useLoading();

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

  return (
    <>
      {isLoadingScreenVisible && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      {children}
    </>
  );
} 