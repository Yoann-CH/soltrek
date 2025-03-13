import { useRef, useCallback } from 'react';
import { useFrame, RootState } from '@react-three/fiber';

/**
 * Hook personnalisé pour limiter les appels de fonctions dans le cycle de rendu de Three.js
 * Améliore les performances en réduisant le nombre d'exécutions des callbacks coûteux
 * 
 * @param callback La fonction à exécuter à un taux limité
 * @param fps Le nombre maximum d'exécutions par seconde (par défaut 30)
 * @param priority La priorité du callback dans la boucle de rendu de R3F
 * @returns Aucune valeur de retour
 */
export const useThrottledFrame = (
  callback: (state: RootState, delta: number) => void,
  fps: number = 30,
  priority: number = 0
): void => {
  const lastCallTimeRef = useRef<number>(0);
  const frameInterval = useRef<number>(1 / fps);
  
  // Mémoriser la fonction de callback pour éviter les recréations
  const throttledCallback = useCallback(
    (state: RootState, delta: number) => {
      // Calculer le temps écoulé depuis le dernier appel
      lastCallTimeRef.current += delta;
      
      // Si suffisamment de temps s'est écoulé, exécuter le callback
      if (lastCallTimeRef.current >= frameInterval.current) {
        callback(state, lastCallTimeRef.current);
        lastCallTimeRef.current = 0; // Réinitialiser le compteur
      }
    },
    [callback]
  );
  
  // S'inscrire à la boucle de rendu avec la priorité spécifiée
  useFrame(throttledCallback, priority);
};

/**
 * Hook personnalisé pour limiter les mises à jour de la position d'objets 3D
 * Idéal pour les objets qui n'ont pas besoin d'être mis à jour à chaque frame
 * 
 * @param updateFn La fonction qui met à jour la position/rotation des objets
 * @param updateInterval L'intervalle en millisecondes entre les mises à jour
 * @returns Aucune valeur de retour
 */
export const usePeriodicUpdate = (
  updateFn: () => void,
  updateInterval: number = 100
): void => {
  const lastUpdateRef = useRef<number>(0);
  
  useFrame((_, delta) => {
    // Convertir delta (secondes) en millisecondes et ajouter au temps accumulé
    lastUpdateRef.current += delta * 1000;
    
    // Si l'intervalle est atteint, mettre à jour et réinitialiser
    if (lastUpdateRef.current >= updateInterval) {
      updateFn();
      lastUpdateRef.current = 0;
    }
  });
};

export default useThrottledFrame; 