import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanetFeatures, PlanetFeature } from '../../lib/api';

interface FeatureCardProps {
  feature: PlanetFeature;
  index: number;
}

const featureVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95 
  },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    } 
  }),
  hover: { 
    y: -5, 
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: { 
    scale: 0.98,
    boxShadow: "0 5px 15px -5px rgba(59, 130, 246, 0.2)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  }
};

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Déterminer quelle mesure afficher en fonction du type de caractéristique
  const getMeasurement = () => {
    if (feature.diameter) {
      return `Diamètre: ${feature.diameter.toLocaleString('fr-FR')} km`;
    } else if (feature.height) {
      return `Hauteur: ${feature.height.toLocaleString('fr-FR')} km`;
    } else if (feature.depth) {
      return `Profondeur: ${feature.depth.toLocaleString('fr-FR')} km`;
    } else if (feature.length) {
      return `Longueur: ${feature.length.toLocaleString('fr-FR')} km`;
    }
    return null;
  };

  // Déterminer l'icône en fonction du type
  const getIcon = () => {
    switch (feature.type) {
      case 'crater':
        return '🌑'; // Cratère
      case 'volcano':
        return '🌋'; // Volcan
      case 'mountain':
        return '⛰️'; // Montagne
      case 'canyon':
        return '🏜️'; // Canyon
      case 'ocean_trench':
        return '🌊'; // Fosse océanique
      case 'storm':
        return '🌪️'; // Tempête
      case 'ring':
        return '💍'; // Anneau
      default:
        return '🪐'; // Par défaut
    }
  };

  // Déterminer la couleur du badge en fonction du type
  const getBadgeColor = () => {
    switch (feature.type) {
      case 'crater':
        return 'bg-gray-600 dark:bg-gray-700';
      case 'volcano':
        return 'bg-red-600 dark:bg-red-700';
      case 'mountain':
        return 'bg-green-600 dark:bg-green-700';
      case 'canyon':
        return 'bg-amber-600 dark:bg-amber-700';
      case 'ocean_trench':
        return 'bg-blue-600 dark:bg-blue-700';
      case 'storm':
        return 'bg-purple-600 dark:bg-purple-700';
      case 'ring':
        return 'bg-indigo-600 dark:bg-indigo-700';
      default:
        return 'bg-blue-600 dark:bg-blue-700';
    }
  };

  // Traduire le type en français
  const getTypeInFrench = (type: string) => {
    switch (type) {
      case 'crater':
        return 'Cratère';
      case 'volcano':
        return 'Volcan';
      case 'mountain':
        return 'Montagne';
      case 'canyon':
        return 'Canyon';
      case 'ocean_trench':
        return 'Fosse océanique';
      case 'storm':
        return 'Tempête';
      case 'ring':
        return 'Anneau';
      default:
        return 'Point d\'intérêt';
    }
  };

  return (
    <motion.div 
      className="relative bg-gray-50/50 dark:bg-gray-900/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm h-fit"
      variants={featureVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={() => setIsExpanded(!isExpanded)}
      custom={index}
    >
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden rounded-xl opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/5 dark:from-blue-500/10 dark:to-purple-500/5"></div>
      </div>
      
      <div className="p-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getBadgeColor()} shadow-lg text-white`}>
              <span className="text-xl">{getIcon()}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{feature.name}</h3>
              <span className="inline-block text-xs rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mt-1">
                {getTypeInFrench(feature.type)}
              </span>
            </div>
          </div>
          
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            initial={{ rotate: 0 }}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
        
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.p 
              key="summary"
              className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {feature.description}
            </motion.p>
          ) : (
            <motion.div 
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-3"
            >
              <div className="h-0.5 w-full bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-blue-600/20 dark:from-blue-500/20 dark:via-purple-500/30 dark:to-blue-500/20 rounded-full mb-4"></div>
              
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  {getMeasurement() && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      {getMeasurement()}
                    </div>
                  )}
                  
                  {feature.discoveredBy && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Découvert par: {feature.discoveredBy}
                    </div>
                  )}
                  
                  {feature.discoveryDate && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Découvert en {feature.discoveryDate}
                    </div>
                  )}
                </div>
                
                <div>
                  {feature.coordinates && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Coordonnées: {feature.coordinates.lat.toFixed(2)}°, {feature.coordinates.lng.toFixed(2)}°
                    </div>
                  )}
                </div>
              </div>
              
              {feature.imageUrl && (
                <motion.div 
                  className="mt-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <img 
                    src={feature.imageUrl} 
                    alt={feature.name} 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Image: {feature.name}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export function PlanetFeatures({ planetName }: { planetName: string }) {
  const { features, loading, error } = usePlanetFeatures(planetName);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };
  
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded w-2/5 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-36 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Points d'intérêt</h2>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-200">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-bold">Erreur de connexion</p>
          </div>
          <p className="text-sm">
            Impossible de charger les caractéristiques: {error.message}
          </p>
        </div>
      </div>
    );
  }
  
  if (features.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Points d'intérêt</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-blue-500 dark:text-blue-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Aucune donnée disponible</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nous n'avons pas encore d'informations sur les points d'intérêt pour {planetName}.
            <br />Notre équipe d'exploration continue ses recherches.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Effet de fond subtil */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 dark:from-blue-500/10 dark:via-transparent dark:to-purple-500/10"></div>
        <div className="absolute top-0 right-0 w-1/3 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
      </div>
      
      <div className="relative z-10">
        <motion.div variants={titleVariants} className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Points d'intérêt
          </h2>
          <div className="h-1 w-20 bg-blue-500 rounded-full mt-2"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
} 