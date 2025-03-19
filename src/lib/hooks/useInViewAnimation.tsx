import { useState, useEffect, useRef, RefObject } from 'react';
import { useLoading } from '../loadingContext';
import { motion, Variants, HTMLMotionProps } from 'framer-motion';

// État global pour suivre la visibilité de la page
let pageIsVisible = true;

// Fonction pour détecter l'état de visibilité de la page
document.addEventListener('visibilitychange', () => {
  pageIsVisible = document.visibilityState === 'visible';
});

// Détection des appareils à faibles performances
const isLowEndDevice = () => {
  // Détecte si l'appareil a peu de mémoire ou un processeur lent
  // La propriété hardwareConcurrency indique le nombre de cœurs logiques du processeur
  const hasLowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  // Détecte si le navigateur est en mode économie d'énergie (si disponible)
  const isLowPower = 'connection' in navigator && 
    // @ts-expect-error - Non disponible dans tous les navigateurs
    (navigator.connection?.saveData || navigator.connection?.effectiveType === 'slow-2g' || 
     // @ts-expect-error - Non disponible dans tous les navigateurs
     navigator.connection?.effectiveType === '2g');
  
  return hasLowCPU || isLowPower;
};

// Configuration par défaut basée sur les capacités du périphérique
const getDefaultConfig = () => {
  const isLowEnd = isLowEndDevice();
  return {
    // Réduire la qualité des animations sur les appareils moins puissants
    defaultDuration: isLowEnd ? 0.3 : 0.6,
    // Diminuer le nombre d'animations simultanées sur les appareils moins puissants
    batchLimit: isLowEnd ? 5 : 12,
    // Augmenter le seuil de déclenchement sur les appareils moins puissants
    defaultThreshold: isLowEnd ? 0.2 : 0.1,
  };
};

interface InViewAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  exitAnimation?: boolean;
  exitThreshold?: number;
  disableOnLowEnd?: boolean; // Désactiver complètement les animations sur les appareils moins puissants
}

// Compteur global pour limiter les animations simultanées
let activeAnimationsCount = 0;
const config = getDefaultConfig();

