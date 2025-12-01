import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import City from './components/City';
import UIOverlay from './components/UIOverlay';
import { BuildingData } from './types';

function App() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);

  return (
    <div className="relative w-full h-full bg-slate-900">
      <Canvas
        shadows
        camera={{ position: [25, 20, 25], fov: 45 }}
        gl={{ antialias: false }} // Performance optimization for post-processing
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />
        
        {/* Environmental Fog for depth */}
        <fog attach="fog" args={['#050505', 10, 80]} />

        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            <City onBuildingSelect={setSelectedBuilding} />
            
            {/* Soft contact shadows on the ground */}
            <ContactShadows 
              resolution={1024} 
              scale={100} 
              blur={2} 
              opacity={0.5} 
              far={10} 
              color="#000000" 
            />
          </group>

          {/* Lighting Setup */}
          <ambientLight intensity={0.5} color="#475569" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          >
            <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
          </directionalLight>
          
          {/* Subtle reflection environment */}
          <Environment preset="city" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          {/* Post Processing Effects */}
          <EffectComposer disableNormalPass>
            {/* Bloom makes selected buildings (high emissive) glow */}
            <Bloom 
              luminanceThreshold={1} // Only very bright things glow
              mipmapBlur 
              intensity={1.5} 
              radius={0.4}
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>

        <OrbitControls 
          autoRotate 
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 - 0.05} // Don't go below ground
          minDistance={10}
          maxDistance={80}
          enableDamping
        />
      </Canvas>

      <UIOverlay selectedBuilding={selectedBuilding} />
    </div>
  );
}

export default App;
