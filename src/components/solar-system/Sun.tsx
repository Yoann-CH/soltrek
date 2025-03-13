import { useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// Données réelles du Soleil
const SUN_DATA = {
  radius: 6,
  rotationPeriod: {
    equator: 25, // jours terrestre à l'équateur
    poles: 35,    // jours terrestre aux pôles
  },
  axialTilt: 7.25, // degrés par rapport à l'écliptique
};

// Fonction de conversion degrés -> radians
const degToRad = (degrees: number) => degrees * (Math.PI / 180);

// Composant pour le soleil
export function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);

  // Chargement de la texture du soleil
  const sunTexture = useTexture('/assets/textures/planets/sun.jpg');
  
  useFrame(({ clock }) => {
    if (sunRef.current) {
      // Réinitialiser la rotation pour éviter l'accumulation
      sunRef.current.rotation.set(0, 0, 0);
      
      // Appliquer l'inclinaison axiale (7.25°)
      sunRef.current.rotateZ(degToRad(SUN_DATA.axialTilt));
      
      // Calculer la rotation actuelle basée sur le temps écoulé
      // Nous simulons ici une rotation moyenne (différentielle simplifiée)
      // En réalité, le soleil tourne plus vite à l'équateur qu'aux pôles
      const elapsedDays = clock.getElapsedTime() / 10; // 1 sec = 0.1 jour pour l'animation
      const rotationAngle = (elapsedDays / SUN_DATA.rotationPeriod.equator) * Math.PI * 2;
      
      // Appliquer la rotation autour de l'axe Y
      sunRef.current.rotateY(rotationAngle);
    }
  });

  return (
    <group>
      {/* Le soleil */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[SUN_DATA.radius, 64, 64]} />
        <meshStandardMaterial 
          map={sunTexture} 
          emissive="#ffcc55"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Lumière du soleil */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={3} 
        color="#ffffff" 
        distance={200} 
        decay={0.5}
      />
    </group>
  );
} 