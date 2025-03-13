import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// Interface pour le type Planet
interface Planet {
  size: number;
  baseColor: string;
  highlightColor: string;
  shadowColor: string;
  posX: number;
  posY: number;
  speed: number;
  glow: string;
  craters: number;
  craterDetails?: Array<{
    size: number;
    x: number;
    y: number;
  }>;
  rings: boolean;
  ringColor?: string;
  pulse: number;
}

interface SpaceBackgroundProps {
  starCount?: number;
  planetCount?: number;
  showNebulae?: boolean;
  enableParallax?: boolean;
}

export default function SpaceBackground({
  starCount = 150,
  planetCount = 3,
  showNebulae = false,
  enableParallax = true
}: SpaceBackgroundProps) {
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number; delay: number }[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Génération des étoiles scintillantes pour le background
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      
      // Créer des étoiles avec une distribution qui favorise les marges gauche et droite
      for (let i = 0; i < starCount; i++) {
        let x;
        
        // 70% des étoiles sur les côtés, 30% partout ailleurs
        if (Math.random() < 0.7) {
          // Placer les étoiles sur les côtés (0-15% ou 85-100% de la largeur)
          x = Math.random() < 0.5 
            ? Math.random() * 15 // Côté gauche
            : Math.random() * 15 + 85; // Côté droit
        } else {
          // Distribuer le reste des étoiles uniformément
          x = Math.random() * 100;
        }
        
        newStars.push({
          x: x,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5, // Taille réduite pour optimisation
          opacity: Math.random() * 0.7 + 0.3,
          delay: Math.random() * 5
        });
      }
      
      setStars(newStars);
    };
    
    generateStars();
    
    // Effet de parallaxe pour le mouvement du fond
    if (enableParallax) {
      // Détecter si l'appareil est mobile
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      
      // Ne pas appliquer le parallaxe sur mobile pour éviter les problèmes de défilement
      if (isMobile) return;
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!parallaxRef.current) return;
        
        const parallaxElements = parallaxRef.current.querySelectorAll('.parallax-element');
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        parallaxElements.forEach((el) => {
          const depth = parseFloat((el as HTMLElement).dataset.depth || '5');
          const moveX = mouseX * depth * -1;
          const moveY = mouseY * depth * -1;
          (el as HTMLElement).style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        });
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [starCount, enableParallax]);

  // Génération des planètes avec positions fixes
  useEffect(() => {
    // Seulement générer les planètes si elles sont demandées
    if (planetCount <= 0) return;
    
    // Liste des couleurs pour les planètes
    const colorSets = [
      { 
        base: '#ff5757', 
        highlight: '#ff8a8a', 
        shadow: '#b30000',
        glow: '#ff0000'
      },
      {
        base: '#4da6ff',
        highlight: '#a6d3ff',
        shadow: '#0057a6',
        glow: '#0057ff'
      },
      {
        base: '#ffa64d',
        highlight: '#ffc180',
        shadow: '#b35900',
        glow: '#ff8800'
      },
      {
        base: '#a64dff',
        highlight: '#c894ff',
        shadow: '#5c0099',
        glow: '#8000ff'
      },
      {
        base: '#4dff9e',
        highlight: '#b8ffdb',
        shadow: '#00994d',
        glow: '#00cc66'
      }
    ];
    
    // Positions prédéfinies pour les marges gauche et droite uniquement
    const positions = [
      // Côté gauche - petites planètes
      { x: Math.random() * 10 + 1, y: Math.random() * 20 + 15 },
      { x: Math.random() * 8 + 2, y: Math.random() * 20 + 50 },
      { x: Math.random() * 10 + 1, y: Math.random() * 20 + 75 },
      
      // Côté droit - grandes planètes
      { x: Math.random() * 10 + 85, y: Math.random() * 20 + 20 },
      { x: Math.random() * 8 + 88, y: Math.random() * 20 + 60 }
    ];
    
    // Générer seulement le nombre demandé de planètes
    const generatedPlanets = Array.from({ length: Math.min(planetCount, 5) }, (_, i) => {
      const colorSet = colorSets[i % colorSets.length];
      const position = positions[i % positions.length];
      const isLeftSide = position.x < 15; // Si la planète est sur le côté gauche
      
      return { 
        // Planètes plus petites à gauche, plus grandes à droite
        size: isLeftSide ? 25 + Math.random() * 35 : 40 + Math.random() * 60,
        baseColor: colorSet.base, 
        highlightColor: colorSet.highlight, 
        shadowColor: colorSet.shadow, 
        posX: position.x, 
        posY: position.y, 
        speed: 120 + Math.random() * 60, 
        glow: colorSet.glow, 
        craters: Math.floor(Math.random() * 5) + 1,
        rings: Math.random() > 0.5,
        ringColor: Math.random() > 0.5 ? `rgba(160, 215, 255, 0.3)` : `rgba(255, 180, 120, 0.2)`,
        pulse: 1 + Math.random() * 0.04
      };
    });

    // Pré-calculer les détails des cratères pour chaque planète (pour optimisation)
    const planetsWithCraters = generatedPlanets.map(planet => {
      if (planet.craters > 0) {
        const craterDetails = [];
        for (let i = 0; i < planet.craters; i++) {
          const size = planet.size * (0.05 + Math.random() * 0.1);
          const angle = (i / planet.craters) * 360;
          const distance = planet.size * 0.3 * Math.random();
          const x = Math.cos(angle * Math.PI / 180) * distance + (planet.size / 2) - (size / 2);
          const y = Math.sin(angle * Math.PI / 180) * distance + (planet.size / 2) - (size / 2);
          
          craterDetails.push({ size, x, y });
        }
        return { ...planet, craterDetails };
      }
      return planet;
    });

    setPlanets(planetsWithCraters);
  }, [planetCount]);

  // Nébuleuses pour l'arrière-plan
  const nebulae = [
    { 
      position: { top: '15%', right: '85%', width: '25%', height: '35%' }, 
      colors: ['rgba(76, 0, 153, 0.12)', 'rgba(138, 43, 226, 0.06)', 'rgba(148, 0, 211, 0.02)'],
      blur: '100px',
      rotate: 15,
      animation: { scale: [1, 1.05, 1], opacity: [0.6, 0.4, 0.6], duration: 30 }
    },
    { 
      position: { top: '50%', left: '85%', width: '30%', height: '40%' }, 
      colors: ['rgba(255, 80, 80, 0.08)', 'rgba(255, 0, 0, 0.05)', 'rgba(139, 0, 0, 0.02)'],
      blur: '110px',
      rotate: -20,
      animation: { scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4], duration: 40, delay: 5 }
    },
    { 
      position: { bottom: '10%', left: '0%', width: '20%', height: '25%' }, 
      colors: ['rgba(0, 191, 255, 0.08)', 'rgba(30, 144, 255, 0.05)', 'rgba(0, 0, 139, 0.02)'],
      blur: '90px',
      rotate: 30,
      animation: { scale: [1, 1.04, 1], opacity: [0.5, 0.7, 0.5], duration: 25, delay: 10 }
    }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Fond d'espace profond avec dégradé subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0a0a12] opacity-95"></div>
      
      {/* Nébuleuses */}
      {showNebulae && nebulae.map((nebula, index) => (
        <motion.div
          key={`nebula-${index}`}
          className="absolute parallax-element rounded-full"
          data-depth={`${(index + 1) * 2}`}
          style={{
            top: nebula.position.top,
            right: nebula.position.right,
            bottom: nebula.position.bottom,
            left: nebula.position.left,
            width: nebula.position.width,
            height: nebula.position.height,
            background: `radial-gradient(circle at center, ${nebula.colors[0]} 0%, ${nebula.colors[1]} 40%, ${nebula.colors[2]} 70%, transparent 100%)`,
            filter: `blur(${nebula.blur})`,
            transform: `rotate(${nebula.rotate}deg)`,
          }}
          animate={{
            scale: nebula.animation.scale,
            opacity: nebula.animation.opacity,
          }}
          transition={{
            duration: nebula.animation.duration,
            ease: "easeInOut",
            repeat: Infinity,
            delay: nebula.animation.delay || 0,
          }}
        />
      ))}
      
      {/* Container avec effet parallaxe */}
      <div ref={parallaxRef} className="absolute inset-0 overflow-hidden">
        {/* Étoiles scintillantes */}
        <div className="absolute inset-0">
          {stars.map((star, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.7)` : 'none',
              }}
              animate={{
                opacity: [star.opacity, star.opacity * 0.3, star.opacity]
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                delay: star.delay
              }}
            />
          ))}
        </div>
        
        {/* Planètes avec textures améliorées */}
        {planets.map((planet, index) => (
          <motion.div 
            key={index}
            className="absolute parallax-element rounded-full shadow-2xl overflow-hidden"
            data-depth={(10 - index * 2).toString()}
            style={{
              left: `${planet.posX}%`,
              top: `${planet.posY}%`,
              width: `${planet.size}px`,
              height: `${planet.size}px`,
              boxShadow: `0 0 ${planet.size / 2}px ${planet.glow}`,
            }}
            animate={{
              rotate: 360,
              scale: [1, planet.pulse, 1]
            }}
            transition={{
              rotate: {
                duration: planet.speed,
                ease: "linear",
                repeat: Infinity
              },
              scale: {
                duration: 15,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          >
            {/* Surface de la planète avec dégradé */}
            <div 
              className="absolute inset-0 rounded-full" 
              style={{
                background: `radial-gradient(circle at 30% 30%, 
                  ${planet.highlightColor} 0%, 
                  ${planet.baseColor} 35%, 
                  ${planet.shadowColor} 80%)`
              }}
            />
            
            {/* Texture de la planète */}
            <div 
              className="absolute inset-0 rounded-full opacity-20" 
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 95%)`,
                transform: "scale(1.01)"
              }}
            />
            
            {/* Cratères pour les planètes */}
            {planet.craterDetails?.map((crater, i) => (
              <div 
                key={`crater-${index}-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${crater.size}px`,
                  height: `${crater.size}px`,
                  left: `${crater.x}px`,
                  top: `${crater.y}px`,
                  background: `radial-gradient(circle at center, 
                    ${planet.shadowColor}aa 10%, 
                    ${planet.shadowColor}55 60%, 
                    transparent 100%)`
                }}
              />
            ))}
            
            {/* Anneaux pour les planètes qui en ont */}
            {planet.rings && (
              <div 
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${planet.size * 1.8}px`,
                  height: `${planet.size * 0.2}px`,
                  left: `${-planet.size * 0.4}px`,
                  top: `${planet.size * 0.4}px`,
                  background: planet.ringColor || 'rgba(255, 255, 255, 0.2)',
                  transform: 'rotate(30deg)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                  zIndex: -1
                }}
              />
            )}
            
            {/* Lumière sur la planète */}
            <div 
              className="absolute rounded-full opacity-60" 
              style={{
                width: `${planet.size * 0.4}px`,
                height: `${planet.size * 0.4}px`,
                left: `${planet.size * 0.1}px`,
                top: `${planet.size * 0.1}px`,
                background: `radial-gradient(circle at center, 
                  rgba(255,255,255,0.7) 0%, 
                  transparent 100%)`
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 