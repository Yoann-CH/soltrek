import React, { useRef, useMemo, useCallback, useEffect, memo } from 'react';
import * as THREE from 'three';
import { useTexture, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { PlanetProps, OrbitProps } from './types';
import { SolarSystemContext } from './SolarSystemContext';
import { calculateRealPosition, calculatePlanetRotation, degToRad } from './utils';

// Composant pour l'orbite d'une planète
export const PlanetOrbit = memo(({ distance, planet }: OrbitProps) => {
  // Création des points pour l'orbite elliptique
  const points = useMemo(() => {
    const orbitPoints = [];
    const segments = 128;
    const e = planet.eccentricity;
    const inclination = degToRad(planet.inclination);
    const node = degToRad(planet.longitudeOfAscendingNode);
    const perihelion = degToRad(planet.longitudeOfPerihelion);
    
    for (let i = 0; i <= segments; i++) {
      // Angle dans l'orbite
      const theta = (i / segments) * Math.PI * 2;
      
      // Distance au centre en fonction de l'excentricité (formule de l'ellipse)
      const r = planet.distance * (1 - e * e) / (1 + e * Math.cos(theta));
      
      // Ajuster la position angulaire en fonction du périhélie
      const adjustedAngle = theta + perihelion - node;
      
      // Calculer les coordonnées après rotation
      const x = (
        Math.cos(node) * Math.cos(adjustedAngle) - 
        Math.sin(node) * Math.sin(adjustedAngle) * Math.cos(inclination)
      ) * r;
      
      const z = (
        Math.sin(node) * Math.cos(adjustedAngle) + 
        Math.cos(node) * Math.sin(adjustedAngle) * Math.cos(inclination)
      ) * r;
      
      // L'axe y correspond à la hauteur au-dessus du plan de l'écliptique
      const y = Math.sin(adjustedAngle) * Math.sin(inclination) * r;
      
      orbitPoints.push(x, y, z);
    }
    
    return new Float32Array(orbitPoints);
  }, [distance, planet.eccentricity, planet.inclination, planet.longitudeOfAscendingNode, planet.longitudeOfPerihelion, planet.distance]);

  const lineMaterial = useMemo(() => 
    new THREE.LineBasicMaterial({ 
      color: "#FFFFFF", 
      opacity: 0.3, 
      transparent: true 
    }), 
  []);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
          args={[points, 3]}
        />
      </bufferGeometry>
      <primitive object={lineMaterial} attach="material" />
    </line>
  );
});

PlanetOrbit.displayName = 'PlanetOrbit';

// Composant pour le label de la planète
const PlanetLabel = memo(({ position, name }: { position: [number, number, number], name: string }) => {
  return (
    <Html position={position} zIndexRange={[1, 10]} occlude>
      <div className="text-white bg-black/70 px-2 py-1 rounded text-xs whitespace-nowrap backdrop-blur-sm border border-gray-700/30">
        {name}
      </div>
    </Html>
  );
});

PlanetLabel.displayName = 'PlanetLabel';

