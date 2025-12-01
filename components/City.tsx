
import React, { useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import Building from './Building';
import { BuildingData } from '../types';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';

interface CityProps {
  onBuildingSelect: (data: BuildingData | null) => void;
  isNight: boolean;
  showTraffic: boolean;
  isBuildMode: boolean;
  buildHeight: number;
}

// Traffic System Component
const Traffic: React.FC<{ roadsX: number[]; roadsZ: number[]; bounds: number; isNight: boolean }> = ({ roadsX, roadsZ, bounds, isNight }) => {
  const cars = useMemo(() => {
    const tempCars = [];
    const carCount = 60;
    
    for (let i = 0; i < carCount; i++) {
      const isX = Math.random() > 0.5;
      const roadSet = isX ? roadsZ : roadsX; 
      const fixedPos = roadSet[Math.floor(Math.random() * roadSet.length)];
      
      const laneOffset = (Math.random() > 0.5 ? 0.5 : -0.5); 

      tempCars.push({
        id: i,
        axis: isX ? 'x' : 'z',
        fixedPos: fixedPos + laneOffset * 1.5,
        startPos: (Math.random() * bounds * 2) - bounds,
        speed: (Math.random() * 5 + 8) * (Math.random() > 0.5 ? 1 : -1),
        color: Math.random() > 0.5 ? '#ff3333' : '#ffffff', 
        length: Math.random() * 1 + 1.2
      });
    }
    return tempCars;
  }, [roadsX, roadsZ, bounds]);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    cars.forEach((car, i) => {
      car.startPos += car.speed * delta;
      if (car.startPos > bounds) car.startPos = -bounds;
      if (car.startPos < -bounds) car.startPos = bounds;

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
      
      // Dim cars during day, bright at night
      const intensity = isNight ? 1 : 0.2;
      const color = new THREE.Color(car.color).multiplyScalar(intensity); 
      meshRef.current!.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cars.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};

const GhostBuilding: React.FC<{ 
  position: [number, number, number]; 
  height: number; 
  isValid: boolean 
}> = ({ position, height, isValid }) => {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[3, height, 3]} />
        <meshBasicMaterial 
          color={isValid ? "#22d3ee" : "#ef4444"} 
          transparent 
          opacity={0.4} 
          depthTest={false}
        />
        <Edges color={isValid ? "#ffffff" : "#ff9999"} />
      </mesh>
    </group>
  );
};

const City: React.FC<CityProps> = ({ onBuildingSelect, isNight, showTraffic, isBuildMode, buildHeight }) => {
  const bounds = 25;
  const unitStep = 4;
  const totalSize = 24;

  // Static Road Generation
  const { roadsX, roadsZ } = useMemo(() => {
    const tempRoadsX: number[] = [];
    const tempRoadsZ: number[] = [];
    
    for (let x = -totalSize; x <= totalSize; x += unitStep) {
      for (let z = -totalSize; z <= totalSize; z += unitStep) {
        const isRoadX = Math.abs(x) % (unitStep * 3) === 0;
        const isRoadZ = Math.abs(z) % (unitStep * 3) === 0;
        if (isRoadX && !tempRoadsX.includes(x)) tempRoadsX.push(x);
        if (isRoadZ && !tempRoadsZ.includes(z)) tempRoadsZ.push(z);
      }
    }
    return { roadsX: tempRoadsX, roadsZ: tempRoadsZ };
  }, []);

  // Initialize Buildings State
  const [buildings, setBuildings] = useState<BuildingData[]>(() => {
    const tempBuildings: BuildingData[] = [];
    
    for (let x = -totalSize; x <= totalSize; x += unitStep) {
      for (let z = -totalSize; z <= totalSize; z += unitStep) {
        
        const isRoadX = Math.abs(x) % (unitStep * 3) === 0;
        const isRoadZ = Math.abs(z) % (unitStep * 3) === 0;

        if (isRoadX || isRoadZ) continue;

        const dist = Math.sqrt(x * x + z * z);
        const maxDist = Math.sqrt(totalSize * totalSize * 2);
        const densityThreshold = 0.4 + (dist / maxDist) * 0.4; 
        
        if (Math.random() < densityThreshold) continue;

        const normalizedDist = 1 - (dist / maxDist);
        const height = 4 + (Math.random() * 5) + (Math.pow(normalizedDist, 3) * 30);
        const w = 3 * (0.8 + Math.random() * 0.4);
        const d = 3 * (0.8 + Math.random() * 0.4);

        tempBuildings.push({
          id: `bld-${x}-${z}`,
          position: [x, 0, z],
          height,
          width: w,
          depth: d
        });
      }
    }
    return tempBuildings;
  });

  // Build Mode Logic
  const [ghostPos, setGhostPos] = useState<[number, number, number] | null>(null);
  const [isGhostValid, setIsGhostValid] = useState(false);

  const checkValidity = (x: number, z: number) => {
     // Check if it's on a road
     const isRoadX = Math.abs(x) % (unitStep * 3) === 0;
     const isRoadZ = Math.abs(z) % (unitStep * 3) === 0;
     if (isRoadX || isRoadZ) return false;

     // Check if occupied
     const occupied = buildings.some(b => 
        Math.abs(b.position[0] - x) < 1 && Math.abs(b.position[2] - z) < 1
     );
     if (occupied) return false;

     return true;
  };

  const handlePlaneMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isBuildMode) {
      if (ghostPos) setGhostPos(null);
      return;
    }
    e.stopPropagation();
    
    // Snap to grid
    const x = Math.round(e.point.x / unitStep) * unitStep;
    const z = Math.round(e.point.z / unitStep) * unitStep;
    
    // Bounds check
    if (x < -totalSize || x > totalSize || z < -totalSize || z > totalSize) {
        setGhostPos(null);
        return;
    }

    setGhostPos([x, 0, z]);
    setIsGhostValid(checkValidity(x, z));
  };

  const handlePlaneClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isBuildMode || !ghostPos || !isGhostValid) {
        if (!isBuildMode) onBuildingSelect(null); // Deselect on bg click
        return;
    }
    e.stopPropagation();

    const [x, , z] = ghostPos;
    
    // Add Building
    const newBuilding: BuildingData = {
        id: `custom-${Date.now()}`,
        position: [x, 0, z],
        height: buildHeight,
        width: 3,
        depth: 3
    };

    setBuildings(prev => [...prev, newBuilding]);
    
    // Animate pop effect? (Re-validation will happen next frame)
    setIsGhostValid(false); 
  };

  return (
    <group>
      {/* Floor with Interaction */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        receiveShadow
        onPointerMove={handlePlaneMove}
        onClick={handlePlaneClick}
        onPointerMissed={() => onBuildingSelect(null)}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
            color={isNight ? "#020617" : "#e2e8f0"} 
            roughness={0.8} 
            metalness={0.2}
        />
      </mesh>

      {/* Roads */}
      <group position={[0, 0.05, 0]}>
        {roadsX.map((x, i) => (
          <mesh key={`rx-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, 0]} receiveShadow>
             <planeGeometry args={[3, 100]} />
             <meshStandardMaterial color={isNight ? "#1e293b" : "#475569"} roughness={0.9} />
          </mesh>
        ))}
        {roadsZ.map((z, i) => (
           <mesh key={`rz-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]} receiveShadow>
              <planeGeometry args={[100, 3]} />
              <meshStandardMaterial color={isNight ? "#1e293b" : "#475569"} roughness={0.9} />
           </mesh>
        ))}
      </group>
      
      {/* Decorative Grid Helper */}
      <gridHelper 
        args={[100, 25, isNight ? 0x334155 : 0xcbd5e1, isNight ? 0x0f172a : 0xe2e8f0]} 
        position={[0, 0.02, 0]} 
      />

      {/* Ghost Building for Build Mode */}
      {isBuildMode && ghostPos && (
        <GhostBuilding position={ghostPos} height={buildHeight} isValid={isGhostValid} />
      )}

      {showTraffic && (
        <Traffic roadsX={roadsX} roadsZ={roadsZ} bounds={bounds} isNight={isNight} />
      )}

      <BuildingsRenderer 
        buildings={buildings} 
        onSelect={onBuildingSelect} 
        isNight={isNight}
      />
    </group>
  );
};

const BuildingsRenderer: React.FC<{ buildings: BuildingData[], onSelect: (b: BuildingData) => void, isNight: boolean }> = ({ buildings, onSelect, isNight }) => {
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
          isNight={isNight}
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
