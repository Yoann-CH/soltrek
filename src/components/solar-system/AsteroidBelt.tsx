import { useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateAsteroidTexture } from '../../utils/textureGenerator';
import { QualitySettings } from './types';

// Interface pour les props de la ceinture d'astéroïdes
interface AsteroidBeltProps {
  count?: number;
  qualitySettings?: QualitySettings;
}

// Composant pour la ceinture d'astéroïdes
export function AsteroidBelt({ count = 1000, qualitySettings }: AsteroidBeltProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Déterminer le niveau de détail géométrique en fonction de la qualité
  const geometryDetail = useMemo(() => {
    if (!qualitySettings) return 0; // Valeur par défaut
    
    // Niveau de détail basé sur la qualité
    switch (qualitySettings.planetDetail) {
      case 16: return 0; // Low quality - dodécaèdre simple
      case 32: return 1; // Medium quality - dodécaèdre avec une subdivision
      case 64: return 2; // High quality - dodécaèdre avec deux subdivisions
      default: return 0;
    }
  }, [qualitySettings]);
  
  // Créer une géométrie partagée et mémorisée pour tous les astéroïdes
  const geometry = useMemo(() => {
    return new THREE.DodecahedronGeometry(1, geometryDetail);
  }, [geometryDetail]);
  
  // Nombre d'astéroïdes à animer par frame
  const asteroidsPerFrame = useMemo(() => {
    if (!qualitySettings) return count / 4;
    
    // Réduire le nombre d'astéroïdes à animer par frame pour les qualités basses
    switch (qualitySettings.planetDetail) {
      case 16: return Math.max(1, Math.floor(count / 6)); // Moins d'astéroïdes animés en basse qualité
      case 32: return Math.max(1, Math.floor(count / 4)); // Nombre modéré en qualité moyenne
      case 64: return Math.max(1, Math.floor(count / 3)); // Plus d'astéroïdes animés en haute qualité
      default: return Math.max(1, Math.floor(count / 4));
    }
  }, [count, qualitySettings]);
  
  // Fréquence de mise à jour (FPS cible basé sur la qualité)
  const targetFps = useMemo(() => {
    if (!qualitySettings) return 30;
    
    // Adapter la fréquence d'animation en fonction de la qualité
    switch (qualitySettings.planetDetail) {
      case 16: return 20; // 20 FPS en basse qualité
      case 32: return 30; // 30 FPS en qualité moyenne
      case 64: return 60; // 60 FPS en haute qualité
      default: return 30;
    }
  }, [qualitySettings]);
  
  // Générer la ceinture d'astéroïdes avec le parametrage selon la prop count
  const asteroidsData = useMemo(() => {
    // Paramètres de la ceinture d'astéroïdes
    const minRadius = 30; // rayon intérieur de la ceinture (entre Mars et Jupiter)
    const maxRadius = 38; // rayon extérieur de la ceinture
    const minSize = 0.05;
    const maxSize = 0.2;
    const beltWidth = 4; // largeur verticale de la ceinture

    // Créer les matrices de transformation pour chaque astéroïde
    const matrices: THREE.Matrix4[] = [];
    const asteroidData = [];
    const dummyMatrix = new THREE.Matrix4(); // Réutiliser la même instance

    // Utiliser la valeur de count fournie en prop
    for (let i = 0; i < count; i++) {
      // Position aléatoire dans la ceinture
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * beltWidth / radius;
      const inclinationAngle = (Math.random() - 0.5) * 0.2; // inclinaison aléatoire

      // Position en coordonnées cartésiennes
      const x = radius * Math.cos(theta) * Math.cos(inclinationAngle);
      const y = radius * Math.sin(inclinationAngle);
      const z = radius * Math.sin(theta) * Math.cos(inclinationAngle);

      // Taille aléatoire
      const size = minSize + Math.random() * (maxSize - minSize);

      // Rotation aléatoire
      const rotX = Math.random() * Math.PI * 2;
      const rotY = Math.random() * Math.PI * 2;
      const rotZ = Math.random() * Math.PI * 2;

      // Créer la matrice de transformation (réutilisation de la même instance)
      dummyMatrix.compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ)),
        new THREE.Vector3(size, size, size)
      );
      
      // Utiliser clone() pour créer une copie indépendante
      matrices.push(dummyMatrix.clone());

      // Vitesse orbitale plus lente pour les astéroïdes éloignés
      const orbitalSpeed = 0.0005 / (radius / minRadius);

      // Données pour l'animation
      asteroidData.push({
        matrix: matrices[i], // Référence à la matrice créée précédemment
        radius,
        theta,
        phi,
        size,
        orbitalSpeed,
        rotationSpeed: Math.random() * 0.01,
        position: new THREE.Vector3(x, y, z), // Stocker la position séparément
        rotation: new THREE.Euler(rotX, rotY, rotZ), // Stocker la rotation séparément
        scale: new THREE.Vector3(size, size, size), // Stocker l'échelle séparément
      });
    }

    return { matrices, asteroidData };
  }, [count]); // Dépendance sur count pour recalculer si le nombre change

  // Créer un matériau partagé et mémorisé pour tous les astéroïdes
  const material = useMemo(() => {
    const texture = generateAsteroidTexture();
    return new THREE.MeshStandardMaterial({ 
      map: texture,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: qualitySettings?.planetDetail !== 64 // Désactiver le flat shading en haute qualité
    });
  }, [qualitySettings?.planetDetail]);

  // Animer les astéroïdes avec une logique d'optimisation
  const animateAsteroids = useCallback((time: number) => {
    // Limiter les mises à jour selon la fréquence cible
    const deltaTime = time - lastTimeRef.current;
    const frameTime = 1000 / targetFps;
    
    if (deltaTime < frameTime) { 
      // Pas besoin de mettre à jour, attendre le prochain frame
      animationFrameRef.current = requestAnimationFrame(animateAsteroids);
      return;
    }
    
    // Mettre à jour le temps de référence
    lastTimeRef.current = time;

    if (instancedMeshRef.current) {
      const startIndex = Math.floor(Math.random() * (asteroidsData.asteroidData.length - asteroidsPerFrame));
      
      // N'animer qu'un sous-ensemble des astéroïdes à chaque frame
      for (let i = startIndex; i < startIndex + asteroidsPerFrame; i++) {
        const idx = i % asteroidsData.asteroidData.length;
        const asteroid = asteroidsData.asteroidData[idx];
        
        // Mettre à jour la position orbitale
        asteroid.theta += asteroid.orbitalSpeed;
        
        // Recalculer la position
        asteroid.position.x = asteroid.radius * Math.cos(asteroid.theta) * Math.cos(asteroid.phi);
        asteroid.position.y = asteroid.radius * Math.sin(asteroid.phi);
        asteroid.position.z = asteroid.radius * Math.sin(asteroid.theta) * Math.cos(asteroid.phi);
        
        // Mettre à jour la matrice
        asteroid.matrix.compose(
          asteroid.position,
          new THREE.Quaternion().setFromEuler(asteroid.rotation),
          asteroid.scale
        );
        
        // Appliquer la matrice à l'instance correspondante
        instancedMeshRef.current.setMatrixAt(idx, asteroid.matrix);
      }
      
      // Signaler que la géométrie a changé
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
    
    // Planifier le prochain frame
    animationFrameRef.current = requestAnimationFrame(animateAsteroids);
  }, [asteroidsData, asteroidsPerFrame, targetFps]);

  // Démarrer l'animation et nettoyer
  useFrame(() => {
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animateAsteroids);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  });

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, undefined, asteroidsData.matrices.length]}
      receiveShadow={qualitySettings?.shadowsEnabled !== false}
      castShadow={qualitySettings?.shadowsEnabled !== false}
      material={material}
    />
  );
} 