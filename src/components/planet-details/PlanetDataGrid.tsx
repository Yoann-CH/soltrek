import { motion } from 'framer-motion';

interface PlanetDataGridProps {
  diameter: string;
  distance: string;
  dayLength: string;
  yearLength: string;
  mass: string;
  temperature: string;
  density: string;
  gravity: string;
}

// Fonction pour formater les grandes valeurs numériques
const formatLargeNumber = (value: string): string => {
  // Si la valeur contient "milliards kg"
  if (value.includes('milliards kg')) {
    // Extraire la partie numérique et nettoyer
    const numPart = value.replace(/milliards kg|\.00/g, '').trim();
    const cleanNum = numPart.replace(/,/g, '').replace(/\s+/g, '');
    const num = parseFloat(cleanNum);
    
    if (isNaN(num)) return value;
    
    // Pour les nombres extrêmement grands (plus de 9 chiffres), utiliser la notation scientifique
    if (num >= 1e9) {
      const exponent = Math.floor(Math.log10(num));
      const mantissa = num / Math.pow(10, exponent);
      const formattedMantissa = mantissa.toFixed(2);
      
      return `${formattedMantissa} × 10^${exponent} kg`;
    }
    
    // Pour les nombres entre 1 million et 1 milliard
    if (num >= 1e6) {
      const billions = (num / 1e6).toFixed(2);
      return `${billions} quintillions kg`;
    }
    
    // Pour les nombres entre 1000 et 1 million
    if (num >= 1e3) {
      const trillions = (num / 1e3).toFixed(2);
      return `${trillions} quadrillions kg`;
    }
  }
  
  // Dans tous les autres cas, retourner la valeur originale
  return value;
};

export function PlanetDataGrid({ 
  diameter, 
  distance, 
  dayLength, 
  yearLength, 
  mass, 
  temperature,
  density,
  gravity 
}: PlanetDataGridProps) {
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
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
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Formater la masse pour l'affichage
  const formattedMass = formatLargeNumber(mass);

  return (
    <motion.div 
      variants={gridVariants}
      className="relative"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-500/20 backdrop-blur-sm overflow-hidden">
        {/* Effet de bordure gauche qui respecte la courbure */}
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent rounded-l-xl"></div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
          <DataItem 
            label="Diamètre" 
            value={diameter} 
            color="blue"
          />
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
          <DataItem 
            label="Distance du Soleil" 
            value={distance}
            color="blue" 
          />
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
          <DataItem 
            label="Durée du jour" 
            value={dayLength}
            color="purple" 
          />
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
          <DataItem 
            label="Durée de l'année" 
            value={yearLength}
            color="purple" 
          />
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
          <DataItem 
            label="Masse" 
            value={formattedMass}
            color="blue"
            isLargeValue={formattedMass !== mass}
          />
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
          <DataItem 
            label="Température moyenne" 
            value={temperature}
            color="blue" 
          />
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
          <DataItem 
            label="Densité" 
            value={density}
            color="purple" 
          />
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
          <DataItem 
            label="Gravité de surface" 
            value={gravity}
            color="purple" 
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

interface DataItemProps {
  label: string;
  value: string;
  color: 'blue' | 'purple';
  isLargeValue?: boolean;
}

function DataItem({ label, value, color, isLargeValue = false }: DataItemProps) {
  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400"
  };
  
  // Vérifier si la valeur contient une notation scientifique
  const hasScientificNotation = value.includes('×') && value.includes('10^');
  
  return (
    <div className="relative overflow-hidden group">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/10 dark:group-hover:from-blue-500/10 dark:group-hover:to-purple-500/20 transition-all duration-500 rounded-lg -z-10"></div>
      <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-blue-500/5 dark:bg-blue-500/10 filter blur-md transition-all duration-700 group-hover:scale-150"></div>
      
      <div className={`text-xs font-semibold uppercase tracking-wider font-mono ${colorClasses[color]} mb-1`}>
        {label}
      </div>
      
      {hasScientificNotation ? (
        <div className={`${isLargeValue ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 dark:text-gray-100 break-words`}>
          {value.split('×')[0].trim()} 
          <span className="inline-flex items-center">
            × 10
            <sup className="text-sm ml-0.5">{value.split('10^')[1].split(' ')[0]}</sup>
          </span>
          <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">kg</span>
        </div>
      ) : (
        <div className={`${isLargeValue ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 dark:text-gray-100 break-words`}>
          {value}
        </div>
      )}
    </div>
  );
} 