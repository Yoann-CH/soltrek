import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PlanetNavigationProps {
  planetNames: Record<string, string>;
  currentPlanet: string;
}

export function PlanetNavigation({ planetNames, currentPlanet }: PlanetNavigationProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const planetEntries = Object.keys(planetNames);

  return (
    <motion.div
      variants={containerVariants}
      className="mt-12 p-6 bg-gradient-to-br from-blue-50/60 to-purple-50/60 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200/50 dark:border-blue-500/20 backdrop-blur-sm"
    >
      <h3 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Explorer d'autres planètes
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {planetEntries.map(planetFrName => {
          const isActive = currentPlanet === planetFrName;
          
          return (
            <motion.div 
              key={planetFrName}
              variants={itemVariants}
              whileHover={{ 
                y: -6, 
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <Link 
                to={`/explore/${planetFrName}`}
                className={`relative block p-4 text-center rounded-lg group ${
                  isActive 
                    ? 'bg-gradient-to-br from-blue-600/90 to-purple-600/90 text-white cursor-default' 
                    : 'bg-gradient-to-br from-white/60 to-white/60 hover:from-blue-50/90 hover:to-purple-50/90 dark:from-blue-900/20 dark:to-purple-900/20 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 text-gray-900 dark:text-gray-200 hover:text-gray-900 hover:dark:text-white'
                } transition-all duration-300 border ${
                  isActive
                    ? 'border-blue-400/50 dark:border-purple-400/50'
                    : 'border-blue-200/40 dark:border-blue-500/20 hover:border-blue-300/50 dark:hover:border-blue-400/30'
                } shadow-sm hover:shadow-md overflow-hidden`}
                aria-disabled={isActive}
                tabIndex={isActive ? -1 : undefined}
              >
                <div className="relative z-10">
                  {!isActive && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/10 -z-10" 
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div className={`font-bold text-base mb-1 capitalize ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                    {planetFrName}
                  </div>
                  
                  <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isActive ? 'Actuel' : 'Explorer'}
                  </div>
                </div>
                
                {isActive && (
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/40"></div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
} 