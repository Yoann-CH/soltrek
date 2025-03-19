import { LazyMotion, domAnimation, useReducedMotion } from 'framer-motion';
import PlanetCard from '../components/PlanetCard';
import { useState, useEffect, useCallback, useRef, lazy, Suspense, useMemo } from 'react';
import { fetchAllPlanets, fetchPlanetNews, SpaceNewsArticle } from '../lib/api';
import { createPortal } from 'react-dom';
// Utilisation du lazy loading pour les composants 3D
const IsolatedSolarSystemView = lazy(() => import('../components/solar-system/IsolatedSolarSystemView').then(mod => ({ default: mod.IsolatedSolarSystemView })));
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
// Utilisation du lazy loading pour le SpaceBackground
const SpaceBackground = lazy(() => import('../components/SpaceBackground'));
import ScrollAnimationContainer from '../components/ScrollAnimationContainer';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composant d'image optimisée avec chargement progressif
const OptimizedImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [imageSrc, setImageSrc] = useState('/assets/default.webp');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    // Réinitialiser l'état quand la source change
    setImageLoaded(false);
    setHasError(false);
    setImageSrc('/assets/default.webp');
    
    // Observer quand l'image entre dans le viewport
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // On crée une nouvelle image pour précharger
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setImageSrc(src);
          setImageLoaded(true);
        };
        img.onerror = () => {
          setHasError(true);
          setImageSrc('/assets/default.webp');
        };
        
        // Arrêter d'observer une fois détecté
        if (imgRef.current) observer.unobserve(imgRef.current);
      }
    }, {
      rootMargin: '300px 0px', // Précharger quand on est à 300px de l'image
      threshold: 0.01
    });
    
    if (imgRef.current) observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, [src]);

  return (
    <div className="relative overflow-hidden bg-gray-800 aspect-video">
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className || ''} transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-80'}`}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImageSrc('/assets/default.webp');
          }
        }}
      />
      {!imageLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/40">
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-400 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

// Interfaces pour les APIs du navigateur non standardisées
interface FullscreenDocument extends Document {
  mozFullScreenElement?: Element;
  webkitFullscreenElement?: Element;
  msFullscreenElement?: Element;
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface FullscreenElement extends HTMLElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

// Liste des planètes du système solaire
const planetNames = [
  'Mercure',
  'Vénus',
  'Terre',
  'Mars',
  'Jupiter',
  'Saturne',
  'Uranus',
  'Neptune'
];

// Composant pour charger conditionnellement la vue 3D
function LazySystemView() {
  const containerRef = useRef(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Créer un élément pour le portail lors du montage du composant
  useEffect(() => {
    // On crée un élément div qui sera notre portail pour la vue 3D isolée
    const portalElement = document.createElement('div');
    portalElement.id = 'solar-system-portal';
    portalElement.style.position = 'fixed';
    portalElement.style.inset = '0';
    portalElement.style.zIndex = '9999';
    portalElement.style.backgroundColor = 'black';
    portalElement.style.display = 'none';
    document.body.appendChild(portalElement);
    
    portalRef.current = portalElement;
    
    return () => {
      // Nettoyage du portail lors du démontage
      if (portalElement.parentNode) {
        document.body.removeChild(portalElement);
      }
    };
  }, []);

  // Afficher ou masquer le portail en fonction de l'état enabled
  useEffect(() => {
    if (portalRef.current) {
      portalRef.current.style.display = isEnabled ? 'block' : 'none';
    }
  }, [isEnabled]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si le composant devient visible
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (!entry.isIntersecting) {
          // On désactive le rendu lorsque le composant n'est plus visible
          setIsVisible(false);
        }
      },
      {
        rootMargin: '200px 0px', // Préchargement quand on s'approche à 200px
        threshold: 0.1 // Déclencher dès que 10% du conteneur est visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isVisible]);

  // Écouteur d'événements pour détecter les changements d'état du mode plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as FullscreenDocument;
      const isCurrentlyFullscreen = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Si on quitte le mode plein écran via la touche Échap, on désactive aussi la vue 3D
      if (!isCurrentlyFullscreen && isEnabled) {
        setIsEnabled(false);
        try {
          localStorage.removeItem('solar3dViewEnabled');
        } catch (e) {
          console.error('Impossible de supprimer la préférence:', e);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isEnabled]);

  // Réutiliser la variable hasLoaded pour afficher un message différent lorsque la vue a été chargée
  const getLoadingMessage = useCallback(() => {
    return hasLoaded 
      ? "Vue 3D prête à être affichée" 
      : "Préparation de la vue 3D...";
  }, [hasLoaded]);

  // Fonction pour marquer le composant comme chargé
  const handleLoaded = useCallback(() => {
    setHasLoaded(true);
  }, []);

  // Fonction pour entrer en mode plein écran
  const requestFullscreen = useCallback((element: HTMLElement) => {
    const fsElement = element as FullscreenElement;
    
    if (fsElement.requestFullscreen) {
      fsElement.requestFullscreen();
    } else if (fsElement.mozRequestFullScreen) { /* Firefox */
      fsElement.mozRequestFullScreen();
    } else if (fsElement.webkitRequestFullscreen) { /* Chrome, Safari et Opera */
      fsElement.webkitRequestFullscreen();
    } else if (fsElement.msRequestFullscreen) { /* IE/Edge */
      fsElement.msRequestFullscreen();
    }
  }, []);

  // Fonction pour quitter le mode plein écran
  const exitFullscreen = useCallback(() => {
    const doc = document as FullscreenDocument;
    
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.mozCancelFullScreen) { /* Firefox */
      doc.mozCancelFullScreen();
    } else if (doc.webkitExitFullscreen) { /* Chrome, Safari et Opera */
      doc.webkitExitFullscreen();
    } else if (doc.msExitFullscreen) { /* IE/Edge */
      doc.msExitFullscreen();
    }
  }, []);

  // Fonction pour activer la vue 3D et passer en plein écran
  const handleEnableView = useCallback(() => {
    setIsEnabled(true);
    
    // Passage en plein écran (optionnel en mode portail)
    if (portalRef.current) {
      requestFullscreen(portalRef.current);
    }
    
    // On peut stocker cette préférence dans le localStorage pour les visites ultérieures
    try {
      localStorage.setItem('solar3dViewEnabled', 'true');
      // Sauvegarder aussi la qualité sélectionnée
      localStorage.setItem('solar3dViewQuality', quality);
    } catch (e) {
      console.error('Impossible de sauvegarder la préférence:', e);
    }
  }, [quality, requestFullscreen]);
  
  // Fonction pour désactiver la vue 3D et quitter le plein écran
  const handleDisableView = useCallback(() => {
    setIsEnabled(false);
    
    // Quitter le mode plein écran
    if (isFullscreen) {
      exitFullscreen();
    }
    
    // Supprimer la préférence du localStorage
    try {
      localStorage.removeItem('solar3dViewEnabled');
    } catch (e) {
      console.error('Impossible de supprimer la préférence:', e);
    }
    // Optionnel: Réinitialiser l'état de chargement
    setHasLoaded(false);
  }, [exitFullscreen, isFullscreen]);

  // Fonction pour changer la qualité du rendu (avant activation)
  const handleQualityChange = useCallback((newQuality: 'low' | 'medium' | 'high') => {
    setQuality(newQuality);
    // Sauvegarder la préférence
    try {
      localStorage.setItem('solar3dViewQuality', newQuality);
    } catch (e) {
      console.error('Impossible de sauvegarder la préférence de qualité:', e);
    }
  }, []);

  // Vérifier si l'utilisateur a déjà activé la vue 3D lors d'une visite précédente
  useEffect(() => {
    try {
      const previouslyEnabled = localStorage.getItem('solar3dViewEnabled') === 'true';
      if (previouslyEnabled) {
        setIsEnabled(true);
      }
      
      // Récupérer la qualité précédemment choisie
      const savedQuality = localStorage.getItem('solar3dViewQuality') as 'low' | 'medium' | 'high';
      if (savedQuality && ['low', 'medium', 'high'].includes(savedQuality)) {
        setQuality(savedQuality);
      }
    } catch (e) {
      console.error('Impossible de récupérer les préférences:', e);
    }
  }, []);

  // Définir le contenu du portail - uniquement la vue 3D isolée avec le nouveau composant optimisé
  const portalContent = isEnabled && portalRef.current && (
    createPortal(
      <Suspense fallback={
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-200 dark:text-gray-300">Chargement de la vue 3D...</p>
          </div>
        </div>
      }>
        <IsolatedSolarSystemView 
          onLoaded={handleLoaded}
          onClose={handleDisableView}
          quality={quality}
        />
      </Suspense>,
      portalRef.current
    )
  );

  return (
    <div className="space-y-4">
      {/* Le portail contenant la vue 3D isolée */}
      {portalContent}
    
      {/* Le conteneur dans la page principale - affiché uniquement quand la vue 3D n'est pas activée */}
      <div 
        ref={containerRef} 
        className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-4 overflow-hidden min-h-[400px] shadow-xl"
      >
        {isVisible && !isEnabled ? (
          // Si visible mais pas encore activé, montrer le bouton d'activation
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                  <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                  <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                  <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                  <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" />
                  <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Vue 3D interactive</h3>
              <p className="text-gray-300 mb-5">Explorez le système solaire en 3D avec une expérience immersive. Cette vue nécessite des ressources graphiques supplémentaires.</p>
              
              {/* Sélecteur de qualité (maintenu uniquement à l'initialisation) */}
              <div className="flex flex-col items-center mb-5">
                <p className="text-sm text-gray-300 mb-2">Sélectionnez la qualité graphique :</p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => handleQualityChange('low')}
                    className={`cursor-pointer px-4 py-2 text-sm rounded-lg ${quality === 'low' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'} focus:outline-none`}
                  >
                    Basse
                  </button>
                  <button 
                    onClick={() => handleQualityChange('medium')}
                    className={`cursor-pointer px-4 py-2 text-sm rounded-lg ${quality === 'medium' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'} focus:outline-none`}
                  >
                    Moyenne
                  </button>
                  <button 
                    onClick={() => handleQualityChange('high')}
                    className={`cursor-pointer px-4 py-2 text-sm rounded-lg ${quality === 'high' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'} focus:outline-none`}
                  >
                    Haute
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {quality === 'low' && "Recommandée pour les appareils avec des ressources limitées."}
                  {quality === 'medium' && "Bon équilibre entre performances et qualité visuelle."}
                  {quality === 'high' && "Meilleure qualité visuelle. Nécessite une carte graphique performante."}
                </div>
              </div>
              
              <button 
                onClick={handleEnableView}
                className="cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                Activer la vue 3D
              </button>
              <p className="text-xs text-gray-400 mt-4">Vous pourrez désactiver cette vue à tout moment.</p>
            </div>
          </div>
        ) : (
          // Si pas visible ou si la vue 3D est activée (dans ce cas on montre un message)
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              {isEnabled ? (
                <>
                  <div className="bg-blue-600/30 p-4 rounded-xl mb-4">
                    <svg className="w-10 h-10 mx-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="mt-2 text-gray-200 dark:text-gray-300 text-lg">Vue 3D active en plein écran</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-200 dark:text-gray-300">{getLoadingMessage()}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fonction utilitaire pour formater la date de manière sécurisée (reprise de PlanetNews)
const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return 'Date non disponible';
    }
    return format(date, 'dd MMMM yyyy', { locale: fr });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Date non disponible';
  }
};

// Style pour l'animation wave du skeleton
const skeletonWaveStyle = `
  @keyframes skeletonWave {
    0% {
      transform: translateX(-100%);
    }
    50%, 100% {
      transform: translateX(100%);
    }
  }
  
  .skeleton-wave {
    animation: skeletonWave 1.5s infinite;
  }
`;

// Composant de skeleton pour les cartes d'actualités
const NewsCardSkeleton = () => (
  <div className="bg-white/30 dark:bg-gray-800/30 rounded-lg overflow-hidden shadow-lg shadow-blue-500/10 dark:shadow-blue-500/10 backdrop-blur-sm">
    <div className="aspect-video bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
    </div>
    <div className="p-3 sm:p-4 space-y-3">
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-3/4 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
      </div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-1/2 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
        </div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
        </div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full w-2/3 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function ExplorePage() {
  // État pour gérer le chargement
  const [isLoading, setIsLoading] = useState(() => {
    // Vérifier si l'utilisateur a déjà visité cette page
    const hasVisitedExplore = localStorage.getItem('hasVisitedExplore') === 'true';
    // Si l'utilisateur a déjà visité cette page, on ne montre pas l'animation skeleton
    return !hasVisitedExplore;
  });
  const [apiError, setApiError] = useState<string | null>(null);
  
  // État pour les actualités spatiales
  const [spaceNews, setSpaceNews] = useState<SpaceNewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<Error | null>(null);
  
  // Détection des préférences d'animation réduites
  const prefersReducedMotion = useReducedMotion();
  
  // Détection des appareils à faible performance - une approche simple basée sur l'UA
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  
  // Détection des appareils à faible performance
  useEffect(() => {
    // Test simple pour les appareils mobiles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Test de performance basique
    const testPerformance = () => {
      const start = performance.now();
      
      // Effectuer une opération coûteuse pour tester les performances
      // On utilise une fonction IIFE pour éviter les avertissements de variables non utilisées
      (function() {
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i);
        }
        // Pour éviter que le compilateur n'optimise et supprime la boucle, on retourne result
        // même si on ne l'utilise pas en dehors de cette fonction
        return result;
      })();
      
      const end = performance.now();
      // Si le calcul prend plus de 50ms, considérer l'appareil comme à faible performance
      return (end - start) > 50;
    };
    
    // Considérer les appareils mobiles ou ceux qui échouent au test de performance comme à faible performance
    const lowEndResult = isMobile || testPerformance();
    setIsLowEndDevice(lowEndResult);
    
    // Stocker la préférence dans le localStorage pour les futures visites
    try {
      localStorage.setItem('isLowEndDevice', lowEndResult.toString());
    } catch (e) {
      console.error('Impossible de sauvegarder la préférence de performance', e);
    }
  }, []);

  // Fonction pour récupérer les planètes depuis l'API
  useEffect(() => {
    // Utilisation d'AbortController pour éviter les memory leaks
    const controller = new AbortController();
    
    const loadPlanets = async () => {
      try {
        await fetchAllPlanets();
        // Pas besoin de stocker les données car nous n'affichons plus le tableau
      } catch (error) {
        console.error("Erreur lors du chargement des planètes:", error);
        setApiError("Impossible de récupérer les données des planètes. Affichage des informations statiques.");
      }
    };

    loadPlanets();
    
    return () => {
      controller.abort();
    };
  }, []);
  
  // Simuler un temps de chargement pour le first load
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        // Marquer que l'utilisateur a visité cette page
        localStorage.setItem('hasVisitedExplore', 'true');
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Charger les actualités spatiales générales
  useEffect(() => {
    const controller = new AbortController();
    
    const loadNews = async () => {
      try {
        setNewsLoading(true);
        // Recherche d'actualités avec le terme "solar system" pour obtenir des actualités générales
        const data = await fetchPlanetNews("");
        setSpaceNews(data);
        setNewsLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des actualités:", err);
        setNewsError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        setNewsLoading(false);
      }
    };

    loadNews();
    
    return () => {
      controller.abort();
    };
  }, []);
  
  // Injection du style pour l'animation wave
  useEffect(() => {
    // Vérifier si le style est déjà présent
    if (!document.getElementById('skeleton-wave-style')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'skeleton-wave-style';
      styleElement.innerHTML = skeletonWaveStyle;
      document.head.appendChild(styleElement);

      // Nettoyage lors du démontage
      return () => {
        const styleToRemove = document.getElementById('skeleton-wave-style');
        if (styleToRemove) {
          document.head.removeChild(styleToRemove);
        }
      };
    }
  }, []);
  
  // Modifier la partie LoadingSkeleton - remplacer la section des planètes
  const LoadingSkeleton = useCallback(() => (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-6 px-3 sm:py-8 sm:px-6 md:py-10 transition-colors bg-cover bg-fixed">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-white/50 dark:from-blue-900/10 dark:to-black/80 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="w-36 sm:w-48 h-8 sm:h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-md mb-4 sm:mb-8 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
        </div>
        <div className="w-full h-5 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-md mb-8 sm:mb-12 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
        </div>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-gray-200/40 dark:border-gray-700/40 relative overflow-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full mx-auto mb-3 sm:mb-4 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
              </div>
              <div className="w-3/4 h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full mx-auto mb-2 sm:mb-3 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
              </div>
              <div className="w-full h-2 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full mb-1 sm:mb-2 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
              </div>
              <div className="w-5/6 h-2 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-blue-500/10 to-transparent skeleton-wave"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ), []);
  
  // Calculer les paramètres d'animation optimisés en fonction des préférences et des capacités de l'appareil
  const optimizedAnimationProps = useMemo(() => {
    // Si l'utilisateur préfère les animations réduites ou utilise un appareil à faible performance
    if (prefersReducedMotion || isLowEndDevice) {
      return {
        starCount: 40, // Nombre réduit d'étoiles
        planetCount: 0, // Pas de planètes en arrière-plan
        enableParallax: false, // Désactiver le parallaxe
        showNebulae: false, // Pas de nébuleuses
        triggerOnce: true, // Ne déclencher les animations qu'une seule fois
        duration: 0.2, // Animations plus rapides
        delay: 0, // Pas de délai
        disableStaggering: true, // Désactiver l'animation en cascade
        gpuRender: true, // Forcer le rendu GPU
        force3d: true, // Forcer les transformations 3D pour utiliser l'accélération GPU
        useSimpleAnimations: true // Utiliser des animations simplifiées
      };
    }
    
    // Configuration standard pour les appareils performants
    return {
      starCount: 150,
      planetCount: 5,
      enableParallax: true,
      showNebulae: true,
      triggerOnce: true,
      duration: 0.4,
      delay: 100,
      disableStaggering: false,
      gpuRender: true,
      force3d: true,
      useSimpleAnimations: false
    };
  }, [prefersReducedMotion, isLowEndDevice]);
  
  // Afficher un squelette de chargement pendant le chargement initial
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  // Version sans animations pour les préférences d'animation réduites ou appareils à faible performance
  if (prefersReducedMotion || isLowEndDevice) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black dark:bg-black transition-colors bg-cover bg-fixed">
        {/* Fond spatial avec paramètres réduits */}
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <SpaceBackground 
            starCount={optimizedAnimationProps.starCount} 
            planetCount={optimizedAnimationProps.planetCount} 
            enableParallax={optimizedAnimationProps.enableParallax} 
            showNebulae={optimizedAnimationProps.showNebulae} 
          />
        </Suspense>
        
        <Header pageName="explorer" />
        
        <main className="max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6 relative z-10">
          {/* Section titre */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent leading-relaxed pb-1">
              Explorer le Système Solaire
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-200 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed pb-1">
              Découvrez les planètes du système solaire et leurs caractéristiques uniques
            </p>
            
            {apiError && (
              <div className="mt-4 p-3 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/60 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-300 rounded-md backdrop-blur-sm">
                {apiError}
              </div>
            )}
          </div>
          
          {/* Section vue 3D */}
          <div className="mb-10 sm:mb-16 md:mb-20 relative">
            <div className="relative">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full filter blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full filter blur-3xl" />
              
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
                  Vue 3D Interactive
                </h2>
                <div className="h-px w-full max-w-lg mx-auto mt-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              </div>
            </div>
            
            <LazySystemView />
          </div>
          
          {/* Section planètes */}
          <div className="relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full filter blur-3xl" />
            
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
                Planètes du Système Solaire
              </h2>
              <div className="h-px w-full max-w-lg mx-auto mt-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 auto-rows-fr">
              {planetNames.map((name, index) => (
                <div key={name} className="h-full">
                  <PlanetCard name={name} index={index} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Section actualités */}
          <div className="relative mt-16 mb-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full filter blur-3xl" />
            
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
                Actualités Astronomiques
              </h2>
              <div className="h-px w-full max-w-lg mx-auto mt-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </div>
            
            {/* Rendu conditionnel des actualités */}
            {newsLoading ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            ) : newsError ? (
              <div className="bg-red-100/20 dark:bg-red-900/20 border border-red-200/30 dark:border-red-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm shadow-lg shadow-red-500/5">
                <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Erreur de communication</h2>
                <p className="text-sm sm:text-base text-gray-200 dark:text-gray-300">
                  Impossible de récupérer les actualités pour le moment. Veuillez réessayer plus tard.
                </p>
              </div>
            ) : spaceNews.length === 0 ? (
              <div className="bg-blue-100/20 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm shadow-lg shadow-blue-500/5">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">Aucune actualité récente</h2>
                <p className="text-sm sm:text-base text-gray-200 dark:text-gray-300">
                  Aucune actualité récente n'a été trouvée pour le système solaire.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                    Source : Spaceflight News API
                    <span className="px-2 py-1 bg-blue-100/20 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded">
                      Articles en anglais
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {spaceNews.slice(0, 6).map((article) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-white/30 dark:bg-gray-800/30 rounded-lg overflow-hidden hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 cursor-pointer shadow-lg shadow-blue-500/5 dark:shadow-blue-500/5 backdrop-blur-sm h-full"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <OptimizedImage
                          src={article.image_url || '/assets/default.webp'}
                          alt={article.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-2 left-3 right-3">
                          <p className="text-xs sm:text-sm text-gray-200">
                            {formatDate(article.published_at)}
                          </p>
                          <p className="text-xs text-gray-300">{article.news_site}</p>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-200 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 line-clamp-2 sm:line-clamp-3">
                          {article.summary}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
        
        <Footer />
        <ScrollToTop />
      </div>
    );
  }
  
  // Utiliser m au lieu de motion pour la plupart des composants pour réduire le bundle size
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen relative overflow-hidden bg-black dark:bg-black transition-colors bg-cover bg-fixed"
           style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
        {/* Fond spatial ajouté ici */}
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <SpaceBackground 
            starCount={optimizedAnimationProps.starCount} 
            planetCount={optimizedAnimationProps.planetCount} 
            enableParallax={optimizedAnimationProps.enableParallax} 
            showNebulae={optimizedAnimationProps.showNebulae} 
          />
        </Suspense>
        
        <Header pageName="explorer" />
        
        <main className="max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6 relative z-10">
          {/* Section titre avec animation staggered */}
          <ScrollAnimationContainer
            type="staggered"
            className="text-center mb-8 sm:mb-12"
            style={{ willChange: 'transform' }}
            triggerOnce={optimizedAnimationProps.triggerOnce}
            threshold={0.2}
          >
            <ScrollAnimationContainer 
              type={optimizedAnimationProps.useSimpleAnimations ? "fadeIn" : "fadeDown"}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent leading-relaxed pb-1"
              delay={optimizedAnimationProps.delay}
              triggerOnce={optimizedAnimationProps.triggerOnce}
              disableOnLowEnd={true}
              force3d={optimizedAnimationProps.force3d}
              gpuRender={optimizedAnimationProps.gpuRender}
              duration={optimizedAnimationProps.duration}
            >
              Explorer le Système Solaire
            </ScrollAnimationContainer>
            
            <ScrollAnimationContainer 
              type={optimizedAnimationProps.useSimpleAnimations ? "fadeIn" : "fadeUp"}
              className="text-base sm:text-lg md:text-xl text-gray-200 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed pb-1"
              delay={optimizedAnimationProps.delay + 100}
              triggerOnce={optimizedAnimationProps.triggerOnce}
              disableOnLowEnd={true}
              force3d={optimizedAnimationProps.force3d}
              gpuRender={optimizedAnimationProps.gpuRender}
              duration={optimizedAnimationProps.duration}
            >
              Découvrez les planètes du système solaire et leurs caractéristiques uniques
            </ScrollAnimationContainer>
            
            {apiError && (
              <ScrollAnimationContainer 
                type={optimizedAnimationProps.useSimpleAnimations ? "fadeIn" : "fadeUp"}
                className="mt-4 p-3 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/60 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-300 rounded-md backdrop-blur-sm"
                delay={optimizedAnimationProps.delay + 200}
                triggerOnce={optimizedAnimationProps.triggerOnce}
                disableOnLowEnd={true}
                force3d={optimizedAnimationProps.force3d}
                gpuRender={optimizedAnimationProps.gpuRender}
                duration={optimizedAnimationProps.duration}
              >
                {apiError}
              </ScrollAnimationContainer>
            )}
          </ScrollAnimationContainer>
          
          {/* Section vue 3D avec animation de défilement */}
          <ScrollAnimationContainer
            type={optimizedAnimationProps.useSimpleAnimations ? "fadeIn" : "fadeUp"}
            className="mb-10 sm:mb-16 md:mb-20 relative"
            triggerOnce={optimizedAnimationProps.triggerOnce}
            exitAnimation={false}
            threshold={0.1}
            rootMargin="100px 0px"
            disableOnLowEnd={true}
            force3d={optimizedAnimationProps.force3d}
            gpuRender={optimizedAnimationProps.gpuRender}
            duration={optimizedAnimationProps.duration}
          >
            <div className="relative">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full filter blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full filter blur-3xl" />
              
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
                  Vue 3D Interactive
                </h2>
                <div className="h-px w-full max-w-lg mx-auto mt-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              </div>
            </div>
            
            <LazySystemView />
          </ScrollAnimationContainer>
          
          {/* Section planètes avec animation au scroll */}
          <ScrollAnimationContainer
            type={optimizedAnimationProps.useSimpleAnimations ? "fadeIn" : "fadeUp"}
            className="relative"
            triggerOnce={optimizedAnimationProps.triggerOnce}
            exitAnimation={false}
            threshold={0.05}
            rootMargin="100px 0px"
            disableOnLowEnd={true}
            force3d={optimizedAnimationProps.force3d}
            gpuRender={optimizedAnimationProps.gpuRender}
            duration={optimizedAnimationProps.duration}
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full filter blur-3xl" />
            
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
                Planètes du Système Solaire
              </h2>
              <div className="h-px w-full max-w-lg mx-auto mt-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 auto-rows-fr">
              {planetNames.map((name, index) => (
                <ScrollAnimationContainer
                  key={name}
                  type={optimizedAnimationProps.useSimpleAnimations ? "fadeIn" : "scale"}
                  className="h-full"
                  delay={Math.min(index * 20, 100)} // Limite le délai maximum à 100ms
                  triggerOnce={optimizedAnimationProps.triggerOnce}
                  exitAnimation={false}
                  threshold={0.05}
                  rootMargin="200px 0px"
                  duration={optimizedAnimationProps.duration}
                  disableOnLowEnd={true}
                  force3d={optimizedAnimationProps.force3d}
                  gpuRender={optimizedAnimationProps.gpuRender}
                >
                  <PlanetCard name={name} index={index} />
                </ScrollAnimationContainer>
              ))}
            </div>
          </ScrollAnimationContainer>
          
          {/* Nouvelle section d'actualités spatiales */}
          <ScrollAnimationContainer
            type={optimizedAnimationProps.useSimpleAnimations ? "fadeIn" : "fadeUp"}
            className="relative mt-16 mb-10"
            triggerOnce={optimizedAnimationProps.triggerOnce}
            exitAnimation={false}
            threshold={0.05}
            rootMargin="150px 0px"
            disableOnLowEnd={true}
            force3d={optimizedAnimationProps.force3d}
            gpuRender={optimizedAnimationProps.gpuRender}
            duration={optimizedAnimationProps.duration}
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full filter blur-3xl" />
            
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
                Actualités Astronomiques
              </h2>
              <div className="h-px w-full max-w-lg mx-auto mt-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </div>
            
            {newsLoading ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            ) : newsError ? (
              <div className="bg-red-100/20 dark:bg-red-900/20 border border-red-200/30 dark:border-red-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm shadow-lg shadow-red-500/5">
                <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Erreur de communication</h2>
                <p className="text-sm sm:text-base text-gray-200 dark:text-gray-300">
                  Impossible de récupérer les actualités pour le moment. Veuillez réessayer plus tard.
                </p>
              </div>
            ) : spaceNews.length === 0 ? (
              <div className="bg-blue-100/20 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/30 rounded-lg p-4 sm:p-6 backdrop-blur-sm shadow-lg shadow-blue-500/5">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">Aucune actualité récente</h2>
                <p className="text-sm sm:text-base text-gray-200 dark:text-gray-300">
                  Aucune actualité récente n'a été trouvée pour le système solaire.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                    Source : Spaceflight News API
                    <span className="px-2 py-1 bg-blue-100/20 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded">
                      Articles en anglais
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {spaceNews.slice(0, 6).map((article) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-white/30 dark:bg-gray-800/30 rounded-lg overflow-hidden hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 cursor-pointer shadow-lg shadow-blue-500/5 dark:shadow-blue-500/5 backdrop-blur-sm h-full"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <OptimizedImage
                          src={article.image_url || '/assets/default.webp'}
                          alt={article.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-2 left-3 right-3">
                          <p className="text-xs sm:text-sm text-gray-200">
                            {formatDate(article.published_at)}
                          </p>
                          <p className="text-xs text-gray-300">{article.news_site}</p>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-200 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 line-clamp-2 sm:line-clamp-3">
                          {article.summary}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </ScrollAnimationContainer>
        </main>
        
        <Footer />
        <ScrollToTop />
      </div>
    </LazyMotion>
  );
} 