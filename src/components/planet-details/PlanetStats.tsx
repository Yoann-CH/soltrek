import { motion, useReducedMotion } from 'framer-motion';

interface PlanetStatsProps {
  inclination?: string;
  eccentricity?: string;
  escapeVelocity?: string;
  discoveredBy?: string;
  discoveryDate?: string;
  axialTilt?: string;
}

export function PlanetStats({ 
  inclination, 
  eccentricity, 
  escapeVelocity, 
  discoveredBy, 
  discoveryDate,
  axialTilt
}: PlanetStatsProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Variants d'animation simplifiés pour de meilleures performances
  const itemVariants = {
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

  // Version sans animation pour les utilisateurs préférant les animations réduites
  if (prefersReducedMotion) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-7 w-7 mr-3 text-blue-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Données Orbitales et Historiques
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {inclination && (
            <StatCard 
              label="Inclinaison de l'orbite" 
              value={inclination} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              }
            />
          )}
          
          {eccentricity && (
            <StatCard 
              label="Excentricité" 
              value={eccentricity} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
            />
          )}
          
          {escapeVelocity && (
            <StatCard 
              label="Vitesse de libération" 
              value={escapeVelocity} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          )}
          
          {axialTilt && (
            <StatCard 
              label="Inclinaison de l'axe" 
              value={axialTilt} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              }
            />
          )}
          
          {discoveredBy && discoveredBy !== 'N/A' && (
            <StatCard 
              label="Découvert par" 
              value={discoveredBy} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          )}
          
          {discoveryDate && discoveryDate !== 'N/A' && (
            <StatCard 
              label="Date de découverte" 
              value={discoveryDate} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="mt-12"
      style={{ willChange: 'transform' }}
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-7 w-7 mr-3 text-blue-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        Données Orbitales et Historiques
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {inclination && (
          <StatCard 
            label="Inclinaison de l'orbite" 
            value={inclination} 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            }
          />
        )}
        
        {eccentricity && (
          <StatCard 
            label="Excentricité" 
            value={eccentricity} 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            }
          />
        )}
        
        {escapeVelocity && (
          <StatCard 
            label="Vitesse de libération" 
            value={escapeVelocity} 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        )}
        
        {axialTilt && (
          <StatCard 
            label="Inclinaison de l'axe" 
            value={axialTilt} 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
          />
        )}
        
        {discoveredBy && discoveredBy !== 'N/A' && (
          <StatCard 
            label="Découvert par" 
            value={discoveredBy} 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        )}
        
        {discoveryDate && discoveryDate !== 'N/A' && (
          <StatCard 
            label="Date de découverte" 
            value={discoveryDate} 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        )}
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white/70 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 hover:shadow-md hover:bg-white/90 dark:hover:bg-gray-800/50">
      <div className="flex items-start">
        <div className="mr-3 p-2.5 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-lg text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </h4>
          <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
} 