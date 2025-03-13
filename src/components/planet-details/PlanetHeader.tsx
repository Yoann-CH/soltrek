import { motion } from 'framer-motion';

interface PlanetHeaderProps {
  planetName: string;
  description: string;
  moons: number;
  bodyType: string;
}

export function PlanetHeader({ planetName, description, moons, bodyType }: PlanetHeaderProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <>
      <motion.div 
        variants={itemVariants}
        className="flex items-center mb-6"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {planetName.charAt(0).toUpperCase() + planetName.slice(1)}
        </h1>
        <div className="ml-4 px-3 py-1 bg-blue-100/80 dark:bg-blue-900/30 border border-blue-300/80 dark:border-blue-500/30 rounded-full text-xs font-mono text-blue-800 dark:text-blue-400">
          ID: {planetName.toUpperCase()}-{Math.floor(Math.random() * 1000)}
        </div>
      </motion.div>
      
      <motion.div
        variants={itemVariants}
        className="mb-8 relative"
      >
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
        <p className="text-xl text-gray-700 dark:text-gray-300 pl-4">
          {description}
        </p>
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        className="mb-10"
      >
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="px-3 py-1 bg-blue-100/80 dark:bg-blue-900/20 border border-blue-300/80 dark:border-blue-500/30 rounded-full text-xs font-mono text-blue-800 dark:text-blue-400">
            CORPS: {bodyType?.toUpperCase() || 'PLANÈTE'}
          </div>
          {moons > 0 && (
            <div className="px-3 py-1 bg-purple-100/80 dark:bg-purple-900/20 border border-purple-300/80 dark:border-purple-500/30 rounded-full text-xs font-mono text-purple-800 dark:text-purple-400">
              LUNES: {moons}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
} 