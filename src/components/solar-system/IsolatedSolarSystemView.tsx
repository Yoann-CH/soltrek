import { Suspense, useCallback, useEffect } from 'react';
import SolarSystemView from './SolarSystemView';

interface IsolatedSolarSystemViewProps {
  onLoaded?: () => void;
  onClose: () => void;
  quality: 'low' | 'medium' | 'high';
}

/**
 * Composant optimisé pour afficher uniquement la vue 3D du système solaire
 * en mode isolé, sans dépendances ou éléments DOM inutiles
 */
export function IsolatedSolarSystemView({ 
  onLoaded, 
  onClose, 
  quality 
}: IsolatedSolarSystemViewProps) {
  // Préparation des éléments pour la performance optimale
  useEffect(() => {
    // Désactiver temporairement tous les animations et transitions
    // qui pourraient s'exécuter en arrière-plan
    document.documentElement.classList.add('disable-animations');
    
    // Mettre en pause tous les médias en arrière-plan
    document.querySelectorAll('video, audio').forEach(media => {
      if (media instanceof HTMLMediaElement && !media.paused) {
        media.pause();
      }
    });
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
    
    // Nettoyer lors du démontage
    return () => {
      // Réactiver les animations
      document.documentElement.classList.remove('disable-animations');
      // Restaurer le défilement
      document.body.style.overflow = '';
    };
  }, []);
  
  // Ajout d'un événement d'échap pour fermer la vue
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);
  
  // Fonction pour marquer le composant comme chargé
  const handleLoaded = useCallback(() => {
    if (onLoaded) onLoaded();
  }, [onLoaded]);
  
  // Force le mode plein écran pour optimiser la performance
  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      {/* En-tête avec informations sur la qualité et bouton de fermeture */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md py-2.5 px-3 xs:px-4 sm:px-5 border-b border-gray-700/70 shadow-lg">
        <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-2">
          <div className="flex items-center flex-wrap gap-1.5 xs:gap-2">
            <span className="text-white text-[10px] xs:text-xs sm:text-sm font-medium whitespace-nowrap">Mode d'affichage :</span>
            <span className={`px-2 py-0.5 xs:py-1 rounded text-[10px] xs:text-xs font-medium ${
              quality === 'low' 
                ? 'bg-blue-600/40 text-blue-200' 
                : quality === 'medium'
                  ? 'bg-blue-500/40 text-blue-200'
                  : 'bg-purple-500/40 text-purple-200'
            }`}>
              {quality === 'low' && "Basse qualité"}
              {quality === 'medium' && "Qualité moyenne"}
              {quality === 'high' && "Haute qualité"}
            </span>
          </div>
          
          <button 
            onClick={onClose}
            className="cursor-pointer ml-auto px-2 xs:px-3 py-1 xs:py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white rounded-lg shadow-md transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 flex items-center gap-1 xs:gap-2 text-[10px] xs:text-xs sm:text-sm"
            aria-label="Quitter la vue 3D"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="whitespace-nowrap">Quitter la vue 3D</span>
          </button>
        </div>
      </div>
      
      {/* Corps principal avec le SolarSystemView en mode plein écran */}
      <div className="flex-grow flex items-center justify-center">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-200">Chargement du système solaire...</p>
            </div>
          </div>
        }>
          <SolarSystemView 
            onLoaded={handleLoaded} 
            isVisible={true} 
            quality={quality} 
            isFullscreen={true}
          />
        </Suspense>
      </div>
    </div>
  );
} 