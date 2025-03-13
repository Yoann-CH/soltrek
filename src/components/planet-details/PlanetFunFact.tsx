import { motion } from 'framer-motion';

interface PlanetFunFactProps {
  funFact: string;
  planetName: string;
}

export function PlanetFunFact({ funFact, planetName }: PlanetFunFactProps) {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const quoteVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.2,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const orbitAnimation = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 40,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  return (
    <motion.div 
      variants={variants}
      className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/10 dark:to-purple-900/10 p-6 rounded-xl border border-blue-200/50 dark:border-blue-500/20 relative overflow-hidden shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10"
    >
      {/* Éléments décoratifs d'arrière-plan */}
      <motion.div 
        variants={orbitAnimation} 
        animate="animate"
        className="absolute -top-16 -right-16 w-48 h-48 border border-blue-200/30 dark:border-blue-500/20 rounded-full"
      />
      <motion.div 
        variants={orbitAnimation} 
        animate="animate"
        className="absolute -bottom-20 -left-20 w-56 h-56 border border-purple-200/30 dark:border-purple-500/20 rounded-full"
        style={{ animationDuration: '35s' }}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 text-right"
        >
          <span className="text-xs font-mono text-gray-500 bg-blue-900/10 dark:bg-blue-700/20 px-3 py-1 rounded-md">
            ARCHIVES.SOL_SYSTEM/{planetName.toUpperCase()}/DATA_FRAGMENT_42
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
} 