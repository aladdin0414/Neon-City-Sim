import React from 'react';

export interface BuildingData {
  id: string;
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
}

export interface CityConfig {
  gridSize: number;
  spacing: number;
}

// Augment the global JSX namespace to include React Three Fiber intrinsic elements
// This fixes errors where these elements are not recognized by TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      planeGeometry: any;
      gridHelper: any;
      color: any;
      fog: any;
      ambientLight: any;
      directionalLight: any;
      orthographicCamera: any;
      instancedMesh: any;
      meshBasicMaterial: any;
      ringGeometry: any;
    }
  }
}
