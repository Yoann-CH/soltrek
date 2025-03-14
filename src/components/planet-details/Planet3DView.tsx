import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Planet3DViewProps {
  planetName: string;
  textureName: string;
  color: string;
}

export function Planet3DView({ planetName, textureName, color }: Planet3DViewProps) {
  const [isTextureLoaded, setIsTextureLoaded] = useState(false);
  const planetRef = useRef<HTMLDivElement>(null);
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const [initialTransform, setInitialTransform] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isUsingScrollTop, setIsUsingScrollTop] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const prefersReducedMotion = useReducedMotion();
  
  // Précharger la texture
  useEffect(() => {
    const img = new Image();
    img.src = `/assets/textures/planets/${textureName}.jpg`;
    img.onload = () => {
      setIsTextureLoaded(true);
      // Force un re-rendu de la texture
      if (planetRef.current) {
        const planet = planetRef.current;
        planet.style.setProperty('--planet-texture', `url('/assets/textures/planets/${textureName}.jpg')`);
      }
    };

    // Réinitialiser l'état lors du démontage ou du changement de planète
    return () => {
      setIsTextureLoaded(false);
      if (planetRef.current) {
        planetRef.current.style.removeProperty('--planet-texture');
      }
    };
  }, [textureName]);
  
  // Fonction pour vérifier si le ScrollToTop est en cours d'utilisation
  const checkScrollTopState = useCallback(() => {
    return document.body.classList.contains('using-scroll-top');
  }, []);
  
  // Optimisation: mémoriser les gestionnaires d'événements avec useCallback
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Ne pas appliquer d'effet si ScrollToTop est en cours d'utilisation
    if (checkScrollTopState() || !planetRef.current || isScrolling || prefersReducedMotion) return;
    
    const planet = planetRef.current;
    const rect = planet.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Réduire la précision des calculs pour améliorer les performances
    const rotateY = Math.round(((e.clientX - centerX) / window.innerWidth) * 150) / 10;
    const rotateX = Math.round(((e.clientY - centerY) / window.innerHeight) * -150) / 10;
    
    // Utiliser transform3d pour activer l'accélération GPU
    planet.style.transform = `translate3d(0,0,0) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    
    // Enregistrer la transformation initiale lors du premier rendu
    if (!initialTransform) {
      setInitialTransform(`rotateY(${rotateY}deg) rotateX(${rotateX}deg)`);
    }
  }, [isScrolling, initialTransform, prefersReducedMotion, checkScrollTopState]);
  
  // Gestionnaire d'événements pour les appareils tactiles optimisé
  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Ne pas appliquer d'effet si ScrollToTop est en cours d'utilisation
    if (checkScrollTopState() || isMobile || !planetRef.current || isScrolling || prefersReducedMotion) return;
    
    // S'assurer que nous n'interrompons que les interactions avec le modèle 3D
    const target = e.target as HTMLElement;
    const isPlanetElement = target.closest('.planet') !== null;
    if (!isPlanetElement || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const planet = planetRef.current;
    const rect = planet.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Réduire la précision des calculs
    const rotateY = Math.round(((touch.clientX - centerX) / window.innerWidth) * 150) / 10;
    const rotateX = Math.round(((touch.clientY - centerY) / window.innerHeight) * -150) / 10;
    
    // Utiliser transform3d pour activer l'accélération GPU
    planet.style.transform = `translate3d(0,0,0) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    
    // Mettre à jour les variables globales de position
    window.mouseX = touch.clientX;
    window.mouseY = touch.clientY;
  }, [isMobile, isScrolling, prefersReducedMotion, checkScrollTopState]);
  
  // Gestionnaire de défilement optimisé
  const handleScroll = useCallback(() => {
    // Ne pas modifier l'état si ScrollTop est actif
    if (checkScrollTopState()) return;
    
    if (!planetRef.current) return;
    
    setIsScrolling(true);
    const planet = planetRef.current;
    // Utiliser des classes CSS au lieu de manipuler les styles directement
    planet.classList.add('scrolling');
    
    if (starsContainerRef.current) {
      starsContainerRef.current.classList.add('scrolling-stars');
    }
  }, [checkScrollTopState]);
  
  // Vérifier périodiquement si ScrollToTop est en cours d'utilisation
  useEffect(() => {
    const checkScrollTopInterval = setInterval(() => {
      const isUsingScrollTopNow = checkScrollTopState();
      if (isUsingScrollTopNow !== isUsingScrollTop) {
        setIsUsingScrollTop(isUsingScrollTopNow);
        
        // Si ScrollToTop devient actif, stabiliser la planète
        if (isUsingScrollTopNow && planetRef.current) {
          const planet = planetRef.current;
          planet.classList.add('scrolling');
          planet.style.transform = 'translate3d(0,0,0) rotateY(0deg) rotateX(0deg)';
        }
      }
    }, 100);
    
    return () => clearInterval(checkScrollTopInterval);
  }, [isUsingScrollTop, checkScrollTopState]);
  
  // Effet de rotation 3D sur la planète avec le mouvement de la souris
  useEffect(() => {
    if (!planetRef.current || prefersReducedMotion) return;
    
    const planet = planetRef.current;
    
    // Forcer l'application de la texture si elle est déjà chargée
    if (isTextureLoaded) {
      planet.style.setProperty('--planet-texture', `url('/assets/textures/planets/${textureName}.jpg')`);
    }
    
    // Utiliser les options passive pour améliorer les performances de défilement
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTextureLoaded, textureName, handleMouseMove, handleTouchMove, handleScroll, prefersReducedMotion]);

  // Réinitialiser la transformation après un défilement - optimisé avec throttling
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    let scrollTimeout: number;
    let isThrottled = false;
    
    const handleScrollEnd = () => {
      // Ne pas réinitialiser si ScrollToTop est actif
      if (checkScrollTopState()) return;
      
      // Throttle pour améliorer les performances
      if (isThrottled) return;
      isThrottled = true;
      
      // Nettoyer le timeout précédent
      clearTimeout(scrollTimeout);
      
      // Attendre que le défilement soit terminé
      scrollTimeout = window.setTimeout(() => {
        setIsScrolling(false);
        isThrottled = false;
        
        if (planetRef.current) {
          const planet = planetRef.current;
          planet.classList.remove('scrolling');
          
          if (starsContainerRef.current) {
            starsContainerRef.current.classList.remove('scrolling-stars');
          }
        }
      }, 150);
    };
    
    // Suivre la position de la souris globalement avec throttling
    const trackMousePosition = (e: MouseEvent) => {
      if (!isThrottled) {
        window.mouseX = e.clientX;
        window.mouseY = e.clientY;
        isThrottled = true;
        setTimeout(() => { isThrottled = false; }, 16); // ~60fps
      }
    };
    
    // Ajouter la propriété au window pour stocker la position de la souris
    if (typeof window.mouseX === 'undefined') {
      window.mouseX = 0;
      window.mouseY = 0;
    }
    
    window.addEventListener('scroll', handleScrollEnd, { passive: true });
    window.addEventListener('mousemove', trackMousePosition, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScrollEnd);
      window.removeEventListener('mousemove', trackMousePosition);
      clearTimeout(scrollTimeout);
    };
  }, [prefersReducedMotion, checkScrollTopState]);

  // Générer des positions d'étoiles fixes plutôt qu'aléatoires à chaque rendu
  const starPositions = useState(() => {
    // Réduire le nombre d'étoiles pour les appareils à faible performance
    const count = isMobile ? 10 : 20;
    return Array.from({ length: count }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.7 + 0.3,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      width: `${Math.random() * 1.5 + 1}px`,
      height: `${Math.random() * 1.5 + 1}px`
    }));
  })[0];

  // Simplifier les variants d'animation
  const planetVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.7,
        ease: "easeOut",
      }
    }
  };
  
  // Si l'utilisateur préfère les animations réduites, utiliser des animations simplifiées
  if (prefersReducedMotion) {
    return (
      <div className="relative flex justify-center lg:col-span-2">
        <div className="absolute -z-10 inset-0 flex items-center justify-center opacity-80">
          <div className="w-full h-full max-w-md max-h-md rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 dark:from-blue-600 dark:to-purple-600 blur-[100px]"></div>
        </div>
        
        <div 
          ref={planetRef} 
          className="planet relative w-64 h-64 lg:w-96 lg:h-96 rounded-full select-none"
          style={{ 
            '--planet-texture': isTextureLoaded 
              ? `url('/assets/textures/planets/${textureName}.jpg')`
              : `radial-gradient(circle at 30% 30%, ${color}DD, ${color}99 50%, ${color}66 80%)`,
            '--planet-glow': `0 0 100px 10px ${color}66`,
            backgroundImage: 'var(--planet-texture)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            boxShadow: 'var(--planet-glow)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          } as React.CSSProperties}
        >
          {/* Effet de brillance */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent 70%)',
              mixBlendMode: 'overlay'
            }}
          />
          
          {/* Atmosphère */}
          <div 
            className="absolute inset-0 rounded-full opacity-70"
            style={{
              backgroundImage: `radial-gradient(circle at 70% 70%, transparent 50%, ${color}22 80%, ${color}44 90%, ${color}66 95%)`
            }}
          />
          
          {/* Lumière réfléchie */}
          <div 
            className="absolute rounded-full opacity-60" 
            style={{
              width: '30%',
              height: '30%',
              left: '10%',
              top: '10%',
              backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 100%)'
            }}
          />
          
          {/* Anneaux pour Saturne */}
          {planetName === 'saturne' && (
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '140%',
                height: '20%',
                background: 'linear-gradient(to right, transparent 5%, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.5) 80%, transparent 95%)',
                borderRadius: '50%',
                transform: 'rotateX(75deg)',
                boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.5)'
              }}
            />
          )}
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className={`relative flex justify-center lg:col-span-2 ${isMobile ? 'touch-action-auto' : ''}`}
      variants={planetVariants}
      initial="hidden"
      animate="visible"
      layoutId={`planet-${planetName}`}
      style={{ 
        touchAction: 'pan-y',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    >
      <div className="absolute -z-10 inset-0 flex items-center justify-center opacity-80">
        <div className="w-full h-full max-w-md max-h-md rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 dark:from-blue-600 dark:to-purple-600 blur-[100px]"></div>
      </div>
      
      <div 
        ref={planetRef} 
        className={`planet relative w-64 h-64 lg:w-96 lg:h-96 rounded-full select-none ${isScrolling || isUsingScrollTop ? 'scrolling' : ''} ${isMobile ? 'pointer-events-none' : ''}`}
        style={{ 
          '--planet-texture': isTextureLoaded 
            ? `url('/assets/textures/planets/${textureName}.jpg')`
            : `radial-gradient(circle at 30% 30%, ${color}DD, ${color}99 50%, ${color}66 80%)`,
          '--planet-glow': `0 0 100px 10px ${color}66`,
          backgroundImage: 'var(--planet-texture)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          boxShadow: 'var(--planet-glow)',
          perspective: '1000px',
          transformStyle: 'preserve-3d',
          transformBox: 'fill-box',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        } as React.CSSProperties}
      >
        {/* Effet de brillance */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent 70%)',
            mixBlendMode: 'overlay'
          }}
        />
        
        {/* Atmosphère */}
        <div 
          className="absolute inset-0 rounded-full opacity-70"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 70%, transparent 50%, ${color}22 80%, ${color}44 90%, ${color}66 95%)`
          }}
        />
        
        {/* Lumière réfléchie */}
        <div 
          className="absolute rounded-full opacity-60" 
          style={{
            width: '30%',
            height: '30%',
            left: '10%',
            top: '10%',
            backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 100%)'
          }}
        />
        
        {/* Anneaux pour Saturne */}
        {planetName === 'saturne' && (
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '140%',
              height: '20%',
              background: 'linear-gradient(to right, transparent 5%, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.5) 80%, transparent 95%)',
              borderRadius: '50%',
              transform: 'rotateX(75deg)',
              boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.5)'
            }}
          />
        )}
      </div>
      
      {/* Étoiles/particules autour de la planète - Utilisation d'un conteneur avec position relative */}
      <div 
        ref={starsContainerRef} 
        className={`absolute inset-0 -z-10 dark:block hidden ${isScrolling || isUsingScrollTop ? 'scrolling-stars' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div className="stars-container absolute inset-0" style={{ transform: 'translateZ(0)' }}>
          {starPositions.map((style, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                top: style.top,
                left: style.left,
                opacity: style.opacity,
                animationDelay: style.animationDelay,
                animationDuration: style.animationDuration,
                width: style.width,
                height: style.height
              }}
            />
          ))}
        </div>
      </div>
      
      <style>
        {`
          .planet.scrolling {
            transform: translate3d(0,0,0) rotateY(0deg) rotateX(0deg) !important;
            transition: none !important;
          }
          
          .scrolling-stars {
            transform: translateZ(0) !important;
            will-change: transform;
            pointer-events: none !important;
          }

          .scrolling-stars .stars-container {
            transform: translateZ(0) !important;
          }
          
          .touch-action-auto {
            touch-action: auto !important;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .planet, .scrolling-stars {
              transition: none !important;
              animation: none !important;
              transform: none !important;
            }
          }
          
          /* Support pour ScrollToTop */
          body.using-scroll-top .planet {
            transform: translate3d(0,0,0) rotateY(0deg) rotateX(0deg) !important;
            transition: none !important;
          }
          
          /* Optimisations mobiles pour ScrollToTop */
          @media (max-width: 768px) {
            body.using-scroll-top .planet {
              opacity: 1;
              transform: translate3d(0,0,0) !important;
            }
          }
        `}
      </style>
    </motion.div>
  );
}

// Étendre l'interface Window pour TypeScript
declare global {
  interface Window {
    mouseX: number;
    mouseY: number;
  }
} 