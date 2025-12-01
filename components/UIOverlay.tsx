
import React from 'react';
import { BuildingData } from '../types';

interface UIOverlayProps {
  selectedBuilding: BuildingData | null;
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ selectedBuilding, timeOfDay, setTimeOfDay }) => {
  // Format time string (e.g. 14:30)
  const formatTime = (val: number) => {
    const hours = Math.floor(val);
    const minutes = Math.floor((val % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isNight = timeOfDay < 6 || timeOfDay > 18;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="pointer-events-auto">
        <h1 className={`text-4xl font-bold tracking-tighter drop-shadow-lg transition-colors duration-1000 ${isNight ? 'text-white' : 'text-slate-800'}`}>
          SIM <span className="text-cyan-400">CITY</span>
        </h1>
        <p className={`mt-2 text-sm max-w-xs transition-colors duration-1000 ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
          Interactive White-Model Simulation. <br/>
          <span className="font-mono text-xs opacity-70">
            {isNight ? 'NIGHT MODE ACTIVE' : 'DAYLIGHT SIMULATION'}
          </span>
        </p>
      </div>

      {/* Info Panel */}
      <div className={`transition-all duration-300 transform ${selectedBuilding ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {selectedBuilding && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-6 rounded-lg pointer-events-auto max-w-sm w-full shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
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

      {/* Controls Footer */}
      <div className="w-full flex flex-col items-center pointer-events-auto pb-4">
        {/* Time Slider */}
        <div className="bg-slate-900/90 backdrop-blur rounded-full px-8 py-3 border border-slate-700 flex items-center gap-4 shadow-xl mb-4">
            <span className="text-slate-400 font-mono text-xs">00:00</span>
            <input 
              type="range" 
              min="0" 
              max="24" 
              step="0.1"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
              className="w-64 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-slate-400 font-mono text-xs">24:00</span>
            <div className="w-px h-8 bg-slate-700 mx-2"></div>
            <span className="text-cyan-400 font-mono font-bold w-12 text-center">{formatTime(timeOfDay)}</span>
        </div>

        <div className={`text-xs font-mono transition-colors duration-1000 ${isNight ? 'text-slate-500' : 'text-slate-400'}`}>
          LMB: SELECT • RMB: ROTATE • SCROLL: ZOOM
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
