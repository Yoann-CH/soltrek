import { QualitySettings } from './types';

// Interface pour les props de l'éclairage
interface LightingProps {
  qualitySettings?: QualitySettings;
}

// Composant pour l'éclairage global du système solaire - optimisé pour les performances
export function Lighting({ qualitySettings }: LightingProps = {}) {
  // Déterminer si on doit utiliser un éclairage simplifié
  const useSimplifiedLighting = !qualitySettings || qualitySettings.planetDetail <= 16;
  
  // Si l'éclairage simplifié est activé, on utilise une seule source de lumière
  if (useSimplifiedLighting) {
    return <ambientLight intensity={0.6} />; // Une seule lumière ambiante avec intensité optimisée
  }
  
  // Éclairage standard avec performance améliorée pour les appareils qui le supportent
  return (
    <>
      <ambientLight intensity={0.3} />
      
      {/* Lumière hémisphérique uniquement pour la qualité moyenne et haute */}
      {qualitySettings.planetDetail >= 32 && (
        <hemisphereLight 
          color="#ffffff" 
          groundColor="#444444" 
          intensity={0.3} 
        />
      )}
      
      {/* Ombres uniquement si explicitement activées et en haute qualité */}
      {qualitySettings.shadowsEnabled && qualitySettings.planetDetail >= 64 ? (
        <directionalLight 
          position={[0, 0, 0]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-near={0.5}
        />
      ) : (
        // Version sans ombre pour les autres qualités
        <directionalLight 
          position={[0, 0, 0]} 
          intensity={1.0} 
        />
      )}
    </>
  );
} 