import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';
import { usePlanetData, formatPlanetDataForDisplay } from '../lib/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import SpaceBackground from '../components/SpaceBackground';
import ScrollAnimationContainer from '../components/ScrollAnimationContainer';
import {
  PlanetHeader,
  Planet3DView,
  PlanetDataGrid,
  PlanetComposition,
  PlanetFunFact,
  PlanetNavigation,
  PlanetStats,
  PlanetFeatures,
  PlanetNews
} from '../components/planet-details';

// Mappage des noms français aux noms de fichiers en anglais
const planetTextureMap: Record<string, string> = {
  'mercure': 'mercury',
  'vénus': 'venus',
  'terre': 'earth',
  'mars': 'mars',
  'jupiter': 'jupiter',
  'saturne': 'saturn',
  'uranus': 'uranus',
  'neptune': 'neptune'
};

export default function PlanetDetailPage() {
  const { planetName } = useParams<{ planetName: string }>();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const [isLoading, setIsLoading] = useState(() => {
    // Vérifier si l'utilisateur a déjà visité cette page de planète
    const hasVisitedPlanet = localStorage.getItem(`hasVisited_${planetName}`) === 'true';
    // Si l'utilisateur a déjà visité cette page, on ne montre pas l'animation skeleton
    return !hasVisitedPlanet;
  });
  const normalizedPlanetName = planetName?.toLowerCase() || '';
  
  // Récupération des données dynamiques
  const { data: apiPlanetData, isLoading: isApiLoading, error: apiError } = usePlanetData(normalizedPlanetName);
  const [displayData, setDisplayData] = useState<ReturnType<typeof formatPlanetDataForDisplay> | null>(null);
  
  // Traiter les données API et les formater pour l'affichage
  useEffect(() => {
    if (apiPlanetData) {
      const formattedData = formatPlanetDataForDisplay(apiPlanetData, normalizedPlanetName);
      setDisplayData(formattedData);
    }
  }, [apiPlanetData, normalizedPlanetName]);
  
  // Vérifier si la planète existe dans nos données
  const textureName = planetTextureMap[normalizedPlanetName] || 'earth';
  
  // Rediriger vers la page d'exploration si la planète n'existe pas
  useEffect(() => {
    if (!planetName || (!apiPlanetData && !isApiLoading && !isLoading)) {
      navigate('/explore', { replace: true });
    }
  }, [planetName, apiPlanetData, isApiLoading, navigate, isLoading]);
  
  // Simuler un chargement
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        // Enregistrer que l'utilisateur a visité cette page de planète
        localStorage.setItem(`hasVisited_${planetName}`, 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, planetName]);

  // Scroll to top when component mounts or planetName changes - optimisé pour de meilleures performances
  const scrollToTop = useCallback(() => {
    // Ajouter une classe pour signaler que nous utilisons une fonction de scroll programmée
    document.body.classList.add('using-scroll-top');
    
    // Scroll to top immediately with hardware acceleration
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
    
    // Force a second scroll with a small delay to ensure consistency
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      
      // Retirer la classe après un délai pour permettre à la page de se stabiliser
      setTimeout(() => {
        document.body.classList.remove('using-scroll-top');
      }, 100);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);
  
  useEffect(() => {
    scrollToTop();
  }, [planetName, scrollToTop]);

  // Fix for touch scrolling on mobile landscape mode - optimisé pour de meilleures performances
  useEffect(() => {
    // S'assurer que la page est en mode de défilement normal
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';
    
    // Appliquer touch-action globalement
    document.documentElement.style.touchAction = 'manipulation';
    document.body.style.touchAction = 'manipulation';
    
    // Ajouter une classe CSS au body pour améliorer le défilement tactile
    document.body.classList.add('touch-scrolling-enabled');
    
    // Nettoyer lors du démontage
    return () => {
      document.body.classList.remove('touch-scrolling-enabled');
    };
  }, []);

  // Définir un style global pour améliorer le défilement tactile - maintenant avec des règles d'optimisation
  useEffect(() => {
    // Créer une feuille de style pour les règles globales
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      body.touch-scrolling-enabled {
        -webkit-overflow-scrolling: touch !important;
        overflow-y: auto !important;
        height: auto !important;
        position: static !important;
        touch-action: pan-y !important;
      }
      
      /* S'assurer que tous les conteneurs principaux permettent le défilement */
      .overflow-hidden {
        overflow-x: hidden !important;
      }
      
      /* Styles spécifiques pour iOS */
      @supports (-webkit-touch-callout: none) {
        body.touch-scrolling-enabled {
          touch-action: pan-y !important;
          -webkit-overflow-scrolling: touch !important;
        }
      }
      
      /* Désactiver les événements pointer sur la planète 3D en vue paysage */
      @media (orientation: landscape) and (max-width: 1024px) {
        .planet-3d-view {
          pointer-events: none !important;
        }
      }
      
      /* Optimisations GPU */
      .will-change-transform {
        will-change: transform;
        transform: translateZ(0);
      }
      
      /* Réduire les animations pour les dispositifs à faible performance */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      // Nettoyer lors du démontage
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Animation variants - simplifiés pour de meilleures performances
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Réduit le décalage entre les enfants
        delayChildren: 0.05,
        when: "beforeChildren",
        duration: 0.5, // Réduit la durée de l'animation
        ease: "easeOut" // Courbe d'accélération simplifiée
      }
    },
    exit: {
      opacity: 0,
      transition: { 
        duration: 0.3, // Réduit la durée de sortie
        ease: "easeIn"
      }
    }
  };
  
  // Ajuster les paramètres pour les appareils à faible performance ou les préférences d'animation réduites
  const getOptimizedProps = () => {
    // Si l'utilisateur préfère les animations réduites, utiliser des configurations optimisées
    if (prefersReducedMotion) {
      return {
        starCount: 40, // Moins d'étoiles
        planetCount: 0, // Pas de planètes aléatoires
        enableParallax: false, // Désactiver le parallaxe
        showNebulae: false, // Pas de nébuleuses en arrière-plan
        duration: 0.2, // Animations plus rapides
        triggerOnce: true, // Déclencher les animations une seule fois
        gpuRender: true // Forcer le rendu GPU
      };
    }
    
    // Configuration standard pour les appareils performants
    return {
      starCount: 150,
      planetCount: 5,
      enableParallax: true,
      showNebulae: true,
      duration: 0.4,
      triggerOnce: true,
      gpuRender: true
    };
  };
  
  const optimizedProps = getOptimizedProps();
  
  // Afficher le squelette de chargement
  if (isLoading || isApiLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <SpaceBackground 
          starCount={optimizedProps.starCount / 2} 
          planetCount={0} 
          enableParallax={false} 
          showNebulae={false} 
        />
        <div className="text-center relative z-10">
          <div className="w-32 h-32 mx-auto rounded-full bg-gray-800 animate-pulse 
                          relative before:absolute before:content-[''] before:inset-0 before:rounded-full 
                          before:bg-gradient-to-r before:from-blue-600 before:to-purple-600 before:animate-spin before:blur-xl"></div>
          <div className="mt-4 w-48 h-6 mx-auto bg-gray-800 rounded animate-pulse relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent to-blue-600 to-60% animate-shimmer"></div>
          </div>
          <div className="mt-2 w-64 h-4 mx-auto bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  // Afficher un message d'erreur si nécessaire
  if (apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <SpaceBackground 
          starCount={optimizedProps.starCount / 2} 
          planetCount={1} 
          enableParallax={false} 
          showNebulae={false} 
        />
        <div className="text-center p-6 max-w-md bg-red-900/20 rounded-lg border border-red-500/30 backdrop-blur-sm relative z-10">
          <div className="mb-4 text-red-500 text-6xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Erreur de communication</h2>
          <p className="mb-4 text-gray-300">
            La liaison avec le satellite d'observation a été perdue. Impossible de récupérer les données pour cette planète.
          </p>
          <button 
            onClick={() => navigate('/explore')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg shadow-blue-500/20"
          >
            Retour au centre de contrôle
          </button>
        </div>
      </div>
    );
  }
  
  if (!displayData) return null;
  
  // Version sans animation pour les préférences d'animation réduites
  if (prefersReducedMotion) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black dark:bg-black text-gray-100 bg-cover bg-fixed touch-manipulation">
        <SpaceBackground 
          starCount={optimizedProps.starCount} 
          planetCount={optimizedProps.planetCount} 
          enableParallax={optimizedProps.enableParallax} 
          showNebulae={optimizedProps.showNebulae} 
        />
        
        <Header 
          pageName={normalizedPlanetName.toLowerCase()} 
          showBackButton={true} 
          backTo="/explore" 
          backText="Retour" 
        />
        
        <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 md:px-8 relative z-10 touch-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center mb-20">
              <div className="lg:col-span-2 planet-3d-view">
                <Planet3DView 
                  planetName={normalizedPlanetName}
                  textureName={textureName}
                  color={displayData.color}
                />
              </div>
              
              <div className="lg:col-span-3 space-y-8">
                <PlanetHeader 
                  planetName={normalizedPlanetName}
                  description={displayData.description}
                  moons={displayData.moons}
                  bodyType={displayData.bodyType}
                />
                
                <PlanetDataGrid 
                  diameter={displayData.diameter}
                  distance={displayData.distance}
                  dayLength={displayData.dayLength}
                  yearLength={displayData.yearLength}
                  mass={displayData.mass}
                  temperature={displayData.temperature}
                  density={displayData.density}
                  gravity={displayData.gravity}
                />
                
                <PlanetComposition 
                  composition={displayData.composition}
                />
                
                <PlanetFunFact 
                  funFact={displayData.funFact}
                  planetName={normalizedPlanetName}
                />
              </div>
            </div>
            
            <div className="mb-20">
              <PlanetStats
                inclination={displayData.inclination}
                eccentricity={displayData.eccentricity}
                escapeVelocity={displayData.escapeVelocity}
                discoveredBy={displayData.discoveredBy}
                discoveryDate={displayData.discoveryDate}
                axialTilt={displayData.axialTilt}
              />
            </div>
            
            <div className="mb-20">
              <PlanetFeatures planetName={normalizedPlanetName} />
            </div>

            <div className="mb-20">
              <PlanetNews planetName={normalizedPlanetName} />
            </div>
            
            <div className="pb-12">
              <PlanetNavigation 
                planetNames={planetTextureMap}
                currentPlanet={normalizedPlanetName}
              />
            </div>
          </div>
        </main>
        
        <Footer />
        <ScrollToTop />
      </div>
    );
  }
  
  // Version avec animations pour les utilisateurs standard
  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={pageRef}
        key={normalizedPlanetName}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="min-h-screen relative overflow-hidden bg-black dark:bg-black text-gray-100 bg-cover bg-fixed touch-manipulation"
        style={{ willChange: 'transform, opacity' }}
      >
        <SpaceBackground 
          starCount={optimizedProps.starCount} 
          planetCount={optimizedProps.planetCount} 
          enableParallax={optimizedProps.enableParallax} 
          showNebulae={optimizedProps.showNebulae} 
        />
        
        <Header 
          pageName={normalizedPlanetName.toLowerCase()} 
          showBackButton={true} 
          backTo="/explore" 
          backText="Retour" 
        />
        
        <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 md:px-8 relative z-10 touch-auto">
          <div className="max-w-7xl mx-auto">
            {/* Section principale avec la planète 3D et les infos de base */}
            <ScrollAnimationContainer 
              type="fadeUp"
              className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center mb-20"
              triggerOnce={optimizedProps.triggerOnce}
              threshold={0.1}
              rootMargin="100px 0px"
            >
              {/* Visualisation de la planète */}
              <ScrollAnimationContainer 
                type="scale"
                className="lg:col-span-2 planet-3d-view"
                triggerOnce={optimizedProps.triggerOnce}
                threshold={0.2}
                delay={50}
                exitAnimation={false}
                gpuRender={optimizedProps.gpuRender}
                duration={optimizedProps.duration}
              >
                <Planet3DView 
                  planetName={normalizedPlanetName}
                  textureName={textureName}
                  color={displayData.color}
                />
              </ScrollAnimationContainer>
              
              {/* Informations sur la planète */}
              <ScrollAnimationContainer 
                type="slideLeft"
                className="lg:col-span-3 space-y-8"
                triggerOnce={optimizedProps.triggerOnce}
                threshold={0.2}
                delay={50}
                exitAnimation={false}
                gpuRender={optimizedProps.gpuRender}
                duration={optimizedProps.duration}
              >
                <ScrollAnimationContainer 
                  type="fadeUp"
                  delay={50}
                  triggerOnce={optimizedProps.triggerOnce}
                  threshold={0.2}
                  exitAnimation={false}
                  gpuRender={optimizedProps.gpuRender}
                  duration={optimizedProps.duration}
                >
                  <PlanetHeader 
                    planetName={normalizedPlanetName}
                    description={displayData.description}
                    moons={displayData.moons}
                    bodyType={displayData.bodyType}
                  />
                </ScrollAnimationContainer>
                
                <ScrollAnimationContainer 
                  type="fadeUp"
                  delay={100}
                  triggerOnce={optimizedProps.triggerOnce}
                  threshold={0.1}
                  exitAnimation={false}
                  gpuRender={optimizedProps.gpuRender}
                  duration={optimizedProps.duration}
                >
                  <PlanetDataGrid 
                    diameter={displayData.diameter}
                    distance={displayData.distance}
                    dayLength={displayData.dayLength}
                    yearLength={displayData.yearLength}
                    mass={displayData.mass}
                    temperature={displayData.temperature}
                    density={displayData.density}
                    gravity={displayData.gravity}
                  />
                </ScrollAnimationContainer>
                
                <ScrollAnimationContainer 
                  type="fadeUp"
                  delay={150}
                  triggerOnce={optimizedProps.triggerOnce}
                  threshold={0.1}
                  exitAnimation={false}
                  gpuRender={optimizedProps.gpuRender}
                  duration={optimizedProps.duration}
                >
                  <PlanetComposition 
                    composition={displayData.composition}
                  />
                </ScrollAnimationContainer>
                
                <ScrollAnimationContainer 
                  type="fadeUp"
                  className="shadow-lg shadow-blue-500/5"
                  delay={200}
                  triggerOnce={optimizedProps.triggerOnce}
                  threshold={0.1}
                  exitAnimation={false}
                  gpuRender={optimizedProps.gpuRender}
                  duration={optimizedProps.duration}
                >
                  <PlanetFunFact 
                    funFact={displayData.funFact}
                    planetName={normalizedPlanetName}
                  />
                </ScrollAnimationContainer>
              </ScrollAnimationContainer>
            </ScrollAnimationContainer>
            
            {/* Sections complémentaires */}
            <ScrollAnimationContainer 
              type="fadeUp"
              className="mb-20"
              triggerOnce={optimizedProps.triggerOnce}
              threshold={0.1}
              rootMargin="150px 0px"
              exitAnimation={false}
              gpuRender={optimizedProps.gpuRender}
              duration={optimizedProps.duration}
            >
              <PlanetStats
                inclination={displayData.inclination}
                eccentricity={displayData.eccentricity}
                escapeVelocity={displayData.escapeVelocity}
                discoveredBy={displayData.discoveredBy}
                discoveryDate={displayData.discoveryDate}
                axialTilt={displayData.axialTilt}
              />
            </ScrollAnimationContainer>
            
            {/* Caractéristiques importantes de la planète */}
            <ScrollAnimationContainer 
              type="fadeUp"
              className="mb-20"
              triggerOnce={optimizedProps.triggerOnce}
              threshold={0.1}
              rootMargin="150px 0px"
              exitAnimation={false}
              disableOnLowEnd={true}
              force3d={true}
              gpuRender={optimizedProps.gpuRender}
              duration={optimizedProps.duration}
            >
              <PlanetFeatures planetName={normalizedPlanetName} />
            </ScrollAnimationContainer>

            {/* Section des actualités */}
            <ScrollAnimationContainer 
              type="fadeUp"
              className="mb-20"
              triggerOnce={optimizedProps.triggerOnce}
              threshold={0.1}
              rootMargin="150px 0px"
              exitAnimation={false}
              disableOnLowEnd={true}
              force3d={true}
              gpuRender={optimizedProps.gpuRender}
              duration={optimizedProps.duration}
            >
              <PlanetNews planetName={normalizedPlanetName} />
            </ScrollAnimationContainer>
            
            {/* Navigation entre les planètes */}
            <ScrollAnimationContainer 
              type="fadeUp"
              className="pb-12"
              triggerOnce={optimizedProps.triggerOnce}
              threshold={0.1}
              rootMargin="150px 0px"
              exitAnimation={false}
              disableOnLowEnd={true}
              force3d={true}
              gpuRender={optimizedProps.gpuRender}
              duration={optimizedProps.duration}
            >
              <PlanetNavigation 
                planetNames={planetTextureMap}
                currentPlanet={normalizedPlanetName}
              />
            </ScrollAnimationContainer>
          </div>
        </main>
        
        <Footer />
        <ScrollToTop />
      </motion.div>
    </AnimatePresence>
  );
} 