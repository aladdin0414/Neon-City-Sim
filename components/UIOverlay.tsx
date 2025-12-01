
import React from 'react';
import { BuildingData } from '../types';

interface UIOverlayProps {
  selectedBuilding: BuildingData | null;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ selectedBuilding }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="pointer-events-auto">
        <h1 className="text-4xl font-bold text-white tracking-tighter drop-shadow-lg">
          SIM <span className="text-cyan-400">CITY</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm max-w-xs">
          Interactive White-Model Simulation. <br/>
          Traffic density: <span className="text-emerald-400">LOW</span>
        </p>
      </div>

      {/* Info Panel */}
      <div className={`transition-all duration-300 transform ${selectedBuilding ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {selectedBuilding && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-6 rounded-lg pointer-events-auto max-w-sm w-full shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyan-50 text-white">
                SECTOR <span className="text-cyan-400 font-mono text-base ml-2">
                    {Math.abs(Math.floor(selectedBuilding.position[0]/10))}{Math.abs(Math.floor(selectedBuilding.position[2]/10))}
                </span>
              </h2>
              <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Class</span>
                <span className="text-white">{selectedBuilding.height > 25 ? 'High-Rise' : selectedBuilding.height > 10 ? 'Commercial' : 'Residential'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Height</span>
                <span className="text-white">{selectedBuilding.height.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Footprint</span>
                <span className="text-white">{(selectedBuilding.width * selectedBuilding.depth).toFixed(1)} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Grid Pos</span>
                <span className="text-cyan-400">[{selectedBuilding.position[0]}, {selectedBuilding.position[2]}]</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 text-right pointer-events-none">
        <div className="text-xs text-slate-500 font-mono">
          LMB: SELECT • RMB: ROTATE • SCROLL: ZOOM
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
