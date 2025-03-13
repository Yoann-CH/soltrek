import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { memo, useState, useEffect, useMemo, useRef } from 'react';
import { useLoading } from '../lib/loadingContext';

// Définition des couleurs pour chaque planète
const planetColors: Record<string, { main: string, shadow: string, glow: string }> = {
  'Mercure': { main: '#A6A6A6', shadow: '#7A7A7A', glow: 'rgba(166, 166, 166, 0.5)' },
  'Vénus': { main: '#E8B584', shadow: '#C29C70', glow: 'rgba(232, 181, 132, 0.5)' },
  'Terre': { main: '#4B82C3', shadow: '#2766B0', glow: 'rgba(75, 130, 195, 0.5)' },
  'Mars': { main: '#E27B58', shadow: '#C45A37', glow: 'rgba(226, 123, 88, 0.5)' },
  'Jupiter': { main: '#E0A951', shadow: '#C99240', glow: 'rgba(224, 169, 81, 0.5)' },
  'Saturne': { main: '#C5AB6E', shadow: '#A99057', glow: 'rgba(197, 171, 110, 0.5)' },
  'Uranus': { main: '#8FD1E0', shadow: '#75B8C7', glow: 'rgba(143, 209, 224, 0.5)' },
  'Neptune': { main: '#4A6FE3', shadow: '#2F54C2', glow: 'rgba(74, 111, 227, 0.5)' }
};

// Mappage des noms français aux noms de fichiers en anglais
const planetTextureMap: Record<string, string> = {
  'Mercure': 'mercury',
  'Vénus': 'venus',
  'Terre': 'earth',
  'Mars': 'mars',
  'Jupiter': 'jupiter',
  'Saturne': 'saturn',
  'Uranus': 'uranus',
  'Neptune': 'neptune'
};

// Interfaces pour les props du composant
interface PlanetCardProps {
  name: string;
  index: number;
}

