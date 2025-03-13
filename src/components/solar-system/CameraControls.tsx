import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CameraControlsProps } from './types';
import { SolarSystemContext } from './SolarSystemContext';
import { PLANETS_DATA } from './constants';

// Fonction utilitaire pour l'animation de la caméra
const animateCamera = (
  startPos: THREE.Vector3, 
  endPos: THREE.Vector3, 
  camera: THREE.Camera, 
  duration: number, 
  onComplete: () => void
): void => {
  const startTime = Date.now();
  
  const updatePosition = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easing = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    
    camera.position.lerpVectors(startPos, endPos, easing);
    
    if (progress < 1) {
      requestAnimationFrame(updatePosition);
    } else {
      onComplete();
    }
  };
  
  updatePosition();
};

// Contrôleur de caméra avec suivi des planètes
export const CameraControls = memo(function CameraControls({ focusedPlanetIndex, onCameraUpdate }: CameraControlsProps) {
  const controlsRef = useRef(null);
  const context = React.useContext(SolarSystemContext);
  const { camera } = useThree();
  
  // État pour suivre si nous sommes en train de focaliser
  const [isFocusing, setIsFocusing] = useState(false);
  const lastFocusedPlanetIndex = useRef<number | null>(null);
  
  // Fonction pour réinitialiser la vue vers le soleil
  const resetToOverview = useCallback(() => {
    if (!controlsRef.current) return;
    
    // Réinitialiser la cible vers le soleil
    // @ts-expect-error - OrbitControls.target existe mais le type est compliqué
    controlsRef.current.target.set(0, 0, 0);
    
    // Animer le retour à la vue d'ensemble
    const newPosition = new THREE.Vector3(0, 25, 50);
    
    setIsFocusing(true);
    
    // Transition douce avec animation
    const startPos = camera.position.clone();
    
    animateCamera(startPos, newPosition, camera, 1000, () => {
      setIsFocusing(false);
      // Mettre à jour les contrôles
      // @ts-expect-error - OrbitControls.update existe mais le type est compliqué
      controlsRef.current?.update();
      
      // Réinitialiser le suivi
      lastFocusedPlanetIndex.current = null;
    });
  }, [camera]);
  
  // Fonction pour focaliser sur une planète spécifique
  const focusOnPlanet = useCallback((planetIndex: number) => {
    if (!controlsRef.current || !context || !context.planetPositions.current[planetIndex]) return;
    
    // Marquer que nous sommes en train de focaliser
    setIsFocusing(true);
    
    // Obtenir la position de la planète
    const planetPosition = context.planetPositions.current[planetIndex];
    
    // Configurer la cible des contrôles
    // @ts-expect-error - OrbitControls.target existe mais le type est compliqué
    controlsRef.current.target.copy(planetPosition);
    
    // Calculer une position de caméra adaptée
    const planet = PLANETS_DATA[planetIndex];
    const zoomDistance = planet.radius * 8; // Distance basée sur la taille de la planète
    
    // Position à 45 degrés au-dessus de la planète
    const cameraOffset = new THREE.Vector3(
      planetPosition.x - zoomDistance * 0.7, 
      planetPosition.y + zoomDistance * 0.7, 
      planetPosition.z + zoomDistance * 0.7
    );
    
    // Animation fluide
    const startPos = camera.position.clone();
    
    animateCamera(startPos, cameraOffset, camera, 1200, () => {
      setIsFocusing(false);
      // Mettre à jour le dernier index focalisé
      lastFocusedPlanetIndex.current = planetIndex;
    });
  }, [context, camera]);
  
  // Réinitialisation de la vue quand aucune planète n'est sélectionnée
  useEffect(() => {
    if (focusedPlanetIndex === null && lastFocusedPlanetIndex.current !== null) {
      resetToOverview();
    } else if (focusedPlanetIndex !== null && focusedPlanetIndex !== lastFocusedPlanetIndex.current) {
      focusOnPlanet(focusedPlanetIndex);
    }
  }, [focusedPlanetIndex, resetToOverview, focusOnPlanet]);
  
  // Suivre la planète focalisée en continu sans recréer la fonction à chaque frame
  const updateCameraTarget = useCallback(() => {
    if (controlsRef.current && 
        focusedPlanetIndex !== null && 
        context && 
        context.planetPositions.current[focusedPlanetIndex] &&
        !isFocusing) {
      
      const planetPosition = context.planetPositions.current[focusedPlanetIndex];
      
      // Mettre à jour la cible des contrôles pour suivre la planète en mouvement
      // @ts-expect-error - OrbitControls.target existe mais le type est compliqué
      controlsRef.current.target.copy(planetPosition);
    }
  }, [focusedPlanetIndex, context, isFocusing]);
  
  // Optimiser les mises à jour de frame en limitant les fréquences
  useFrame(() => {
    if (controlsRef.current) {
      // Mettre à jour les contrôles à chaque frame
      // @ts-expect-error - OrbitControls.update existe mais le type est compliqué
      controlsRef.current.update();
      
      // Suivre la planète focalisée 
      updateCameraTarget();
      
      // N'envoyer les mises à jour de caméra que si nécessaire 
      const currentPosition = new THREE.Vector3();
      camera.getWorldPosition(currentPosition);
      
      // @ts-expect-error - OrbitControls.target existe mais le type est compliqué
      const currentTarget = controlsRef.current.target.clone();
      
      if (onCameraUpdate) {
        onCameraUpdate(currentPosition, currentTarget);
      }
    }
  });
  
  const orbitControlsProps = {
    ref: controlsRef,
    enableZoom: true,
    enablePan: true,
    enableRotate: true,
    zoomSpeed: 0.6,
    panSpeed: 0.5,
    rotateSpeed: 0.5,
    minDistance: 3,
    maxDistance: 150,
    dampingFactor: 0.1,
    enableDamping: true
  };
  
  return <OrbitControls {...orbitControlsProps} />;
}); 