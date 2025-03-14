import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { QualitySettings } from './types';

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

// Interface pour les props du Soleil
interface SunProps {
  qualitySettings?: QualitySettings;
}

// Composant pour le soleil
export function Sun({ qualitySettings }: SunProps = {}) {
  const sunRef = useRef<THREE.Mesh>(null);

  // Chargement de la texture du soleil
  const sunTexture = useTexture('/assets/textures/planets/sun.jpg');
  
  // Déterminer le niveau de détail de la géométrie en fonction des paramètres de qualité
  const sphereGeometryArgs = useMemo(() => {
    // Utiliser les paramètres de qualité s'ils sont disponibles
    const detail = qualitySettings?.planetDetail || 32; // Valeur par défaut si non spécifiée
    return [SUN_DATA.radius, detail, detail] as [number, number, number];
  }, [qualitySettings?.planetDetail]);
  
  // Intensité de l'émissivité en fonction de la qualité
  const emissiveIntensity = useMemo(() => {
    if (!qualitySettings) return 1;
    
    switch (qualitySettings.planetDetail) {
      case 16: return 0.7;   // Qualité basse - moins lumineux
      case 32: return 1;     // Qualité moyenne - normal
      case 64: return 1.3;   // Qualité haute - plus lumineux
      default: return 1;
    }
  }, [qualitySettings]);
  
  // Intensité de la lumière du soleil en fonction de la qualité
  const lightIntensity = useMemo(() => {
    if (!qualitySettings) return 3;
    
    switch (qualitySettings.planetDetail) {
      case 16: return 2;     // Qualité basse - moins intense
      case 32: return 3;     // Qualité moyenne - normal
      case 64: return 4;     // Qualité haute - plus intense
      default: return 3;
    }
  }, [qualitySettings]);
  
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
        <sphereGeometry args={sphereGeometryArgs} />
        <meshStandardMaterial 
          map={sunTexture} 
          emissive="#ffcc55"
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      
      {/* Lumière du soleil */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={lightIntensity} 
        color="#ffffff" 
        distance={qualitySettings?.drawDistance || 200}
        decay={0.5}
      />
    </group>
  );
} 