import { useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Montrer le bouton lorsque l'utilisateur a scrollé vers le bas
  const toggleVisibility = useCallback(() => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  // Fonction améliorée pour remonter en haut de la page
  const scrollToTop = useCallback(() => {
    // Ajouter une classe d'état pour indiquer que nous utilisons le bouton de défilement
    document.body.classList.add('using-scroll-top');
    
    // Si l'utilisateur préfère les animations réduites, utiliser un défilement instantané
    if (prefersReducedMotion) {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
      return;
    }
    
    // Indiquer que nous sommes en train de défiler
    setIsScrolling(true);
    
    // Méthode pour éviter l'aplatissement de la planète:
    // 1. Stabiliser les éléments 3D avant de commencer le défilement
    const planets = document.querySelectorAll('.planet');
    planets.forEach(planet => {
      planet.classList.add('scrolling');
      // Suspension temporaire des transitions pour éviter les déformations
      (planet as HTMLElement).style.transition = 'none';
    });
    
    // 2. Attendre que les modifications CSS soient appliquées
    setTimeout(() => {
      // 3. Scroll avec animation fluide mais rapide
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // 4. Réinitialiser les éléments après la fin du défilement
      const scrollDuration = 500; // Durée estimée du défilement en ms
      setTimeout(() => {
        planets.forEach(planet => {
          planet.classList.remove('scrolling');
          // Restaurer les transitions après un court délai
          setTimeout(() => {
            (planet as HTMLElement).style.transition = '';
          }, 50);
        });
        
        document.body.classList.remove('using-scroll-top');
        setIsScrolling(false);
      }, scrollDuration);
    }, 10);
  }, [prefersReducedMotion]);

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [toggleVisibility]);

  // Ajouter les styles globaux pour gérer l'interaction avec la planète 3D
  useEffect(() => {
    // Créer un élément de style pour injecter les règles CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Désactiver les animations de la planète pendant l'utilisation du ScrollToTop */
      body.using-scroll-top .planet {
        transition: none !important;
        transform: translate3d(0,0,0) rotateY(0deg) rotateX(0deg) !important;
        pointer-events: none !important;
      }
      
      /* Optimisations pour le mobile */
      @media (max-width: 768px) {
        body.using-scroll-top .planet {
          opacity: 0.5;
          transform: translate3d(0,0,0) !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Nettoyage à la désinstallation du composant
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className={`fixed bottom-8 right-8 transition-opacity duration-300 z-40 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <button
        onClick={scrollToTop}
        disabled={isScrolling}
        className={`cursor-pointer flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 ${isScrolling ? 'opacity-70' : ''}`}
        aria-label="Retour en haut de la page"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 15l7-7 7 7" 
          />
        </svg>
      </button>
    </div>
  );
} 