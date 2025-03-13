// Composant pour l'éclairage global du système solaire
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <hemisphereLight 
        color="#ffffff" 
        groundColor="#444444" 
        intensity={0.3} 
      />
      <directionalLight 
        position={[0, 0, 0]} 
        intensity={1.2} 
        castShadow 
      />
    </>
  );
} 