export function useInViewAnimation({
  threshold = config.defaultThreshold,
  rootMargin = '0px',
  triggerOnce = false,
  delay = 0,
  exitAnimation = false,
  exitThreshold = 0.1,
  disableOnLowEnd = false
}: InViewAnimationOptions = {}) {
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);
  const [animating, setAnimating] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const wasInView = useRef<boolean>(false);
  const { appLoaded } = useLoading();

  // Vérifier si nous devons désactiver les animations
  const shouldDisableAnimation = disableOnLowEnd && isLowEndDevice();

  // Gestionnaire de visibilité pour préserver l'état entre les changements d'onglet
  useEffect(() => {
    // Fonction pour gérer le changement de visibilité
    const handleVisibilityChange = () => {
      // Si la page redevient visible et que l'élément était visible avant de quitter l'onglet
      if (document.visibilityState === 'visible' && wasInView.current) {
        // Restaurer l'état précédent
        setIsInView(true);
      }
    };

    // Stocker l'état actuel de visibilité pour référence future
    wasInView.current = isInView;

    // Ajouter le gestionnaire d'événement
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Nettoyer lors du démontage
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInView]);

  useEffect(() => {
    // Attendre que l'application soit chargée avant d'initialiser l'observer
    if (!appLoaded) return;

    const currentRef = ref.current;
    if (!currentRef) return;

    // Ne pas animer si les animations sont désactivées pour cet appareil
    if (shouldDisableAnimation) {
      setIsInView(true);
      setHasAnimated(true);
      return;
    }

    // Ne pas réinitialiser si on a déjà animé et que triggerOnce est vrai
    if (triggerOnce && hasAnimated) return;

    // Réduire la fréquence d'observation 
    // en utilisant un throttle pour l'observer
    const observerOptions = { 
      threshold: exitAnimation ? [threshold, exitThreshold] : threshold, 
      rootMargin 
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // Ne pas traiter les intersections si l'onglet n'est pas visible
      if (!pageIsVisible) return;
      
      const entry = entries[0];
      
      // Si on dépasse la limite d'animations simultanées, on reporte cette animation
      // sauf si c'est une animation à déclenchement unique
      if (!entry.isIntersecting && activeAnimationsCount > config.batchLimit && !triggerOnce) {
        return;
      }

      // Si l'élément était visible et qu'il sort du viewport et que l'on souhaite une animation de sortie
      if (!entry.isIntersecting && isInView && exitAnimation && !triggerOnce) {
        // Calcul pour déterminer si l'élément est sorti par le haut ou par le bas
        const boundingRect = entry.boundingClientRect;
        const windowHeight = window.innerHeight;
        
        if (boundingRect.top > windowHeight) {
          // L'élément est sorti par le bas
          setIsExiting(true);
          setAnimating(true);
          activeAnimationsCount++;
          
          setTimeout(() => {
            setIsInView(false);
            setIsExiting(false);
            setAnimating(false);
            activeAnimationsCount = Math.max(0, activeAnimationsCount - 1);
          }, 300); // Durée courte pour éviter les effets étranges
        } else if (boundingRect.bottom < 0) {
          // L'élément est sorti par le haut
          // On le garde visible en marquant qu'il a été défilé vers le haut
          setHasScrolledUp(true);
          // Ne pas déclencher l'animation de sortie
        }
      } 
      // Ne déclencher l'animation que si l'élément est visible
      else if (entry.isIntersecting) {
        // Mémoriser que cet élément a été vu
        wasInView.current = true;
        
        // Activer will-change uniquement pendant l'animation
        setAnimating(true);
        activeAnimationsCount++;
        
        // Ajouter un délai si nécessaire
        if (delay > 0) {
          setTimeout(() => {
            setIsInView(true);
            setIsExiting(false);
            
            if (triggerOnce) {
              setHasAnimated(true);
              // Cesser d'observer si triggerOnce est activé
              if (observerRef.current && currentRef) {
                observerRef.current.unobserve(currentRef);
                observerRef.current = null;
              }
            }
            
            // Désactiver will-change après l'animation
            setTimeout(() => {
              if (triggerOnce) {
                setAnimating(false);
                activeAnimationsCount = Math.max(0, activeAnimationsCount - 1);
              }
            }, 1000); // Durée approximative de l'animation
            
          }, delay);
        } else {
          setIsInView(true);
          setIsExiting(false);
          
          if (triggerOnce) {
            setHasAnimated(true);
            // Cesser d'observer si triggerOnce est activé
            if (observerRef.current && currentRef) {
              observerRef.current.unobserve(currentRef);
              observerRef.current = null;
            }
            
            // Désactiver will-change après l'animation
            setTimeout(() => {
              setAnimating(false);
              activeAnimationsCount = Math.max(0, activeAnimationsCount - 1);
            }, 1000); // Durée approximative de l'animation
          }
        }
      } else if (!triggerOnce && !hasScrolledUp) {
        // Réinitialiser l'animation si l'élément n'est plus visible
        // et que triggerOnce n'est pas activé
        // et que l'élément n'a pas été défilé vers le haut
        // Si exitAnimation est false, on réinitialise directement
        if (!exitAnimation) {
          setIsInView(false);
          setAnimating(false);
          activeAnimationsCount = Math.max(0, activeAnimationsCount - 1);
        }
      }
    };

    // Création de l'observer avec options optimisées
    observerRef.current = new IntersectionObserver(handleIntersection, observerOptions);
    observerRef.current.observe(currentRef);

    return () => {
      if (currentRef && observerRef.current) {
        observerRef.current.unobserve(currentRef);
        observerRef.current = null;
      }
    };
  }, [appLoaded, threshold, rootMargin, triggerOnce, hasAnimated, delay, isInView, exitAnimation, exitThreshold, hasScrolledUp, shouldDisableAnimation]);

  return { 
    ref, 
    isInView: isInView || hasScrolledUp, 
    hasAnimated, 
    isExiting,
    // Ajouter animating pour permettre d'optimiser will-change
    animating  
  };
}

// Composant wrapper pour faciliter l'utilisation classique (sans framer-motion)
export function InViewAnimationWrapper({
  children,
  className = '',
  options = {},
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  options?: InViewAnimationOptions;
  [key: string]: unknown;
}) {
  const { ref, isInView, isExiting, animating } = useInViewAnimation(options);
  
  // Calculer le style en fonction de l'état de visibilité
  const styleProps = {
    opacity: isExiting ? 0 : isInView ? 1 : 0,
    transform: isExiting ? 'translateY(-20px)' : 
               isInView ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
    // N'appliquer will-change que pendant l'animation
    willChange: animating ? 'opacity, transform' : 'auto'
  };

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className={className}
      {...props}
      style={{
        ...(props.style as React.CSSProperties || {}),
        ...styleProps
      }}
    >
      {children}
    </div>
  );
}

// Composant pour framer-motion qui déclenche les animations au scroll
// Utilisez un type plus spécifique pour éviter l'erreur any
type MotionComponent = React.ComponentType<HTMLMotionProps<"div"> & { ref?: RefObject<HTMLDivElement> }>;

interface AnimateInViewProps {
  children: React.ReactNode;
  variants: Variants;
  options?: InViewAnimationOptions;
  as?: MotionComponent;
  className?: string;
  // Utiliser Record pour éviter l'erreur any
  [key: string]: unknown;
}

export function AnimateInView({
  children,
  variants,
  options = { triggerOnce: true },
  as: Component = motion.div,
  className,
  ...props
}: AnimateInViewProps) {
  const { ref, isInView, isExiting, animating } = useInViewAnimation(options);

  const motionProps = {
    initial: "hidden",
    animate: isInView ? "visible" : isExiting ? "exit" : "hidden",
    exit: "exit",
    variants,
    className,
    style: {
      // N'appliquer will-change que pendant l'animation
      willChange: animating ? 'opacity, transform' : 'auto'
    },
    ...props
  };

  return (
    <Component
      ref={ref as RefObject<HTMLDivElement>}
      {...motionProps}
    >
      {children}
    </Component>
  );
} 