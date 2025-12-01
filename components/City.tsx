
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Building from './Building';
import { BuildingData } from '../types';
import * as THREE from 'three';

interface CityProps {
  onBuildingSelect: (data: BuildingData | null) => void;
}

// Traffic System Component
const Traffic: React.FC<{ roadsX: number[]; roadsZ: number[]; bounds: number }> = ({ roadsX, roadsZ, bounds }) => {
  const cars = useMemo(() => {
    const tempCars = [];
    const carCount = 40;
    
    for (let i = 0; i < carCount; i++) {
      const isX = Math.random() > 0.5;
      // Pick a random road
      const roadSet = isX ? roadsZ : roadsX; // If moving along X, we need a Z coordinate
      const fixedPos = roadSet[Math.floor(Math.random() * roadSet.length)];
      
      // Offset slightly to simulate lanes
      const laneOffset = (Math.random() > 0.5 ? 0.5 : -0.5); 

      tempCars.push({
        id: i,
        axis: isX ? 'x' : 'z',
        fixedPos: fixedPos + laneOffset * 1.5, // 1.5 width lane
        startPos: (Math.random() * bounds * 2) - bounds,
        speed: (Math.random() * 5 + 5) * (Math.random() > 0.5 ? 1 : -1), // Random speed and direction
        color: Math.random() > 0.5 ? '#ff3333' : '#ffffff', // Tail lights or head lights
        length: Math.random() * 1 + 1
      });
    }
    return tempCars;
  }, [roadsX, roadsZ, bounds]);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    cars.forEach((car, i) => {
      // Update position
      car.startPos += car.speed * delta;

      // Loop around
      if (car.startPos > bounds) car.startPos = -bounds;
      if (car.startPos < -bounds) car.startPos = bounds;

      // Set transforms
      if (car.axis === 'x') {
        dummy.position.set(car.startPos, 0.2, car.fixedPos);
        dummy.rotation.set(0, 0, 0);
      } else {
        dummy.position.set(car.fixedPos, 0.2, car.startPos);
        dummy.rotation.set(0, Math.PI / 2, 0);
      }
      
      dummy.scale.set(car.length, 0.5, 0.5);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, new THREE.Color(car.color));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cars.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};

const City: React.FC<CityProps> = ({ onBuildingSelect }) => {
  const bounds = 25;
  
  // City Generation Logic
  const { buildings, roadsX, roadsZ } = useMemo(() => {
    const tempBuildings: BuildingData[] = [];
    const tempRoadsX: number[] = [];
    const tempRoadsZ: number[] = [];

    // Grid Configuration
    // We iterate from -range to +range
    // We define "Blocks". A block is a cluster of buildings.
    // Between blocks are "Roads".
    
    const range = 6; // Number of units in each direction
    const blockSize = 3; // Buildings per block side
    const buildingSize = 3;
    const roadWidth = 4; // Width of the road
    
    // Helper to calculate coordinate
    // The coordinate system is constructed by blocks + roads
    
    // Let's iterate through a coordinate grid and decide what goes where
    // We want explicit roads at fixed intervals.
    
    // We'll generate based on simple coordinate loops and use modulo to determine roads
    const totalSize = 24; // -24 to 24
    const unitStep = 4; // Base grid unit
    
    for (let x = -totalSize; x <= totalSize; x += unitStep) {
      for (let z = -totalSize; z <= totalSize; z += unitStep) {
        
        // Define Road Pattern
        // Every 4th unit is a major road
        const isRoadX = Math.abs(x) % (unitStep * 3) === 0;
        const isRoadZ = Math.abs(z) % (unitStep * 3) === 0;

        // Store road coordinates for visualization
        if (isRoadX && !tempRoadsX.includes(x)) tempRoadsX.push(x);
        if (isRoadZ && !tempRoadsZ.includes(z)) tempRoadsZ.push(z);

        if (isRoadX || isRoadZ) {
          // This is a road space, do not place building
          continue;
        }

        // Density Check - Reduce density significantly
        // Higher density in center, lower at edges
        const dist = Math.sqrt(x * x + z * z);
        const maxDist = Math.sqrt(totalSize * totalSize * 2);
        const densityThreshold = 0.4 + (dist / maxDist) * 0.4; // 40% chance to skip in center, 80% at edge
        
        if (Math.random() < densityThreshold) continue;

        // Building Generation
        // Height based on distance from center (Bell curve)
        const normalizedDist = 1 - (dist / maxDist);
        const height = 4 + (Math.random() * 5) + (Math.pow(normalizedDist, 3) * 30);
        
        // Randomize dimensions slightly
        const w = buildingSize * (0.8 + Math.random() * 0.4);
        const d = buildingSize * (0.8 + Math.random() * 0.4);

        tempBuildings.push({
          id: `bld-${x}-${z}`,
          position: [x, 0, z],
          height,
          width: w,
          depth: d
        });
      }
    }

    return { buildings: tempBuildings, roadsX: tempRoadsX, roadsZ: tempRoadsZ };
  }, []);

  return (
    <group>
      {/* Dark Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
            color="#020617" 
            roughness={0.8} 
            metalness={0.2}
        />
      </mesh>

      {/* Road Visuals */}
      <group position={[0, 0.05, 0]}>
        {roadsX.map((x, i) => (
          <mesh key={`rx-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, 0]} receiveShadow>
             <planeGeometry args={[3, 100]} />
             <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))}
        {roadsZ.map((z, i) => (
           <mesh key={`rz-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]} receiveShadow>
              <planeGeometry args={[100, 3]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
           </mesh>
        ))}
      </group>
      
      {/* Decorative Grid Helper */}
      <gridHelper args={[100, 25, 0x334155, 0x0f172a]} position={[0, 0.02, 0]} />

      {/* Traffic System */}
      <Traffic roadsX={roadsX} roadsZ={roadsZ} bounds={bounds} />

      {/* Buildings */}
      {buildings.map((b) => (
        <Building
          key={b.id}
          {...b}
          isHovered={false} // Managed internally by building or global if needed, simplification for performance
          isSelected={false} // Controlled by parent normally, but we pass handler
          onPointerOver={(e) => document.body.style.cursor = 'pointer'}
          onPointerOut={(e) => document.body.style.cursor = 'auto'}
          onClick={(e) => onBuildingSelect(b)}
          // We pass props to let Building handle its own selection state derived from props in parent
          // But here we are mapping. To fully support selection visualization, we need to pass selected status.
        />
      ))}
      
      {/* Re-map to inject selection state properly since we aren't using the state in this component currently */}
      <BuildingsRenderer 
        buildings={buildings} 
        onSelect={onBuildingSelect} 
      />
    </group>
  );
};

// Separated renderer to consume the selection state passed from App (if we were passing it)
// But App.tsx manages state. We need to actually receive the selected ID or pass the comparison down.
// Since the previous City.tsx maintained local state for hover/select, let's restore that pattern for interaction.

const BuildingsRenderer: React.FC<{ buildings: BuildingData[], onSelect: (b: BuildingData) => void }> = ({ buildings, onSelect }) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleSelect = (e: any, b: BuildingData) => {
    e.stopPropagation();
    setSelectedId(b.id);
    onSelect(b);
  };

  return (
    <>
      {buildings.map((b) => (
        <Building
          key={b.id}
          {...b}
          isHovered={hoveredId === b.id}
          isSelected={selectedId === b.id}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredId(b.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHoveredId(null);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e) => handleSelect(e, b)}
        />
      ))}
    </>
  );
};

export default City;
