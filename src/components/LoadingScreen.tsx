import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

// Interface pour stocker les propriétés des étoiles
interface Star {
  id: number;
  size: number;
  left: string;
  top: string;
  boxShadow: string;
  animationDuration: number;
  animationDelay: number;
  initialOpacity: number;
  initialScale: number;
}

// Fonction utilitaire pour générer les étoiles (en dehors du composant)
const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }).map((_, index) => {
    const size = Math.random() * 3 + 1;
    const initialOpacity = 0.2 + Math.random() * 0.6;
    const initialScale = 0.9 + Math.random() * 0.3;
    
    return {
      id: index,
      size,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      boxShadow: size > 2 ? `0 0 ${size}px rgba(255, 255, 255, 0.7)` : 'none',
      animationDuration: 2 + Math.random() * 3,
      animationDelay: Math.random() * 2,
      initialOpacity,
      initialScale
    };
  });
};

// Générer les étoiles une seule fois globalement (en dehors des rendus)
const FIXED_STARS = generateStars(30);

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Utiliser les étoiles pré-générées
  const stars = FIXED_STARS;
  
  // Simulation forcée de chargement complet (garantie supplémentaire)
  useEffect(() => {
    // Forcer le chargement complet après 4 secondes maximum (réduit de 8 secondes)
    const forceCompleteTimeout = setTimeout(() => {
      setProgress(100);
      
      // Assurer une transition douce vers 100%
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
      
      completionTimeoutRef.current = setTimeout(() => {
        setIsComplete(true);
        if (onLoadingComplete) onLoadingComplete();
      }, 600); // Réduit de 1200ms à 600ms
      
    }, 4000); // Réduit de 8000ms à 4000ms
    
    return () => {
      clearTimeout(forceCompleteTimeout);
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [onLoadingComplete]);

  // Simulation principale du chargement avec augmentation progressive
  useEffect(() => {
    // Ne pas lancer une nouvelle simulation si on est déjà à 100%
    if (progress >= 100) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        // Incréments plus importants pour accélérer la progression
        let increment;
        
        if (prev < 60) {
          // Phase 1: Progression très rapide jusqu'à 60%
          increment = 4 + Math.random() * 5; // Augmenté de 2-5 à 4-9
        } else if (prev < 85) {
          // Phase 2: Ralentissement léger entre 60% et 85%
          increment = 2 + Math.random() * 3; // Augmenté de 1-2.5 à 2-5
        } else if (prev < 95) {
          // Phase 3: Approche modérée entre 85% et 95%
          increment = 1 + Math.random() * 1.5; // Augmenté de 0.5-1.3 à 1-2.5
        } else {
          // Phase 4: Dernière étape
          increment = 0.5 + Math.random() * 0.8; // Légèrement plus rapide
        }
        
        // Calculer la nouvelle valeur de progression
        const newProgress = Math.min(100, prev + increment);
        
        // Si on atteint 100%, programmer la fin de l'animation
        if (Math.round(newProgress) >= 100) {
          clearInterval(interval);
          
          // S'assurer d'être exactement à 100%
          const finalValue = 100;
          
          // Attendre avant de masquer l'écran de chargement
          if (completionTimeoutRef.current) {
            clearTimeout(completionTimeoutRef.current);
          }
          
          completionTimeoutRef.current = setTimeout(() => {
            setIsComplete(true);
            if (onLoadingComplete) onLoadingComplete();
          }, 800); // Réduit de 1500ms à 800ms
          
          return finalValue;
        }
        
        return newProgress;
      });
    }, 50); // Mise à jour plus fréquente: réduit de 80ms à 50ms

    return () => {
      clearInterval(interval);
    };
  }, [progress, onLoadingComplete]);

  // Animation de sortie
  const containerVariants = {
    visible: { opacity: 1 },
    hidden: { 
      opacity: 0,
      transition: { 
        duration: 0.5, // Réduit de 0.8s à 0.5s
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020515]"
      variants={containerVariants}
      initial="visible"
      animate={isComplete ? "hidden" : "visible"}
      style={{ pointerEvents: isComplete ? 'none' : 'auto' }}
    >
      {/* Planète qui tourne */}
      <div className="relative mb-10">
        <motion.div
          className="w-28 h-28 rounded-full bg-blue-500"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #a6d3ff 0%, #4da6ff 40%, #0057a6 80%)',
            boxShadow: '0 0 20px #0057ff'
          }}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity 
          }}
        >
          {/* Point lumineux sur la planète */}
          <div 
            className="absolute w-4 h-4 rounded-full bg-white opacity-70"
            style={{
              top: '20%',
              left: '20%',
              boxShadow: '0 0 10px rgba(255,255,255,0.8)'
            }}
          />
        </motion.div>
        
        {/* Anneau autour de la planète - version corrigée avec un vrai cercle */}
        <div className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 15, 
              ease: "linear", 
              repeat: Infinity 
            }}
          >
            <div className="w-full h-full rounded-full border-4 border-blue-400/30"
                 style={{ 
                   transform: 'rotateX(70deg)',
                   borderTopColor: 'transparent',
                   borderBottomColor: 'transparent'
                 }} 
            />
          </motion.div>
        </div>
        
        {/* Satellite en orbite */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: -360 }}
          transition={{ 
            duration: 5, 
            ease: "linear", 
            repeat: Infinity 
          }}
        >
          <motion.div
            className="absolute w-5 h-5 rounded-full bg-white"
            style={{
              top: '-10px',
              left: 'calc(50% - 2.5px)',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
            }}
          />
        </motion.div>
      </div>
      
      {/* Texte "Chargement" avec animation lettre par lettre */}
      <div className="mb-6 flex items-center justify-center">
        <h2 className="text-xl text-white font-light tracking-widest">
          {"CHARGEMENT".split('').map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            >
              {char}
            </motion.span>
          ))}
        </h2>
      </div>
      
      {/* Barre de progression */}
      <div className="w-64 md:w-80 h-2 bg-gray-800/50 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.2 }} // Réduit de 0.3s à 0.2s
        />
      </div>
      
      {/* Pourcentage */}
      <div className="text-blue-300 text-sm font-mono">{Math.floor(progress)}%</div>
      
      {/* Étoiles qui scintillent en arrière-plan (positions fixes) */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: star.left,
            top: star.top,
            boxShadow: star.boxShadow,
            opacity: star.initialOpacity,
            scale: star.initialScale
          }}
          animate={{
            opacity: [star.initialOpacity, 0.8, star.initialOpacity],
            scale: [star.initialScale, 1.2, star.initialScale]
          }}
          transition={{
            duration: star.animationDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.animationDelay,
            repeatDelay: 0
          }}
        />
      ))}
    </motion.div>
  );
} 