const PlanetCard = memo(({ name, index }: PlanetCardProps) => {
  const navigate = useNavigate();
  const colors = planetColors[name] || { main: '#A6A6A6', shadow: '#7A7A7A', glow: 'rgba(166, 166, 166, 0.5)' };
  const textureName = planetTextureMap[name] || 'earth';
  const [isTextureLoaded, setIsTextureLoaded] = useState(false);
  const { appLoaded } = useLoading();
  // Référence pour suivre si le composant est monté
  const isMounted = useRef(true);
  // Détecter si on est sur mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Préchargement optimisé des textures
  useEffect(() => {
    const img = new Image();
    img.src = `/assets/textures/planets/${textureName}.jpg`;
    
    const handleLoad = () => {
      if (isMounted.current) {
        setIsTextureLoaded(true);
      }
    };
    
    img.addEventListener('load', handleLoad);
    
    // Si l'image est déjà en cache
    if (img.complete) {
      handleLoad();
    }

    // Nettoyer lors du démontage
    return () => {
      isMounted.current = false;
      img.removeEventListener('load', handleLoad);
    };
  }, [textureName]);

  // Optimisation du suivi de souris avec RAF et debounce - désactivé sur mobile
  useEffect(() => {
    // Ne pas activer cette fonctionnalité sur mobile pour économiser des ressources
    if (isMobile) return;

    let rafId: number;
    let lastUpdate = 0;
    const minInterval = 1000 / 30; // Limite à 30fps
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastUpdate < minInterval) return;
      
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const card = document.querySelector(`[data-planet="${name}"]`);
        if (!card) return;
        
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}%`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}%`);
        
        lastUpdate = now;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [name, isMobile]);

  // Animation constants memoizés
  const animationProps = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: appLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: { 
      duration: 0.4,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  }), [appLoaded, index]);

  // Réduire l'échelle sur mobile pour éviter les problèmes de performance
  const hoverProps = useMemo(() => ({
    whileHover: isMobile ? undefined : { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  }), [isMobile]);

  // Optimisation des transitions d'animation infinies - réduites sur mobile
  const planetAnimProps = useMemo(() => ({
    animate: isMobile ? undefined : { 
      y: [0, -4, 0],
      transition: { 
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror" as const
      }
    }
  }), [isMobile]);

  const handleClick = () => {
    navigate(`/explore/${name.toLowerCase()}`);
  };

  return (
    <motion.div
      {...animationProps}
      {...hoverProps}
      onClick={handleClick}
      data-planet={name}
      className={`p-6 bg-gradient-to-br from-gray-50 to-white/80 dark:from-gray-900 dark:to-gray-800/90
                rounded-xl shadow-lg backdrop-blur-md transition-colors
                border border-white/20 dark:border-gray-700/50 
                hover:border-blue-300/50 dark:hover:border-blue-500/50
                hover:shadow-blue-200/30 dark:hover:shadow-blue-700/20
                flex flex-col items-center cursor-pointer group relative overflow-hidden planet-card
                h-full ${isMobile ? 'mobile-planet-card' : ''}`}
      role="button"
      aria-label={`Explorer ${name}`}
      style={{
        willChange: isMobile ? 'auto' : 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Effet de lueur au survol */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-indigo-500/10 to-purple-600/10 dark:from-blue-600/20 dark:via-indigo-700/20 dark:to-purple-800/20"
          style={{
            background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), 
              ${colors.glow}, 
              transparent 50%)`
          }}
        />
      </div>
      
      {/* Badge de position */}
      <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-700 
                     text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10
                     shadow-lg shadow-blue-500/20 dark:shadow-blue-700/30">
        {index + 1}
      </div>

      {/* Représentation visuelle de la planète */}
      <div className="mb-4 relative">
        {/* Effet de halo derrière la planète */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full 
                      bg-gradient-to-br from-blue-400/20 to-purple-400/10 dark:from-blue-600/30 dark:to-purple-800/20 
                      blur-md group-hover:blur-xl transition-all duration-500 -z-10"></div>

        {/* Partie arrière de l'anneau (sous la planète) - seulement pour Saturne */}
        {name === 'Saturne' && (
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: '160%',
              height: '8%',
              background: 'linear-gradient(to right, transparent 5%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.3) 80%, transparent 95%)',
              borderRadius: '50%',
              transform: 'rotateX(78deg)',
              boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.2)',
              zIndex: -1,
              willChange: 'transform' // Optimisation GPU
            }}
            {...(isMobile ? {} : planetAnimProps)}
          />
        )}
        <motion.div 
          className="w-24 h-24 rounded-full relative overflow-hidden shadow-xl"
          style={{ 
            boxShadow: `0 0 25px ${colors.glow}`,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            zIndex: 1,
            willChange: isMobile ? 'auto' : 'transform' // Désactiver willChange sur mobile
          }}
          {...(isMobile ? {} : planetAnimProps)} // Désactiver l'animation sur mobile
        >
          <div 
            className="absolute inset-0 w-full h-full rounded-full"
            style={{ 
              backgroundImage: isTextureLoaded 
                ? `url('/assets/textures/planets/${textureName}.jpg')`
                : `radial-gradient(circle at 30% 30%, ${colors.main}, ${colors.shadow})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* Indicateur de chargement */}
          {!isTextureLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Effet de brillance */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 70%)',
              mixBlendMode: 'overlay',
              pointerEvents: 'none'
            }}
          />
          
          {/* Atmosphère - optimisée */}
          <div 
            className="absolute inset-0 rounded-full opacity-70 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 70% 70%, transparent 50%, ${colors.main}22 80%, ${colors.main}44 90%, ${colors.main}66 95%)`
            }}
          />
          
          {/* Lumière réfléchie */}
          <div 
            className="absolute rounded-full opacity-60 pointer-events-none" 
            style={{
              width: '30%',
              height: '30%',
              left: '10%',
              top: '10%',
              backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 100%)'
            }}
          />
        </motion.div>
        
        {/* Partie avant de l'anneau (sur la planète) - seulement pour Saturne */}
        {name === 'Saturne' && (
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: '160%',
              height: '8%',
              background: 'linear-gradient(to right, transparent 5%, rgba(255, 255, 255, 0.4) 20%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.4) 80%, transparent 95%)',
              borderRadius: '50%',
              transform: 'rotateX(78deg)',
              boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.2)',
              zIndex: 2,
              willChange: 'transform' // Optimisation GPU
            }}
            {...(isMobile ? {} : planetAnimProps)}
          />
        )}
      </div>

      {/* Contenu du texte et info - avec hauteur fixe et flex-grow pour pousser le bouton vers le bas */}
      <div className="flex-grow flex flex-col items-center">
        <h3 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-blue-200 
                    bg-clip-text text-transparent">{name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
          Cliquez pour explorer {name} en détail.
        </p>
      </div>
      
      {/* Bouton d'action - maintenant avec mt-auto pour le pousser en bas de la carte */}
      <div className="relative w-full overflow-hidden mt-4">
        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-600/30 rounded-lg blur-sm group-hover:blur-md transition-all duration-300" />
        <div className="relative px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-800 
                      text-white rounded-lg text-sm font-medium text-center transform group-hover:translate-y-[-2px] 
                      transition-transform duration-300 shadow-lg shadow-blue-500/20 dark:shadow-blue-700/30">
          Explorer
        </div>
      </div>
      
      {/* Particules d'étoiles (effet visuel) - désactivées sur mobile */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-[2px] rounded-full bg-white animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.6 + Math.random() * 0.4,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Préchargement caché des textures */}
      <div className="hidden">
        <img 
          src={`/assets/textures/planets/${textureName}.jpg`} 
          alt={`Texture de ${name}`} 
          onLoad={() => setIsTextureLoaded(true)}
          aria-hidden="true"
        />
      </div>
      
      {/* Style spécifique pour mobile */}
      <style>
        {`
        @media (max-width: 767px) {
          .mobile-planet-card {
            contain: content !important;
            content-visibility: auto;
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            will-change: auto;
          }
          
          .mobile-planet-card div {
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
          }
          
          /* Assurer que les planètes restent visibles pendant le défilement */
          .mobile-planet-card div[style*="background-image"] {
            background-attachment: scroll !important;
            background-repeat: no-repeat !important;
            background-size: cover !important;
            transform: translateZ(0) !important;
            will-change: auto !important;
          }
        }
        `}
      </style>
    </motion.div>
  );
});

// Utiliser React.memo pour éviter les rendus inutiles
export default memo(PlanetCard); 