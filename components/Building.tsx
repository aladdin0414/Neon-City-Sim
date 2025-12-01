
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
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [wasSelected, setWasSelected] = useState(false);
  const [triggerEffect, setTriggerEffect] = useState(0);

  // Target colors - White Model Aesthetic
  const baseColor = new THREE.Color('#f8fafc'); // Very white grey
  const hoverColor = new THREE.Color('#e2e8f0'); // Slightly darker on hover
  const selectedColor = new THREE.Color('#ffffff'); // Pure white on select
  
  // Emissive
  const baseEmissive = new THREE.Color('#000000');
  const selectedEmissive = new THREE.Color('#22d3ee'); // Cyan glow

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
      targetEmissiveIntensity = 0.5; // Subtle glow
    } else if (isHovered) {
      targetColor = hoverColor;
    }

    material.color.lerp(targetColor, delta * 10);
    material.emissive.lerp(targetEmissive, delta * 10);
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissiveIntensity, delta * 10);

    // Scale animation
    const targetScaleY = isSelected ? 1 : 1; 
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, delta * 10);
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
          roughness={0.2}
          metalness={0.1} // Plaster/White model feel
          color={baseColor}
        />
        <Edges
          linewidth={1.5}
          threshold={15}
          color={isSelected ? "#22d3ee" : "#94a3b8"} // Cyan edges when selected
          opacity={isSelected ? 0.8 : 0.3}
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
