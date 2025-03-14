import { useMemo, useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import React from 'react';
import { useReducedMotion } from 'framer-motion';

// Imports pour les effets de post-processing
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

// Import des composants modulaires du système solaire
import { Sun } from './Sun';
import { Planet } from './Planet';
import { Lighting } from './Lighting';
import { CameraControls } from './CameraControls';
import { DateDisplay } from './DateDisplay';
import { PLANETS_DATA } from './constants';
import { SolarSystemProvider } from './SolarSystemContext';
import { usePlanetPositions } from './utils';
import { QualitySettings } from './types';

// Chargement paresseux des composants moins critiques
const AsteroidBelt = lazy(() => import('./AsteroidBelt').then(mod => ({ default: mod.AsteroidBelt })));
const NebulaBackground = lazy(() => import('./Nebula').then(mod => ({ default: mod.default })));

// Composants optimisés avec memo
const PostProcessingEffects = React.memo(() => (
  <EffectComposer>
    <Bloom 
      intensity={1.5} 
      luminanceThreshold={0.2} 
      luminanceSmoothing={0.8} 
      blendFunction={BlendFunction.SCREEN}
      kernelSize={KernelSize.LARGE}
    />
    <Vignette 
      offset={0.2} 
      darkness={0.7} 
      blendFunction={BlendFunction.NORMAL}
    />
    <ChromaticAberration 
      offset={new THREE.Vector2(0.0008, 0.0008)} 
      blendFunction={BlendFunction.NORMAL}
    />
  </EffectComposer>
));

PostProcessingEffects.displayName = 'PostProcessingEffects';

// Composant optimisé pour le fond étoilé combiné avec des nébuleuses
const SkyBackground = React.memo(({ starCount, qualitySettings }: { starCount: number, qualitySettings: QualitySettings }) => {
  // Optimisation des paramètres d'étoiles en fonction de la qualité
  const starsProps = useMemo(() => {
    if (qualitySettings.planetDetail <= 16) {
      // Mode ultra-léger pour les appareils à faibles performances
      return { radius: 80, depth: 50, factor: 3, saturation: 0.3, fade: true, speed: 0.5 };
    }
    
    // Mode standard, mais toujours optimisé
    return { radius: 100, depth: 60, factor: 4, saturation: 0.5, fade: true, speed: 1 };
  }, [qualitySettings.planetDetail]);
  
  return (
    <>
      <Stars 
        radius={starsProps.radius} 
        depth={starsProps.depth} 
        count={Math.min(starCount, 5000)} // Limiter au maximum à 5000 étoiles
        factor={starsProps.factor} 
        saturation={starsProps.saturation} 
        fade={starsProps.fade} 
        speed={starsProps.speed} 
      />
      
      {/* Ne charger la nébuleuse que si la qualité est suffisante */}
      {qualitySettings.planetDetail >= 32 && (
        <Suspense fallback={null}>
          <NebulaBackground />
        </Suspense>
      )}
    </>
  );
});

SkyBackground.displayName = 'SkyBackground';

// Composant pour les planètes avec mémorisation
const PlanetsList = React.memo(({ qualitySettings }: { qualitySettings: QualitySettings }) => {
  return (
    <>
      {PLANETS_DATA.map((planet, index) => (
        <Planet 
          key={planet.name}
          name={planet.name}
          radius={planet.radius}
          distance={planet.distance}
          texturePath={planet.texturePath}
          hasRings={planet.hasRings}
          index={index}
          planet={planet}
          qualitySettings={qualitySettings}
        />
      ))}
    </>
  );
});

PlanetsList.displayName = 'PlanetsList';

// Composant pour l'interface utilisateur en bas
const BottomUI = React.memo(({ 
  resetView, 
  resetDate, 
  isLiveDate, 
  focusedPlanetIndex,
  isFullscreen
}: { 
  resetView: () => void, 
  resetDate: () => void,
  isLiveDate: boolean,
  focusedPlanetIndex: number | null,
  isFullscreen?: boolean
}) => {
  // Déterminer quels boutons afficher
  const showResetDateButton = !isLiveDate;
  const showResetViewButton = focusedPlanetIndex !== null;
  
  // Si aucun bouton à afficher, ne pas rendre le composant
  if (!showResetDateButton && !showResetViewButton) {
    return null;
  }

  // Adapter le style en fonction du mode plein écran
  const containerClassName = isFullscreen
    ? "absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 bg-black/80 backdrop-blur-md rounded-md text-white z-30 border border-gray-700/40 shadow-lg max-w-xs xs:max-w-sm mx-auto"
    : "absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 bg-black/70 backdrop-blur-md rounded-md text-white z-30 border border-gray-700/30 shadow-lg";

  return (
    <div className={containerClassName}>
      
      {/* Contrôles temporels stylisés */}
      <div className="flex items-center justify-between w-full gap-2 xs:gap-3">
        {showResetDateButton && (
          <button 
            className="cursor-pointer bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 px-2 xs:px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[9px] xs:text-xs shadow-md shadow-yellow-500/20 transition-all"
            onClick={resetDate}
          >
            Aujourd'hui
          </button>
        )}
        
        {showResetViewButton && (
          <button 
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-2 xs:px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[9px] xs:text-xs shadow-md shadow-blue-500/20 transition-all"
            onClick={resetView}
          >
            Vue d'ensemble
          </button>
        )}
      </div>
    </div>
  );
});

BottomUI.displayName = 'BottomUI';

// Composant pour le sélecteur de planètes
const PlanetSelector = React.memo(({ 
  focusedPlanetIndex, 
  showPlanetMenu, 
  togglePlanetMenu,
  focusOnPlanet,
}: { 
  focusedPlanetIndex: number | null,
  showPlanetMenu: boolean,
  togglePlanetMenu: () => void,
  focusOnPlanet: (index: number) => void,
  isFullscreen?: boolean
}) => {
  // Pas besoin de classe conteneur spécifique en mode plein écran
  // car le conteneur parent gère déjà le positionnement
  
  return (
    <div className="w-full sm:w-auto">
      <button 
        className="cursor-pointer flex items-center justify-between w-full px-2 py-1 sm:px-3 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-md text-[10px] xs:text-xs shadow-md shadow-blue-500/20 transition-all"
        onClick={togglePlanetMenu}
      >
        <span className="mr-1 font-medium">
          {focusedPlanetIndex !== null ? PLANETS_DATA[focusedPlanetIndex].name : "Planètes"}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-3 w-3 transition-transform ${showPlanetMenu ? 'rotate-180' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {showPlanetMenu && (
        <div className="absolute top-full right-0 sm:right-auto mt-1 w-full sm:w-36 bg-black/80 backdrop-blur-md rounded-md shadow-lg p-2 flex flex-col gap-1 border border-gray-700/40 z-10">
          {PLANETS_DATA.map((planet, index) => (
            <button
              key={planet.name}
              className={`cursor-pointer text-left text-[10px] xs:text-xs py-1 px-2 rounded transition-colors ${
                focusedPlanetIndex === index 
                  ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white font-medium" 
                  : "hover:bg-blue-600/30 text-gray-200"
              }`}
              onClick={() => {
                focusOnPlanet(index);
              }}
            >
              {planet.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

PlanetSelector.displayName = 'PlanetSelector';

// Interface pour les props du SolarSystemView
interface SolarSystemViewProps {
  onLoaded?: () => void; // Callback pour signaler que le composant a fini de charger
  isVisible?: boolean;   // Indique si le composant est visible à l'écran
  quality?: 'low' | 'medium' | 'high'; // Contrôle la qualité du rendu
  isFullscreen?: boolean; // Indique si le composant est en mode plein écran
}

// Composant principal, optimisé
export default function SolarSystemView({ 
  onLoaded, 
  isVisible = true,
  quality = 'medium',
  isFullscreen = false 
}: SolarSystemViewProps) {
  // États du système solaire
  const [focusedPlanetIndex, setFocusedPlanetIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [timeScale, setTimeScale] = useState<number>(0); // 0 = temps réel, sinon multiplicateur
  const [isLiveDate, setIsLiveDate] = useState(true); // Nouvel état pour suivre si on utilise la date en temps réel
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPlanetMenu, setShowPlanetMenu] = useState(false);
  const planetPositions = usePlanetPositions(PLANETS_DATA.length);
  // Détection des préférences d'animation réduites
  const prefersReducedMotion = useReducedMotion();
  
  // Déterminer les paramètres de qualité en fonction du niveau sélectionné et des préférences d'animations
  const qualitySettings = useMemo<QualitySettings>(() => {
    // Réduire automatiquement la qualité si l'utilisateur préfère les animations réduites
    const qualityLevel = prefersReducedMotion ? 'low' : quality;
    
    // En mode plein écran, on peut augmenter légèrement la qualité si l'appareil le permet
    const fullscreenUpgrade = isFullscreen && !prefersReducedMotion;
    
    switch (qualityLevel) {
      case 'low':
        return {
          dpr: [0.5, 0.7] as [number, number], // Résolution très réduite
          starsCount: 500, // Nombre d'étoiles minimal (réduit de 1000 à 500)
          usePostProcessing: false, // Pas d'effets post-processing
          drawDistance: 60, // Distance de rendu réduite
          asteroidsCount: 20, // Très peu d'astéroïdes
          frameloop: 'demand' as const, // Rendu uniquement si nécessaire
          planetDetail: 16, // Faible détail des géométries de planètes
          textureQuality: 0.5, // Textures basse résolution
          shadowsEnabled: false, // Désactiver les ombres
          atmosphereQuality: 'low' // Qualité d'atmosphère basse
        };
      case 'medium':
        return {
          dpr: [0.8, fullscreenUpgrade ? 1.5 : 1.2] as [number, number], // Résolution moyenne
          starsCount: fullscreenUpgrade ? 2500 : 1500, // Nombre d'étoiles modéré (réduit de 5000/3500 à 2500/1500)
          usePostProcessing: true, // Activer les effets de base
          drawDistance: fullscreenUpgrade ? 100 : 80, // Distance de rendu moyenne
          asteroidsCount: fullscreenUpgrade ? 350 : 200, // Nombre modéré d'astéroïdes
          frameloop: fullscreenUpgrade ? 'always' as const : 'demand' as const,
          planetDetail: 32, // Détail moyen des géométries
          textureQuality: 1, // Textures en résolution normale
          shadowsEnabled: true, // Activer les ombres basiques
          atmosphereQuality: 'medium' // Qualité d'atmosphère moyenne
        };
      case 'high':
        return {
          dpr: [1, fullscreenUpgrade ? 2.5 : 2] as [number, number], // Haute résolution
          starsCount: fullscreenUpgrade ? 5000 : 3000, // Grand nombre d'étoiles (réduit de 12000/8000 à 5000/3000)
          usePostProcessing: true, // Tous les effets activés
          drawDistance: fullscreenUpgrade ? 150 : 120, // Grande distance de rendu
          asteroidsCount: fullscreenUpgrade ? 1200 : 800, // Grand nombre d'astéroïdes
          frameloop: 'always' as const, // Rendu continu pour des animations fluides
          planetDetail: 64, // Détail maximal des géométries
          textureQuality: 2, // Textures haute résolution
          shadowsEnabled: true, // Ombres de haute qualité
          atmosphereQuality: 'high' // Qualité d'atmosphère maximale
        };
      default:
        return {
          dpr: [0.8, fullscreenUpgrade ? 1.5 : 1.2] as [number, number],
          starsCount: fullscreenUpgrade ? 5000 : 3500,
          usePostProcessing: true,
          drawDistance: fullscreenUpgrade ? 100 : 80,
          asteroidsCount: fullscreenUpgrade ? 350 : 200,
          frameloop: fullscreenUpgrade ? 'always' as const : 'demand' as const,
          planetDetail: 32,
          textureQuality: 1,
          shadowsEnabled: true,
          atmosphereQuality: 'medium'
        };
    }
  }, [quality, prefersReducedMotion, isFullscreen]);
  
  // Simuler un temps de chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Appeler le callback onLoaded pour informer le parent que la vue est chargée
      if (onLoaded) {
        onLoaded();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [onLoaded]);
  
  // Mettre à jour la date en fonction du temps réel, optimisé avec des dépendances précises
  useEffect(() => {
    // Si le composant n'est pas visible ou en cours de chargement, ne pas mettre à jour la date
    if (!isVisible || isLoading) return;
    
    let interval: ReturnType<typeof setInterval>;
    
    // Si timeScale est 0 ET isLiveDate est true, on suit le temps réel
    if (timeScale === 0 && isLiveDate) {
      interval = setInterval(() => {
        setCurrentDate(new Date());
      }, 60000); // Mise à jour chaque minute
    } else if (timeScale !== 0) {
      // Sinon, on avance ou recule le temps selon le timeScale
      interval = setInterval(() => {
        setCurrentDate(date => {
          const newDate = new Date(date);
          newDate.setDate(newDate.getDate() + timeScale);
          return newDate;
        });
      }, 1000); // Mise à jour plus rapide
    } else {
      // Pas d'intervalle si on a une date fixe sélectionnée
      return;
    }
    
    return () => clearInterval(interval);
  }, [timeScale, isLiveDate, isVisible, isLoading]);
  
  // Réinitialiser la vue
  const resetView = useCallback(() => {
    setFocusedPlanetIndex(null);
  }, []);
  
  // Focaliser sur une planète
  const focusOnPlanet = useCallback((index: number) => {
    setFocusedPlanetIndex(index);
    setShowPlanetMenu(false);
  }, []);

  // Gestionnaire pour les mises à jour de caméra
  const handleCameraUpdate = useCallback(() => {
    // Cette fonction est appelée à chaque mise à jour de caméra mais nous n'avons pas besoin de stocker ces valeurs
  }, []);
  
  // Réinitialiser à la date actuelle
  const resetDate = useCallback(() => {
    setCurrentDate(new Date());
    setTimeScale(0);
    setIsLiveDate(true); // Activer le suivi du temps réel
  }, []);
  
  // Définir une date spécifique
  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date);
    setTimeScale(0); // Arrêter l'écoulement du temps quand une date est sélectionnée manuellement
    setIsLiveDate(false); // Désactiver le suivi du temps réel
  }, []);

  // Basculer l'affichage du sélecteur de date
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker(prev => !prev);
  }, []);

  // Fonction pour basculer le menu des planètes
  const togglePlanetMenu = useCallback(() => {
    setShowPlanetMenu(prev => !prev);
  }, []);

  // Créer la valeur du contexte de manière optimisée
  const contextValue = useMemo(() => ({ 
    setFocusedPlanet: setFocusedPlanetIndex,
    planetPositions,
    currentDate,
    focusedPlanetIndex,
    timeScale,
    isLiveDate
  }), [focusedPlanetIndex, planetPositions, currentDate, timeScale, isLiveDate]);

  return (
    <>
      {isLoading ? (
        <div className={`flex items-center justify-center ${isFullscreen ? 'h-screen' : 'h-[400px] sm:h-[400px] md:h-[450px]'}`}>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-l-blue-500 border-b-purple-500 border-r-purple-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300">Chargement des planètes...</p>
          </div>
        </div>
      ) : (
        <div className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-[400px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px]'}`}>
          {/* Afficher le sélecteur de planète et les contrôles UI en dehors du Canvas pour de meilleures performances */}
          {isVisible && (
            <>
              {isFullscreen ? (
                // En mode plein écran, déplacer les contrôles sous le bandeau supérieur
                <div className="absolute top-[60px] xs:top-[58px] sm:top-[64px] left-0 right-0 flex flex-wrap justify-between items-start px-3 xs:px-4 py-2 z-30 gap-2">
                  <div className="w-full sm:w-auto">
                    <DateDisplay 
                      date={currentDate} 
                      onDateSelect={handleDateSelect}
                      showDatePicker={showDatePicker}
                      toggleDatePicker={toggleDatePicker}
                      isLiveDate={isLiveDate}
                      isFullscreen={isFullscreen}
                    />
                  </div>
                  
                  <div className="w-full sm:w-auto">
                    <PlanetSelector 
                      focusedPlanetIndex={focusedPlanetIndex} 
                      showPlanetMenu={showPlanetMenu}
                      togglePlanetMenu={togglePlanetMenu}
                      focusOnPlanet={focusOnPlanet}
                      isFullscreen={isFullscreen}
                    />
                  </div>
                </div>
              ) : (
                // Mode normal (non plein écran), positionner comme avant
                <>
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-30">
                    <PlanetSelector 
                      focusedPlanetIndex={focusedPlanetIndex} 
                      showPlanetMenu={showPlanetMenu}
                      togglePlanetMenu={togglePlanetMenu}
                      focusOnPlanet={focusOnPlanet}
                      isFullscreen={isFullscreen}
                    />
                  </div>
                  
                  <DateDisplay 
                    date={currentDate} 
                    onDateSelect={handleDateSelect}
                    showDatePicker={showDatePicker}
                    toggleDatePicker={toggleDatePicker}
                    isLiveDate={isLiveDate}
                    isFullscreen={isFullscreen}
                  />
                </>
              )}
            </>
          )}
          
          <SolarSystemProvider value={contextValue}>
            <Canvas 
              camera={{ position: [0, 15, 50], fov: 60 }}
              dpr={qualitySettings.dpr} // Utiliser le DPR basé sur la qualité
              frameloop={!isVisible ? "never" : qualitySettings.frameloop} // Utilisation de l'option frameloop optimisée
              style={{ 
                background: 'transparent',
                willChange: 'transform', // Optimisation GPU
                transform: 'translateZ(0)',
              }}
              className="orbit-view h-full"
              gl={{ 
                powerPreference: 'high-performance',
                antialias: quality !== 'low', // Désactiver l'antialiasing en basse qualité
                alpha: true,
              }}
              performance={{ 
                current: prefersReducedMotion ? 1 : undefined, // Réduire la performance si préférence réduite
                min: 0.5, // Performance minimale
                max: 1, // Performance maximale
                debounce: 200 // Délai avant l'application des changements de performance
              }}
            >
              {/* On ne rend rien si le composant n'est pas visible */}
              {isVisible && (
                <>
                  {/* Éclairage et ambiance */}
                  <Lighting qualitySettings={qualitySettings} />
                  
                  {/* Fond étoilé - nombre d'étoiles réduit sur les appareils à faible performance */}
                  <SkyBackground starCount={qualitySettings.starsCount} qualitySettings={qualitySettings} />
                  
                  {/* Soleil */}
                  <Sun qualitySettings={qualitySettings} />
                  
                  {/* Liste de planètes avec les paramètres de qualité */}
                  <PlanetsList qualitySettings={qualitySettings} />
                  
                  {/* Ceinture d'astéroïdes - ne pas charger pour les préférences d'animation réduites */}
                  {!prefersReducedMotion && (
                    <Suspense fallback={null}>
                      <AsteroidBelt count={qualitySettings.asteroidsCount} qualitySettings={qualitySettings} />
                    </Suspense>
                  )}
                  
                  {/* Contrôles de caméra */}
                  <CameraControls 
                    focusedPlanetIndex={focusedPlanetIndex} 
                    onCameraUpdate={handleCameraUpdate}
                  />
                  
                  {/* Effets post-traitement - désactivés pour les préférences d'animation réduites */}
                  {qualitySettings.usePostProcessing && !prefersReducedMotion && <PostProcessingEffects />}
                </>
              )}
            </Canvas>
          </SolarSystemProvider>
          
          {isVisible && (
            <BottomUI 
              resetView={resetView} 
              resetDate={resetDate} 
              isLiveDate={isLiveDate}
              focusedPlanetIndex={focusedPlanetIndex}
              isFullscreen={isFullscreen}
            />
          )}
        </div>
      )}
    </>
  );
} 