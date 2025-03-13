import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { useEffect } from 'react';
import SpaceBackground from '../components/SpaceBackground';

export default function LegalPage() {
  // S'assurer que la page commence en haut
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black dark:bg-black text-gray-100">
      {/* Fond spatial ajouté ici */}
      <SpaceBackground starCount={150} planetCount={5} enableParallax={true} showNebulae={true} />
      
      <Header 
        pageName="legal" 
        showBackButton={true} 
        backTo="/explore" 
        backText="Retour" 
      />
      
      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 pb-1">
            Mentions Légales
          </h1>
          
          <section className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-6 shadow-lg shadow-blue-500/5"
            >
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Éditeur du Site</h2>
              <p className="mb-2">SolTrek - Système Solaire 3D</p>
              <p className="mb-2">Développé par Yoann CHAMBEUX</p>
              <p className="text-sm text-gray-300 dark:text-gray-400">Projet éducatif et créatif</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-6 shadow-lg shadow-blue-500/5"
            >
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Hébergement</h2>
              <p className="mb-2">SolTrek est hébergé par:</p>
              <p className="mb-2">Vercel Inc.</p>
              <p className="text-sm text-gray-300 dark:text-gray-400">440 N Barranca Ave #4133 - Covina, CA 91723</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-6 shadow-lg shadow-blue-500/5"
            >
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Propriété Intellectuelle</h2>
              <p className="mb-3">L'ensemble du contenu du site SolTrek est protégé par le droit d'auteur. Toute reproduction, même partielle, est soumise à autorisation.</p>
              <p className="mb-3">Les données scientifiques proviennent de sources publiques comme la NASA et d'autres agences spatiales.</p>
              <p className="text-sm text-gray-300 dark:text-gray-400">Les images et textures des planètes sont utilisées à des fins éducatives.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -5 }}
              className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-6 shadow-lg shadow-blue-500/5"
            >
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Données Personnelles</h2>
              <p className="mb-3">Conformément au Règlement Général sur la Protection des Données (RGPD), SolTrek ne collecte aucune donnée personnelle des visiteurs.</p>
              <p className="mb-3">Les préférences utilisateur (comme le thème sombre/clair) sont stockées uniquement en local sur votre navigateur.</p>
              <p className="text-sm text-gray-300 dark:text-gray-400">Aucun cookie de tracking n'est utilisé sur ce site.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -5 }}
              className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-6 shadow-lg shadow-blue-500/5"
            >
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Contact</h2>
              <p className="mb-2">Pour toute question concernant le site SolTrek:</p>
              <p className="mb-3">Contactez-moi via GitHub ou LinkedIn (liens dans le pied de page)</p>
              <div className="text-sm text-gray-300 dark:text-gray-400 bg-blue-900/20 p-3 rounded-md border border-blue-800/50">
                <p>Ce site est un projet personnel à but éducatif.</p>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
} 