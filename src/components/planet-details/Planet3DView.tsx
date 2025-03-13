import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
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
  
  // Effet de rotation 3D sur la planète avec le mouvement de la souris
  useEffect(() => {
    if (!planetRef.current) return;
    
    const planet = planetRef.current;
    const starsContainer = starsContainerRef.current;
    
    // Forcer l'application de la texture si elle est déjà chargée
    if (isTextureLoaded) {
      planet.style.setProperty('--planet-texture', `url('/assets/textures/planets/${textureName}.jpg')`);
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!planet || isScrolling) return;
      
      const rect = planet.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateY = ((e.clientX - centerX) / window.innerWidth) * 15;
      const rotateX = ((e.clientY - centerY) / window.innerHeight) * -15;
      
      // Enregistrer la transformation initiale lors du premier rendu
      if (!initialTransform) {
        setInitialTransform(`rotateY(${rotateY}deg) rotateX(${rotateX}deg)`);
      }
      
      planet.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    };
    
    // Gestionnaire d'événements pour les appareils tactiles
    const handleTouchMove = (e: TouchEvent) => {
      // Toujours permettre le défilement sur mobile quels que soient le nombre de doigts
      if (isMobile) return;
      
      // Continuer seulement si c'est une manipulation intentionnelle du modèle 3D
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const rect = planet.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateY = ((touch.clientX - centerX) / window.innerWidth) * 15;
      const rotateX = ((touch.clientY - centerY) / window.innerHeight) * -15;
      
      planet.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      
      // Mettre à jour les variables globales de position
      window.mouseX = touch.clientX;
      window.mouseY = touch.clientY;
      
      // Ne jamais empêcher le défilement sur mobile, mais permettre la prévention sur les non-mobiles
      if (!isMobile && e.cancelable) {
        e.preventDefault();
      }
    };
    
    // Gestionnaire de défilement pour réinitialiser la transformation
    const handleScroll = () => {
      if (!planet) return;
      setIsScrolling(true);
      // Réinitialiser la transformation pendant le défilement pour éviter les déformations
      planet.style.transform = 'rotateY(0deg) rotateX(0deg)';
      planet.classList.add('scrolling');
      
      // Geler également les étoiles pendant le défilement
      if (starsContainer) {
        starsContainer.classList.add('scrolling-stars');
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTextureLoaded, textureName, initialTransform, isScrolling, isMobile]);

  // Réinitialiser la transformation après un défilement
  useEffect(() => {
    let scrollTimeout: number;
    
    const handleScrollEnd = () => {
      // Attendre que le défilement soit terminé avant de réactiver les transformations
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        setIsScrolling(false);
        
        // Recalculer les transformations basées sur la position actuelle de la souris
        if (planetRef.current) {
          const planet = planetRef.current;
          planet.classList.remove('scrolling');
          
          // Réactiver également les étoiles
          if (starsContainerRef.current) {
            starsContainerRef.current.classList.remove('scrolling-stars');
          }
          
          // Attendre un bref moment pour que la planète se stabilise
          setTimeout(() => {
            const rect = planet.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Utiliser la dernière position connue de la souris ou 0 si non disponible
            const rotateY = ((window.mouseX || centerX) - centerX) / window.innerWidth * 15;
            const rotateX = ((window.mouseY || centerY) - centerY) / window.innerHeight * -15;
            
            planet.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
          }, 50);
        }
      }, 150);
    };
    
    window.addEventListener('scroll', handleScrollEnd, { passive: true });
    
    // Suivre la position de la souris globalement
    const trackMousePosition = (e: MouseEvent) => {
      window.mouseX = e.clientX;
      window.mouseY = e.clientY;
    };
    
    // Ajouter la propriété au window pour stocker la position de la souris
    if (typeof window.mouseX === 'undefined') {
      window.mouseX = 0;
      window.mouseY = 0;
    }
    
    window.addEventListener('mousemove', trackMousePosition);
    
    return () => {
      window.removeEventListener('scroll', handleScrollEnd);
      window.removeEventListener('mousemove', trackMousePosition);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Générer des positions d'étoiles fixes plutôt qu'aléatoires à chaque rendu
  const starPositions = useState(() => {
    return Array.from({ length: 20 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.7 + 0.3,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      width: `${Math.random() * 1.5 + 1}px`,
      height: `${Math.random() * 1.5 + 1}px`
    }));
  })[0];

  const planetVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { 
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3
      }
    }
  };
  
  return (
    <motion.div 
      className={`relative flex justify-center lg:col-span-2 ${isMobile ? 'touch-action-auto' : ''}`}
      variants={planetVariants}
      layoutId={`planet-${planetName}`}
    >
      <div className="absolute -z-10 inset-0 flex items-center justify-center opacity-80">
        <div className="w-full h-full max-w-md max-h-md rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 dark:from-blue-600 dark:to-purple-600 blur-[100px]"></div>
      </div>
      
      <div 
        ref={planetRef} 
        className={`planet relative w-64 h-64 lg:w-96 lg:h-96 rounded-full transition-all duration-300 select-none ${isScrolling ? 'scrolling' : ''} ${isMobile ? 'pointer-events-none' : ''}`}
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
        className={`absolute inset-0 -z-10 dark:block hidden ${isScrolling ? 'scrolling-stars' : ''}`}
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
            transform: rotateY(0deg) rotateX(0deg) !important;
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