import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useLoading } from '../lib/loadingContext';

// Définition du type Planet
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

export default function HomePage() {
  const navigate = useNavigate();
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number; delay: number }[]>([]);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const { appLoaded } = useLoading();
  const [planets, setPlanets] = useState<Planet[]>([]);

  // Génération des étoiles scintillantes pour le background
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      const starCount = 250;
      
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.7 + 0.3,
          delay: Math.random() * 5
        });
      }
      
      setStars(newStars);
    };
    
    generateStars();
    
    // Effet de parallaxe avancé
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

      // Effet parallaxe subtil sur le texte principal
      if (letterRef.current) {
        letterRef.current.style.transform = `translate3d(${mouseX * -15}px, ${mouseY * -15}px, 0)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Génération des planètes avec positions fixes
  useEffect(() => {
    // Planètes pour l'arrière-plan avec textures améliorées et positions aléatoires mais fixées
    const generatedPlanets = [
      { 
        size: 120, 
        baseColor: '#ff5757', 
        highlightColor: '#ff8a8a', 
        shadowColor: '#b30000', 
        posX: Math.random() * 25 + 5, // Position aléatoire dans le quadrant gauche supérieur
        posY: Math.random() * 25 + 60, 
        speed: 120 + Math.random() * 40, 
        glow: '#ff0000', 
        craters: 7,
        rings: false,
        pulse: 1.02
      },
      { 
        size: 80, 
        baseColor: '#4da6ff', 
        highlightColor: '#a6d3ff', 
        shadowColor: '#0057a6', 
        posX: Math.random() * 25 + 65, // Position aléatoire dans le quadrant droit supérieur
        posY: Math.random() * 25 + 10, 
        speed: 150 + Math.random() * 40, 
        glow: '#0057ff', 
        craters: 4,
        rings: true,
        ringColor: 'rgba(160, 215, 255, 0.3)',
        pulse: 1.03
      },
      { 
        size: 50, 
        baseColor: '#ffa64d', 
        highlightColor: '#ffc180', 
        shadowColor: '#b35900', 
        posX: Math.random() * 25 + 70, // Position aléatoire dans le quadrant droit inférieur
        posY: Math.random() * 25 + 65, 
        speed: 180 + Math.random() * 40, 
        glow: '#ff8800', 
        craters: 3,
        rings: false,
        pulse: 1.02
      },
      { 
        size: 35, 
        baseColor: '#a64dff', 
        highlightColor: '#c894ff', 
        shadowColor: '#5c0099', 
        posX: Math.random() * 25 + 10, // Position aléatoire dans le quadrant gauche inférieur
        posY: Math.random() * 25 + 10, 
        speed: 100 + Math.random() * 40, 
        glow: '#8000ff', 
        craters: 2,
        rings: false,
        pulse: 1.04
      },
      { // Nouvelle planète dans la zone centrale
        size: 40, 
        baseColor: '#4dff9e', 
        highlightColor: '#b8ffdb', 
        shadowColor: '#00994d', 
        posX: Math.random() * 20 + 40, // Position aléatoire au centre
        posY: Math.random() * 20 + 40, 
        speed: 160 + Math.random() * 50, 
        glow: '#00cc66', 
        craters: 5,
        rings: true,
        ringColor: 'rgba(77, 255, 158, 0.2)',
        pulse: 1.025
      },
    ];

    // Pré-calculer les détails des cratères pour chaque planète
    const planetsWithCraters = generatedPlanets.map(planet => {
      // Créer les détails des cratères si la planète a des cratères
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
  }, []); // Dépendance vide pour ne générer qu'une seule fois au montage

  // Animation variants pour le fade-in
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const textCharacterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        delay: custom * 0.06
      }
    })
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        delay: 0.7
      }
    },
    hover: { 
      scale: 1.05, 
      boxShadow: "0 0 35px rgba(138, 43, 226, 0.9)",
      textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
      transition: { 
        duration: 0.3,
        ease: "easeOut" 
      }
    },
    tap: { 
      scale: 0.95,
      boxShadow: "0 0 25px rgba(138, 43, 226, 0.7)",
      transition: { 
        duration: 0.1,
        ease: "easeIn" 
      }
    }
  };

  // Handler pour la navigation
  const handleExplore = () => {
    navigate('/explore');
  };

  // Nébuleuses pour l'arrière-plan
  const nebulae = [
    { 
      position: { top: '10%', right: '20%', width: '40%', height: '40%' }, 
      colors: ['rgba(76, 0, 153, 0.15)', 'rgba(138, 43, 226, 0.1)', 'rgba(148, 0, 211, 0.05)'],
      blur: '140px',
      rotate: 15,
      animation: { scale: [1, 1.05, 1], opacity: [1, 0.8, 1], duration: 30 }
    },
    { 
      position: { bottom: '5%', left: '10%', width: '35%', height: '35%' }, 
      colors: ['rgba(255, 80, 80, 0.1)', 'rgba(255, 0, 0, 0.08)', 'rgba(139, 0, 0, 0.03)'],
      blur: '120px',
      rotate: -20,
      animation: { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8], duration: 40, delay: 5 }
    },
    { 
      position: { top: '30%', left: '5%', width: '25%', height: '25%' }, 
      colors: ['rgba(0, 191, 255, 0.1)', 'rgba(30, 144, 255, 0.07)', 'rgba(0, 0, 139, 0.03)'],
      blur: '100px',
      rotate: 30,
      animation: { scale: [1, 1.04, 1], opacity: [0.9, 0.7, 0.9], duration: 25, delay: 10 }
    }
  ];

  // Animation par caractère pour le titre
  const titleText = "SolTrek";
  const titleChars = titleText.split("").map((char, index) => (
    <motion.span
      key={`title-${index}`}
      custom={index}
      variants={textCharacterVariants}
      className="inline-block"
      style={{ 
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  ));

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#06071A] to-[#0C0E33] overflow-hidden text-white">
      {/* Fond d'étoiles */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0,
            }}
            animate={appLoaded ? {
              opacity: [0, star.opacity, 0],
              scale: [0.5, 1, 0.5],
            } : { opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 3 + star.delay / 3,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Fond d'espace profond avec dégradé subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050516] to-[#0a0828]"></div>
      
      {/* Nébuleuses */}
      {nebulae.map((nebula, index) => (
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
                boxShadow: star.size > 2 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.7)` : 'none',
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
            {/* Surface de la planète avec dégradé amélioré */}
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
      
      {/* Contenu principal */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
        <div className="relative">
          {/* Suppression de l'ombre lumineuse derrière le texte */}
          
          <motion.div
            className="text-center max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            animate={appLoaded ? "visible" : "hidden"}
          >
            
            {/* Titre avec animation par caractère */}
            <motion.h1 
              ref={letterRef}
              className="text-5xl md:text-7xl font-extrabold mb-2 tracking-tight"
              variants={itemVariants}
            >
              <span className="sr-only">SolTrek - Explore the Stars</span>
              <span className="inline-block bg-gradient-to-r from-blue-300 via-purple-400 to-pink-300 text-transparent bg-clip-text pb-2">
                {titleChars}
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 1.2, ease: "easeInOut" }}
                className="h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"
              />
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={appLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="text-3xl md:text-4xl font-light mt-3 text-white/90"
              >
                Explore the Stars
              </motion.div>
            </motion.h1>
            
            {/* Sous-titre avec effet de fondu */}
            <motion.p 
              className="text-xl md:text-2xl mt-8 mb-12 text-blue-100/80 font-light max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Plongez dans un voyage interstellaire et découvrez les secrets du cosmos.
            </motion.p>
            
            {/* Bouton avec effets avancés */}
            <motion.div variants={itemVariants}>
              <motion.button
                onClick={handleExplore}
                className="group relative px-8 py-4 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white text-lg font-medium transition-all duration-300 cursor-pointer"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {/* Fond lumineux intérieur */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                
                {/* Particules flottantes */}
                <span className="absolute inset-0 w-full h-full">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{ 
                        left: `${Math.random() * 100}%`, 
                        top: `${Math.random() * 100}%`,
                        opacity: 0
                      }}
                      animate={{ 
                        opacity: [0, 0.8, 0],
                        y: [0, -15],
                        x: [0, Math.random() * 10 - 5]
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeOut",
                        repeat: Infinity,
                        repeatDelay: Math.random() * 3,
                        delay: Math.random() * 2
                      }}
                    />
                  ))}
                </span>
                
                {/* Halo lumineux */}
                <span className="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: "0 0 40px 5px rgba(123, 97, 255, 0.5)" }}></span>
                
                {/* Texte du bouton */}
                <span className="relative flex items-center justify-center gap-2 z-10">
                  <span className="tracking-wide">Commencer l'exploration</span>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 