// Composant pour une planète
export const Planet = memo(function Planet({ radius, distance, texturePath, hasRings, name, index, planet, qualitySettings }: PlanetProps) {
  const planetRef = useRef<THREE.Mesh>(null);
  const planetGroupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const context = React.useContext(SolarSystemContext);
  
  // Chargement de la texture de la planète
  const texture = useTexture(texturePath);
  
  // Création de la texture pour les anneaux de Saturne
  const ringsTexture = useMemo(() => {
    if (hasRings) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = 1024;
        canvas.height = 1024;
        
        const gradient = context.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.5
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.7, 'rgba(240, 220, 180, 0.5)');
        gradient.addColorStop(1, 'rgba(240, 220, 180, 0.2)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
      }
    }
    return null;
  }, [hasRings]);
  
  // Gestionnaire de clic pour focaliser la planète
  const handlePlanetClick = useCallback(() => {
    if (context) {
      context.setFocusedPlanet(index);
    }
  }, [context, index]);

  // Créer et mémoriser les matériaux pour éviter les recréations
  const planetMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({ 
      map: texture, 
      metalness: 0.15,
      roughness: 0.6,
      envMapIntensity: 0.8
    });
  }, [texture]);

  const ringsMaterial = useMemo(() => {
    if (hasRings && ringsTexture) {
      return new THREE.MeshStandardMaterial({
        map: ringsTexture,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
    }
    return null;
  }, [hasRings, ringsTexture]);

  const atmosphereMaterial = useMemo(() => {
    if (planet.hasAtmosphere) {
      return new THREE.MeshPhongMaterial({
        color: planet.atmosphereColor || new THREE.Color('#ffffff'),
        transparent: true,
        opacity: planet.atmosphereOpacity || 0.2,
        side: THREE.BackSide
      });
    }
    return null;
  }, [planet.hasAtmosphere, planet.atmosphereColor, planet.atmosphereOpacity]);
  
  // Mettre à jour la position et la rotation en fonction de la date actuelle
  useEffect(() => {
    if (planetGroupRef.current && context) {
      // Calculer la position en fonction de la date actuelle
      const position = calculateRealPosition(planet, context.currentDate);
      planetGroupRef.current.position.copy(position);
      
      // Mettre à jour immédiatement la position dans le contexte
      if (planetRef.current) {
        const worldPosition = new THREE.Vector3();
        planetRef.current.getWorldPosition(worldPosition);
        context.planetPositions.current[index] = worldPosition;
      }
      
      // Appliquer la rotation réaliste à la planète
      if (planetRef.current) {
        const rotation = calculatePlanetRotation(planet, context.currentDate);
        planetRef.current.rotation.copy(rotation);
      }
      
      // Ajuster les anneaux en fonction de l'inclinaison axiale
      if (hasRings && ringsRef.current) {
        // Appliquer une rotation pour aligner les anneaux avec l'équateur de la planète
        // Commencer par réinitialiser les rotations
        ringsRef.current.rotation.set(0, 0, 0);
        
        // Appliquer d'abord une rotation de 90° pour orienter le disque perpendiculairement à l'axe
        ringsRef.current.rotateX(Math.PI / 2);
        
        // Puis appliquer la même inclinaison axiale que la planète
        const axialTilt = degToRad(planet.axialTilt);
        
        // Pour aligner correctement les anneaux avec l'équateur de la planète,
        // on applique une rotation autour de l'axe X équivalente à l'inclinaison axiale
        ringsRef.current.rotateX(axialTilt);
      }
    }
  }, [planet, context?.currentDate, index, hasRings]);
  
  // Mise à jour optimisée avec throttling pour éviter des mises à jour trop fréquentes
  const lastUpdateRef = useRef(0);
  
  useFrame((_, delta) => {
    if (planetRef.current && context) {
      // Limiter les mises à jour à 30 fois par seconde maximum
      lastUpdateRef.current += delta;
      if (lastUpdateRef.current > 0.033) { // 1/30 ~ 0.033
        // Mettre à jour la position dans le contexte
        const worldPosition = new THREE.Vector3();
        planetRef.current.getWorldPosition(worldPosition);
        context.planetPositions.current[index] = worldPosition;
        lastUpdateRef.current = 0;
      }
    }
  });

  // Mémoriser les arguments pour les géométries
  const sphereGeometryArgs = useMemo(() => {
    // Utiliser les paramètres de qualité s'ils sont disponibles
    const detail = qualitySettings?.planetDetail || 32; // Valeur par défaut si non spécifiée
    return [radius, detail, detail] as [number, number, number];
  }, [radius, qualitySettings?.planetDetail]);
  
  const atmosphereGeometryArgs = useMemo(() => {
    // Utiliser les paramètres de qualité s'ils sont disponibles
    const detail = qualitySettings?.planetDetail || 32; // Valeur par défaut si non spécifiée
    return [radius * 1.05, detail / 2, detail / 2] as [number, number, number];
  }, [radius, qualitySettings?.planetDetail]);
  
  const ringsGeometryArgs = useMemo(() => {
    // Utiliser les paramètres de qualité s'ils sont disponibles
    const detail = qualitySettings?.planetDetail || 32; // Valeur par défaut si non spécifiée
    return [radius * 1.4, radius * 2.2, detail] as [number, number, number];
  }, [radius, qualitySettings?.planetDetail]);
  
  const labelPosition = useMemo<[number, number, number]>(() => [0, radius + 0.5, 0], [radius]);

  return (
    <>
      {/* Orbite de la planète */}
      <PlanetOrbit distance={distance} planet={planet} />
      
      {/* Groupe pour la planète et ses attributs */}
      <group ref={planetGroupRef}>
        {/* Atmosphère */}
        {planet.hasAtmosphere && atmosphereMaterial && (
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={atmosphereGeometryArgs} />
            <primitive object={atmosphereMaterial} attach="material" />
          </mesh>
        )}
        
        {/* Planète */}
        <mesh 
          ref={planetRef} 
          castShadow 
          receiveShadow={qualitySettings?.shadowsEnabled !== false}
          onClick={handlePlanetClick}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
          <sphereGeometry args={sphereGeometryArgs} />
          <primitive object={planetMaterial} attach="material" />
        </mesh>
        
        {/* Anneaux pour Saturne */}
        {hasRings && ringsMaterial && (
          <mesh 
            ref={ringsRef} 
            receiveShadow={qualitySettings?.shadowsEnabled !== false} 
            castShadow={qualitySettings?.shadowsEnabled !== false} 
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={ringsGeometryArgs} />
            <primitive object={ringsMaterial} attach="material" />
          </mesh>
        )}
        
        {/* Libellé de planète */}
        <PlanetLabel position={labelPosition} name={name} />
      </group>
    </>
  );
}); 