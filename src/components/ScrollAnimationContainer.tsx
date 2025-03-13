import { ReactNode, CSSProperties, useMemo } from 'react';
import { AnimateInView } from '../lib/hooks/useInViewAnimation';
import { Variants } from 'framer-motion';

type AnimationType = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale' | 'staggered' | 'fadeDown';
type AnimationDirection = 'fromTop' | 'fromBottom' | 'fromLeft' | 'fromRight' | 'zoomIn' | 'zoomOut';

interface ScrollAnimationContainerProps {
  children: ReactNode;
  type?: AnimationType;
  enterFrom?: AnimationDirection; // Nouvelle option pour contrôler la direction d'entrée
  exitTo?: AnimationDirection;    // Nouvelle option pour contrôler la direction de sortie
  className?: string;
  style?: CSSProperties;
  delay?: number;
  staggerDelay?: number;
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
  exitAnimation?: boolean; // Nouvelle option pour activer l'animation de sortie
  duration?: number; // Durée des animations
  // Nouvelles propriétés pour l'optimisation
  disableOnLowEnd?: boolean;
  force3d?: boolean;
  gpuRender?: boolean;
}

// Composant optimisé
export default function ScrollAnimationContainer({
  children,
  type = 'fadeUp',
  enterFrom,
  exitTo,
  className = '',
  style,
  delay = 0,
  staggerDelay = 0.08,
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = '0px',
  exitAnimation = false,
  duration = 0.6,
  // Nouvelles options d'optimisation
  disableOnLowEnd = true,
  force3d = true,
  gpuRender = true
}: ScrollAnimationContainerProps) {
  
  // Fonction utilitaire pour obtenir les valeurs d'animation en fonction de la direction
  const getDirectionValues = (direction?: AnimationDirection) => {
    if (!direction) return {}; 
    
    switch (direction) {
      case 'fromTop':
        return { y: -30, opacity: 0 }; // Réduction de la distance d'animation
      case 'fromBottom':
        return { y: 30, opacity: 0 };  // Réduction de la distance d'animation
      case 'fromLeft':
        return { x: -30, opacity: 0 }; // Réduction de la distance d'animation
      case 'fromRight':
        return { x: 30, opacity: 0 };  // Réduction de la distance d'animation
      case 'zoomIn':
        return { scale: 0.95, opacity: 0 }; // Zoom moins prononcé
      case 'zoomOut':
        return { scale: 1.05, opacity: 0 }; // Zoom moins prononcé
      default:
        return { opacity: 0 };
    }
  };
  
  // Défaut pour les directions selon le type d'animation
  const getDefaultDirections = (): { enter: AnimationDirection, exit: AnimationDirection } => {
    switch (type) {
      case 'fadeUp':
        return { enter: 'fromBottom', exit: 'fromTop' };
      case 'fadeDown':
        return { enter: 'fromTop', exit: 'fromBottom' };  
      case 'slideLeft':
        return { enter: 'fromRight', exit: 'fromLeft' };
      case 'slideRight':
        return { enter: 'fromLeft', exit: 'fromRight' };
      case 'scale':
        return { enter: 'zoomIn', exit: 'zoomOut' };
      default:
        return { enter: 'fromBottom', exit: 'fromTop' };
    }
  };
  
  // Déterminer les directions d'entrée et de sortie
  const defaultDirections = getDefaultDirections();
  const enterDirection = enterFrom || defaultDirections.enter;
  const exitDirection = exitTo || defaultDirections.exit;
  
  // Utilisation de useMemo pour éviter de recalculer les variants à chaque rendu
  const variants = useMemo((): Variants => {
    // Valeurs pour l'animation d'entrée et de sortie
    const enterValues = getDirectionValues(enterDirection);
    const exitValues = getDirectionValues(exitDirection);
    
    // Optimisations de base 
    const transformOptions = force3d ? { 
      z: 0,  // Force le rendu 3D
      perspective: 1000  // Ajoute une perspective pour améliorer le rendu GPU
    } : {};
    
    // Cas particulier pour les animations staggered
    if (type === 'staggered') {
      return {
        hidden: { 
          opacity: 0,
          ...transformOptions
        },
        visible: { 
          opacity: 1,
          ...transformOptions,
          transition: { 
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
            duration: duration,
            ease: "easeOut"  // Courbe d'animation plus simple et efficace
          }
        },
        exit: { 
          opacity: 0,
          ...transformOptions,
          transition: {
            duration: duration * 0.5,
            ease: "easeIn"  // Courbe d'animation plus simple et efficace
          }
        }
      };
    }
    
    // Pour les autres types d'animation, utiliser les valeurs de direction avec optimisations
    const baseVariants = {
      hidden: { 
        ...enterValues,
        ...transformOptions
      },
      visible: { 
        opacity: 1, 
        x: 0, 
        y: 0, 
        scale: 1,
        ...transformOptions,
        transition: { 
          duration: duration,
          ease: "easeOut",  // Courbe d'animation plus simple et efficace
        }
      },
      exit: { 
        ...exitValues,
        ...transformOptions,
        transition: { 
          duration: duration * 0.5,
          ease: "easeIn",  // Courbe d'animation plus simple et efficace
        }
      }
    };
    
    return baseVariants;
  }, [type, enterDirection, exitDirection, duration, staggerDelay, force3d]);
  
  // Options pour le hook d'intersection observer
  const options = {
    threshold,
    triggerOnce,
    rootMargin,
    delay,
    exitAnimation,
    exitThreshold: 0.1,
    disableOnLowEnd  // Nouvel option pour désactiver sur appareil moins performant
  };
  
  // Préparer les styles optimisés
  const optimizedStyle: CSSProperties = {
    ...(style || {}),
    // Styles d'optimisation conditionnels
    ...(gpuRender ? {
      transform: 'translateZ(0)', // Force l'accélération GPU
      backfaceVisibility: 'hidden' // Optimisation de performance
    } : {})
  };
  
  return (
    <AnimateInView
      variants={variants}
      options={options}
      className={className}
      style={optimizedStyle}
    >
      {children}
    </AnimateInView>
  );
} 