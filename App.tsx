
import React, { useState, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import City from './components/City';
import UIOverlay from './components/UIOverlay';
import { BuildingData } from './types';
import * as THREE from 'three';

export interface AppConfig {
  fogDistance: number;
  bloomStrength: number;
  autoRotate: boolean;
  showTraffic: boolean;
}

function App() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  const [timeOfDay, setTimeOfDay] = useState(14); // Start at 2 PM
  
  // Build Mode State
  const [isBuildMode, setIsBuildMode] = useState(false);
  const [buildHeight, setBuildHeight] = useState(20);

  // Centralized Configuration State
  const [config, setConfig] = useState<AppConfig>({
    fogDistance: 180,
    bloomStrength: 1.0,
    autoRotate: false,
    showTraffic: true,
  });

  // Day/Night Logic
  const isNight = timeOfDay < 6 || timeOfDay > 18.5;
  
  const sunAngle = ((timeOfDay - 12) / 12) * Math.PI;
  const sunX = Math.sin(sunAngle) * 60;
  const sunY = Math.max(Math.cos(sunAngle) * 60, -10); 
  const sunZ = 20;

  const dayBg = '#f1f5f9'; 
  const nightBg = '#020617'; 
  
  const bgColor = useMemo(() => new THREE.Color().lerpColors(
    new THREE.Color(dayBg), 
    new THREE.Color(nightBg), 
    isNight ? 1 : 0
  ), [isNight]);

  const ambientIntensity = isNight ? 0.2 : 0.6;
  const directionalIntensity = isNight ? 0.0 : 1.5;
  
  const baseBloom = isNight ? 1.5 : 0.2; 
  const finalBloom = baseBloom * config.bloomStrength;

  return (
    <div className="relative w-full h-full transition-colors duration-1000" style={{ backgroundColor: isNight ? '#020617' : '#f1f5f9' }}>
      <Canvas
        shadows
        camera={{ position: [25, 20, 25], fov: 45 }}
        gl={{ antialias: false }} 
        dpr={[1, 2]}
      >
        <color attach="background" args={[bgColor]} />
        
        <fog attach="fog" args={[bgColor, 30, config.fogDistance]} />

        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            <City 
                onBuildingSelect={setSelectedBuilding} 
                isNight={isNight}
                showTraffic={config.showTraffic}
                isBuildMode={isBuildMode}
                buildHeight={buildHeight}
            />
            
            <ContactShadows 
              resolution={1024} 
              scale={100} 
              blur={2} 
              opacity={isNight ? 0.2 : 0.5} 
              far={10} 
              color="#000000" 
            />
          </group>

          <ambientLight intensity={ambientIntensity} color={isNight ? "#1e293b" : "#ffffff"} />
          
          <directionalLight
            position={[sunX, sunY, sunZ]}
            intensity={directionalIntensity}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0005}
          >
            <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
          </directionalLight>
          
          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1} 
          />

          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={isNight ? 1 : 0.9} 
              mipmapBlur 
              intensity={finalBloom} 
              radius={0.4}
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>

        <OrbitControls 
          autoRotate={config.autoRotate}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 - 0.05} 
          minDistance={10}
          maxDistance={250} 
          enableDamping
          enabled={!isBuildMode} // Disable camera interaction slightly when building to prevent accidental spins? Or keep enabled. Let's keep enabled.
        />
      </Canvas>

      <UIOverlay 
        selectedBuilding={selectedBuilding} 
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        config={config}
        setConfig={setConfig}
        isBuildMode={isBuildMode}
        setIsBuildMode={setIsBuildMode}
        buildHeight={buildHeight}
        setBuildHeight={setBuildHeight}
      />
    </div>
  );
}

export default App;
