import { motion, useReducedMotion } from 'framer-motion';

interface PlanetFunFactProps {
  funFact: string;
  planetName: string;
}

export function PlanetFunFact({ funFact, planetName }: PlanetFunFactProps) {
  const prefersReducedMotion = useReducedMotion();

  // Simplification des variants pour améliorer les performances
  const variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const quoteVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  // Utilisation d'une animation CSS pour les orbites plutôt que Framer Motion
  // Cela améliore considérablement les performances

  // Si l'utilisateur préfère les animations réduites, afficher une version simplifiée
  if (prefersReducedMotion) {
    return (
      <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/10 dark:to-purple-900/10 p-6 rounded-xl border border-blue-200/50 dark:border-blue-500/20 relative overflow-hidden shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Archives du Conseil Spatial
          </h3>
          
          <div className="relative">
            <svg 
              className="absolute -top-4 -left-4 h-8 w-8 text-blue-300/30 dark:text-blue-500/20" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-gray-700 dark:text-gray-300 italic relative z-10 pl-6">{funFact}</p>
            <svg 
              className="absolute -bottom-4 -right-4 h-8 w-8 text-purple-300/30 dark:text-purple-500/20 transform rotate-180" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
          
          <div className="mt-4 text-right">
            <span className="text-xs font-mono text-gray-500 bg-blue-900/10 dark:bg-blue-700/20 px-3 py-1 rounded-md">
              ARCHIVES.SOL_SYSTEM/{planetName.toUpperCase()}/DATA_FRAGMENT_42
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={variants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/10 dark:to-purple-900/10 p-6 rounded-xl border border-blue-200/50 dark:border-blue-500/20 relative overflow-hidden shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10 orbit-container"
      style={{ willChange: 'transform' }}
    >
      {/* Éléments décoratifs d'arrière-plan utilisant CSS plutôt que Framer Motion */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 border border-blue-200/30 dark:border-blue-500/20 rounded-full orbit-animation-1"
      />
      <div 
        className="absolute -bottom-20 -left-20 w-56 h-56 border border-purple-200/30 dark:border-purple-500/20 rounded-full orbit-animation-2"
      />
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Archives du Conseil Spatial
        </h3>
        
        <motion.div 
          variants={quoteVariants}
          className="relative"
        >
          <svg 
            className="absolute -top-4 -left-4 h-8 w-8 text-blue-300/30 dark:text-blue-500/20" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-gray-700 dark:text-gray-300 italic relative z-10 pl-6">{funFact}</p>
          <svg 
            className="absolute -bottom-4 -right-4 h-8 w-8 text-purple-300/30 dark:text-purple-500/20 transform rotate-180" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-4 text-right"
        >
          <span className="text-xs font-mono text-gray-500 bg-blue-900/10 dark:bg-blue-700/20 px-3 py-1 rounded-md">
            ARCHIVES.SOL_SYSTEM/{planetName.toUpperCase()}/DATA_FRAGMENT_42
          </span>
        </motion.div>
      </div>

      {/* Ajout des animations CSS dans un style global */}
      <style>
        {`
          .orbit-animation-1 {
            animation: orbit1 40s linear infinite;
            transform-origin: center;
          }
          
          .orbit-animation-2 {
            animation: orbit2 35s linear infinite;
            transform-origin: center;
          }
          
          @keyframes orbit1 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes orbit2 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (prefers-reduced-motion: reduce) {
            .orbit-animation-1, .orbit-animation-2 {
              animation: none;
            }
          }
        `}
      </style>
    </motion.div>
  );
} 