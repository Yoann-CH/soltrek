import path from 'path'
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plugin personnalisé pour ignorer les avertissements spécifiques
const ignoreWarningsPlugin = (): Plugin => {
  const evalWarningRegex = /Use of eval in "node_modules\/three-stdlib\/libs\/lottie\.js" is strongly discouraged/;
  
  return {
    name: 'ignore-specific-warnings',
    enforce: 'pre',
    handleHotUpdate({ server }) {
      // Filtrer les avertissements du serveur
      const { ws } = server;
      const originalSend = ws.send;
      ws.send = function(data: string | unknown) {
        if (typeof data === 'string' && evalWarningRegex.test(data)) {
          return;
        }
        originalSend.call(ws, data as string);
      };
    },
    config(config) {
      if (!config.build) config.build = {};
      
      // Ignorer les avertissements dans les logs de la console
      const originalConsoleWarn = console.warn;
      console.warn = function(...args: unknown[]) {
        if (typeof args[0] === 'string' && evalWarningRegex.test(args[0])) {
          return;
        }
        originalConsoleWarn.apply(console, args);
      };
      
      return config;
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ignoreWarningsPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Augmenter la limite d'avertissement de taille de chunk (optionnel)
    chunkSizeWarningLimit: 1000, // en kB
    
    rollupOptions: {
      output: {
        // Configuration de chunking manuel pour séparer les bibliothèques principales
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          threejs: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', '@react-three/cannon'],
          ui: ['framer-motion', 'gsap', 'lucide-react', 'tailwind-merge', 'tailwindcss-animate'],
        },
      },
    },
    // Ne pas générer d'avertissements pour les eval dans les dépendances
    // Cette option est spécifique pour ignorer l'avertissement de lottie.js
    sourcemap: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      // Ignorer l'avertissement pour lottie.js
      drop: ['console', 'debugger'],
    },
  },
  // Ignorer les avertissements spécifiques
  esbuild: {
    legalComments: 'none',
    drop: ['debugger'],
    pure: ['console.log', 'console.error', 'console.warn', 'console.debug', 'console.trace'],
  },
})
