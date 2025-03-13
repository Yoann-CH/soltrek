import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const variants = {
    initial: { scale: 0.8, rotate: 0 },
    animate: { scale: 1, rotate: 0 },
    exit: { scale: 0.8, rotate: 90 },
    hover: { scale: 1.1 }
  };

  return (
    <motion.button
      onClick={() => setTheme(theme === "system" ? "dark" : "system")}
      className="relative rounded-full p-2.5 
                 bg-gradient-to-r from-gray-700 to-gray-800 
                 shadow-md hover:shadow-lg shadow-gray-900/60
                 border border-gray-600
                 transition-all duration-300 ease-out group"
      aria-label="Basculer le thème"
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
    >
      {/* Effet de halo */}
      <div className="absolute inset-0 rounded-full 
                      bg-gradient-to-r from-blue-600/30 via-indigo-500/30 to-blue-500/30
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
      
      {/* Icône avec animation */}
      <motion.div
        key={theme}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative z-10"
      >
        {theme === "system" ? (
          <Moon className="h-5 w-5 text-indigo-300" />
        ) : (
          <Sun className="h-5 w-5 text-amber-300" />
        )}
      </motion.div>
      
      {/* Texte indicateur du mode (visible au survol) */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                      bg-gray-700 text-white text-xs py-1 px-2 rounded-md
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                      shadow-lg whitespace-nowrap">
        Mode {theme === "system" ? "forcé" : "système"}
      </div>
    </motion.button>
  );
} 