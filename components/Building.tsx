
import React, { useRef, useEffect, useState } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import '../types';

interface BuildingProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  isHovered: boolean;
  isSelected: boolean;
  isNight: boolean;
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}

const Shockwave = () => {
  const ringRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(true);

  useFrame((state, delta) => {
    if (active && ringRef.current) {
      const ring = ringRef.current;
      ring.scale.x += delta * 15;
      ring.scale.y += delta * 15;
      
      const material = ring.material as THREE.MeshBasicMaterial;
      material.opacity -= delta * 1.5;

      if (material.opacity <= 0) {
        setActive(false);
      }
    }
  });

  if (!active) return null;

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      <ringGeometry args={[1, 1.2, 32]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={1} toneMapped={false} />
    </mesh>
  );
};

const Building: React.FC<BuildingProps> = ({
  position,
  height,
  width,
  depth,
  isHovered,
  isSelected,
  isNight,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [wasSelected, setWasSelected] = useState(false);
  const [triggerEffect, setTriggerEffect] = useState(0);

  // Target colors based on Time of Day
  // Day: White building, Grey edges
  // Night: Dark building, Neon edges
  
  const baseColor = isNight ? new THREE.Color('#1e293b') : new THREE.Color('#ffffff');
  const hoverColor = isNight ? new THREE.Color('#334155') : new THREE.Color('#f1f5f9');
  const selectedColor = isNight ? new THREE.Color('#0f172a') : new THREE.Color('#ffffff');
  
  const baseEmissive = new THREE.Color('#000000');
  const selectedEmissive = new THREE.Color('#22d3ee');

  // Edge Colors
  const edgeColor = isNight ? (isSelected ? "#22d3ee" : "#0ea5e9") : (isSelected ? "#0284c7" : "#cbd5e1");
  const edgeOpacity = isNight ? (isSelected ? 1.0 : 0.6) : (isSelected ? 1.0 : 0.5);

  useEffect(() => {
    if (isSelected && !wasSelected) {
        setTriggerEffect(prev => prev + 1);
    }
    setWasSelected(isSelected);
  }, [isSelected, wasSelected]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    
    let targetColor = baseColor;
    let targetEmissive = baseEmissive;
    let targetEmissiveIntensity = 0;

    if (isSelected) {
      targetColor = selectedColor;
      targetEmissive = selectedEmissive;
      targetEmissiveIntensity = isNight ? 0.8 : 0.2; 
    } else if (isHovered) {
      targetColor = hoverColor;
    }

    material.color.lerp(targetColor, delta * 5);
    material.emissive.lerp(targetEmissive, delta * 5);
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissiveIntensity, delta * 5);
  });

  return (
    <group position={position}>
      {/* Visual Mesh */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          roughness={isNight ? 0.2 : 0.8}
          metalness={isNight ? 0.5 : 0.1}
          color={baseColor}
        />
        <Edges
          linewidth={1.5}
          threshold={15}
          color={edgeColor}
          opacity={edgeOpacity}
          transparent
        />
      </mesh>

      {/* Shockwave Effect on Click */}
      {triggerEffect > 0 && (
         <Shockwave key={triggerEffect} />
      )}
    </group>
  );
};

export default Building;
