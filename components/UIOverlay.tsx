
import React, { useState } from 'react';
import { BuildingData } from '../types';
import { AppConfig } from '../App';

interface UIOverlayProps {
  selectedBuilding: BuildingData | null;
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ selectedBuilding, timeOfDay, setTimeOfDay, config, setConfig }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Format time string (e.g. 14:30)
  const formatTime = (val: number) => {
    const hours = Math.floor(val);
    const minutes = Math.floor((val % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isNight = timeOfDay < 6 || timeOfDay > 18;

  const handleConfigChange = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="pointer-events-auto flex justify-between items-start">
        <div>
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

        {/* Floating Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border border-slate-700 p-3 rounded-full backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95 group"
          aria-label="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-700 ${isSettingsOpen ? 'rotate-180' : 'group-hover:rotate-90'}`}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="absolute top-20 right-6 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-right-10 fade-in duration-200">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="text-cyan-400">///</span> CONFIGURATION
          </h3>

          <div className="space-y-6">
            
            {/* Time Control */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>TIME OF DAY</span>
                <span className="text-cyan-400">{formatTime(timeOfDay)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="24" 
                step="0.1"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                <span>00:00</span>
                <span>12:00</span>
                <span>24:00</span>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Fog Distance */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>VISIBILITY (FOG)</span>
                <span className="text-white">{config.fogDistance}m</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="300" 
                step="10"
                value={config.fogDistance}
                onChange={(e) => handleConfigChange('fogDistance', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Bloom Strength */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>GLOW STRENGTH</span>
                <span className="text-white">{(config.bloomStrength * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="3" 
                step="0.1"
                value={config.bloomStrength}
                onChange={(e) => handleConfigChange('bloomStrength', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <hr className="border-slate-800" />

            {/* Toggles */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">AUTO-ROTATE CAM</span>
              <button 
                onClick={() => handleConfigChange('autoRotate', !config.autoRotate)}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${config.autoRotate ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${config.autoRotate ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">TRAFFIC SIM</span>
              <button 
                onClick={() => handleConfigChange('showTraffic', !config.showTraffic)}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${config.showTraffic ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${config.showTraffic ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Info Panel (Bottom Left now, to not overlap with center/footer) */}
      <div className={`absolute bottom-6 left-6 transition-all duration-300 transform ${selectedBuilding ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
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

      {/* Footer Instructions */}
      <div className={`absolute bottom-6 w-full text-center pointer-events-none text-xs font-mono transition-colors duration-1000 ${isNight ? 'text-slate-500' : 'text-slate-400'}`}>
        LMB: SELECT • RMB: ROTATE • SCROLL: ZOOM
      </div>
    </div>
  );
};

export default UIOverlay;
