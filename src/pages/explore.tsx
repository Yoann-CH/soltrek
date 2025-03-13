import { LazyMotion, domAnimation } from 'framer-motion';
import PlanetCard from '../components/PlanetCard';
import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { fetchAllPlanets, fetchPlanetNews, SpaceNewsArticle } from '../lib/api';
// Utilisation du lazy loading pour le SolarSystemView
const SolarSystemViewComponent = lazy(() => import('../components/solar-system/SolarSystemView'));
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
// Utilisation du lazy loading pour le SpaceBackground
const SpaceBackground = lazy(() => import('../components/SpaceBackground'));
import ScrollAnimationContainer from '../components/ScrollAnimationContainer';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  // Nouvel état pour suivre si l'utilisateur a explicitement activé la vue 3D
  const [isEnabled, setIsEnabled] = useState(false);
  // Nouvel état pour la qualité du rendu
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

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

  // Fonction pour activer la vue 3D
  const handleEnableView = useCallback(() => {
    setIsEnabled(true);
    // On peut stocker cette préférence dans le localStorage pour les visites ultérieures
    try {
      localStorage.setItem('solar3dViewEnabled', 'true');
      // Sauvegarder aussi la qualité sélectionnée
      localStorage.setItem('solar3dViewQuality', quality);
    } catch (e) {
      console.error('Impossible de sauvegarder la préférence:', e);
    }
  }, [quality]);
  
  // Fonction pour désactiver la vue 3D
  const handleDisableView = useCallback(() => {
    setIsEnabled(false);
    // Supprimer la préférence du localStorage
    try {
      localStorage.removeItem('solar3dViewEnabled');
    } catch (e) {
      console.error('Impossible de supprimer la préférence:', e);
    }
    // Optionnel: Réinitialiser l'état de chargement
    setHasLoaded(false);
  }, []);

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

  return (
    <div className="space-y-4">
      {/* Bouton pour désactiver la vue 3D (placé en dehors de la visualisation) */}
      {isVisible && isEnabled && (
        <div className="flex justify-center">
          <button 
            onClick={handleDisableView}
            className="cursor-pointer px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 flex items-center gap-2"
            aria-label="Désactiver la vue 3D"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Désactiver la vue 3D
          </button>
        </div>
      )}
    
      <div ref={containerRef} className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-4 overflow-hidden min-h-[400px] shadow-xl">
        {isVisible ? (
          // Si visible et activé, montrer la vue 3D
          isEnabled ? (
            <div className="relative">              
              <Suspense fallback={
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-200 dark:text-gray-300">Chargement du système solaire...</p>
                  </div>
                </div>
              }>
                <SolarSystemViewComponent 
                  onLoaded={handleLoaded} 
                  isVisible={isVisible && isEnabled} 
                  quality={quality} 
                />
              </Suspense>
            </div>
          ) : (
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
          )
        ) : (
          // Si pas visible, montrer le loader
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-200 dark:text-gray-300">{getLoadingMessage()}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Bandeau d'information sur la qualité sélectionnée */}
      {isVisible && isEnabled && (
        <div className="flex justify-center items-center text-sm mt-2">
          <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/30 backdrop-blur-sm flex items-center gap-2">
            <span className="text-gray-300">Qualité actuelle :</span>
            <span className={`px-2 py-1 rounded ${
              quality === 'low' 
                ? 'bg-blue-600/30 text-blue-200' 
                : quality === 'medium'
                  ? 'bg-blue-500/30 text-blue-200'
                  : 'bg-purple-500/30 text-purple-200'
            }`}>
              {quality === 'low' && "Basse"}
              {quality === 'medium' && "Moyenne"}
              {quality === 'high' && "Haute"}
            </span>
          </div>
        </div>
      )}
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
  
  // Lazy load des Skeletons
  const LoadingSkeleton = useCallback(() => (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-6 px-3 sm:py-8 sm:px-6 md:py-10 transition-colors bg-cover bg-fixed">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-white/50 dark:from-blue-900/10 dark:to-black/80 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="w-36 sm:w-48 h-8 sm:h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-md mb-4 sm:mb-8 animate-pulse"></div>
        <div className="w-full h-5 sm:h-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-md mb-8 sm:mb-12 animate-pulse"></div>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-lg p-4 sm:p-6 animate-pulse border border-gray-200/40 dark:border-gray-700/40">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/50 dark:bg-gray-700/50 rounded-full mx-auto mb-3 sm:mb-4 animate-pulse"></div>
              <div className="w-3/4 h-3 sm:h-4 bg-white/50 dark:bg-gray-700/50 rounded mx-auto mb-2 sm:mb-3 animate-pulse"></div>
              <div className="w-full h-2 sm:h-3 bg-white/50 dark:bg-gray-700/50 rounded mb-1 sm:mb-2 animate-pulse"></div>
              <div className="w-5/6 h-2 sm:h-3 bg-white/50 dark:bg-gray-700/50 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ), []);
  
  // Afficher un squelette de chargement pendant le chargement initial
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  // Utiliser m au lieu de motion pour la plupart des composants pour réduire le bundle size
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen relative overflow-hidden bg-black dark:bg-black transition-colors bg-cover bg-fixed">
        {/* Fond spatial ajouté ici */}
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <SpaceBackground starCount={150} planetCount={5} enableParallax={true} showNebulae={true} />
        </Suspense>
        
        <Header pageName="explorer" />
        
        <main className="max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6 relative z-10">
          {/* Section titre avec animation staggered */}
          <ScrollAnimationContainer
            type="staggered"
            className="text-center mb-8 sm:mb-12"
            style={{ willChange: 'transform' }}
            triggerOnce={true}
            threshold={0.2}
          >
            <ScrollAnimationContainer 
              type="fadeDown"
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent leading-relaxed pb-1"
              delay={100}
              triggerOnce={true}
              disableOnLowEnd={true}
              force3d={true}
              gpuRender={true}
            >
              Explorer le Système Solaire
            </ScrollAnimationContainer>
            
            <ScrollAnimationContainer 
              type="fadeUp"
              className="text-base sm:text-lg md:text-xl text-gray-200 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed pb-1"
              delay={200}
              triggerOnce={true}
              disableOnLowEnd={true}
              force3d={true}
              gpuRender={true}
            >
              Découvrez les planètes du système solaire et leurs caractéristiques uniques
            </ScrollAnimationContainer>
            
            {apiError && (
              <ScrollAnimationContainer 
                type="fadeUp"
                className="mt-4 p-3 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/60 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-300 rounded-md backdrop-blur-sm"
                delay={300}
                triggerOnce={true}
                disableOnLowEnd={true}
                force3d={true}
                gpuRender={true}
              >
                {apiError}
              </ScrollAnimationContainer>
            )}
          </ScrollAnimationContainer>
          
          {/* Section vue 3D avec animation de défilement */}
          <ScrollAnimationContainer
            type="fadeUp"
            className="mb-10 sm:mb-16 md:mb-20 relative"
            triggerOnce={true}
            exitAnimation={false}
            threshold={0.1}
            rootMargin="100px 0px"
            disableOnLowEnd={true}
            force3d={true}
            gpuRender={true}
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
            type="fadeUp"
            className="relative"
            triggerOnce={true}
            exitAnimation={false}
            threshold={0.05}
            rootMargin="100px 0px"
            disableOnLowEnd={true}
            force3d={true}
            gpuRender={true}
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
                  type="scale"
                  className="h-full"
                  delay={index * 20} // Réduit l'intervalle entre animations
                  triggerOnce={true} // Changé à true pour éviter les réanimations
                  exitAnimation={false} // Désactivé l'animation de sortie
                  threshold={0.05}
                  rootMargin="200px 0px" // Augmenté pour précharger plus tôt
                  duration={0.4} // Animation plus rapide
                  disableOnLowEnd={true}
                  force3d={true}
                  gpuRender={true}
                >
                  <PlanetCard name={name} index={index} />
                </ScrollAnimationContainer>
              ))}
            </div>
          </ScrollAnimationContainer>
          
          {/* Nouvelle section d'actualités spatiales */}
          <ScrollAnimationContainer
            type="fadeUp"
            className="relative mt-16 mb-10"
            triggerOnce={true}
            exitAnimation={false}
            threshold={0.05}
            rootMargin="150px 0px"
            disableOnLowEnd={true}
            force3d={true}
            gpuRender={true}
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
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/50 dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-lg shadow-blue-500/5 dark:shadow-blue-500/5">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="p-3 sm:p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  </div>
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
                  {spaceNews.slice(0, 6).map((article, index) => (
                    <ScrollAnimationContainer
                      key={article.id}
                      type="scale"
                      className="h-full"
                      delay={Math.min(index * 30, 150)} // Limiter le délai maximum
                      triggerOnce={true}
                      exitAnimation={false}
                      threshold={0.05}
                      rootMargin="200px 0px"
                      duration={0.4}
                      disableOnLowEnd={true}
                      force3d={true}
                      gpuRender={true}
                    >
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block bg-white/30 dark:bg-gray-800/30 rounded-lg overflow-hidden hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 cursor-pointer shadow-lg shadow-blue-500/5 dark:shadow-blue-500/5 backdrop-blur-sm h-full transform transition-transform hover:scale-[1.02] hover:-translate-y-1"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={article.image_url || '/assets/default.webp'}
                            alt={article.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                            loading="lazy" // Ajoute le chargement différé des images
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (!target.src.includes('/assets/default.webp')) {
                                console.log('Image non trouvée, utilisation de la valeur par défaut');
                                target.src = '/assets/default.webp';
                              }
                            }}
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
                    </ScrollAnimationContainer>
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