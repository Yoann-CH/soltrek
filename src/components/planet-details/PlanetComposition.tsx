import { motion, useReducedMotion } from 'framer-motion';

interface PlanetCompositionProps {
  composition: string[];
}

export function PlanetComposition({ composition }: PlanetCompositionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Variants d'animation simplifiés pour de meilleures performances
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04, // Réduit le délai entre les éléments
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Version simplifiée sans animations pour préférences d'accessibilité réduites
  if (prefersReducedMotion) {
    return (
      <div className="mb-8 bg-gradient-to-br from-blue-50/20 to-purple-50/20 dark:from-blue-900/5 dark:to-purple-900/5 p-5 rounded-xl border border-blue-200/30 dark:border-blue-500/10 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-5 uppercase tracking-wider font-mono border-l-4 border-blue-500 pl-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Composition de l'atmosphère
        </h3>
        <div className="flex flex-wrap gap-3">
          {composition.map((element, index) => (
            <div
              key={element}
              className="px-4 py-2 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/60 dark:border-blue-500/30 rounded-md text-sm font-medium relative overflow-hidden group"
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-100/0 to-purple-100/0 group-hover:from-blue-100/50 group-hover:to-purple-100/50 dark:from-blue-600/0 dark:to-purple-600/0 dark:group-hover:from-blue-600/20 dark:group-hover:to-purple-600/20 transition-all duration-300"
                style={{ mixBlendMode: 'overlay' }}
              />
              <div className="relative z-10 flex items-center">
                <span className="flex justify-center items-center w-6 h-6 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono mr-2 text-xs">
                  {index + 1}
                </span>
                <span className="text-gray-900 dark:text-gray-100">{element}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden"
      animate="visible"
      className="mb-8 bg-gradient-to-br from-blue-50/20 to-purple-50/20 dark:from-blue-900/5 dark:to-purple-900/5 p-5 rounded-xl border border-blue-200/30 dark:border-blue-500/10 backdrop-blur-sm"
      style={{ willChange: 'transform' }}
    >
      <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-5 uppercase tracking-wider font-mono border-l-4 border-blue-500 pl-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        Composition de l'atmosphère
      </h3>
      <motion.div className="flex flex-wrap gap-3">
        {composition.map((element, index) => (
          <motion.div
            key={element}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03,
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              boxShadow: '0 4px 8px rgba(59, 130, 246, 0.1)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="px-4 py-2 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/60 dark:border-blue-500/30 rounded-md text-sm font-medium relative overflow-hidden group"
          >
            <div 
              className="absolute inset-0 bg-gradient-to-r from-blue-100/0 to-purple-100/0 group-hover:from-blue-100/50 group-hover:to-purple-100/50 dark:from-blue-600/0 dark:to-purple-600/0 dark:group-hover:from-blue-600/20 dark:group-hover:to-purple-600/20 transition-all duration-300"
              style={{ mixBlendMode: 'overlay' }}
            />
            <div className="relative z-10 flex items-center">
              <span className="flex justify-center items-center w-6 h-6 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono mr-2 text-xs">
                {index + 1}
              </span>
              <span className="text-gray-900 dark:text-gray-100">{element}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
} 