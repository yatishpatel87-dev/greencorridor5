import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Radio, 
  Zap, 
  Activity, 
  Heart,
  Sliders
} from 'lucide-react';
import { SirenMode } from '../types/emergency';
import { soundEngine } from '../services/soundEngine';

interface ContinuousSirenBarProps {
  lang: 'gu' | 'en';
}

export const ContinuousSirenBar: React.FC<ContinuousSirenBarProps> = ({ lang }) => {
  const [isPlaying, setIsPlaying] = useState(soundEngine.isPlaying());
  const [sirenMode, setSirenMode] = useState<SirenMode>(soundEngine.getSirenMode());
  const [volume, setVolume] = useState(soundEngine.getVolume());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const unsubscribe = soundEngine.subscribeSiren((active, mode) => {
      setIsPlaying(active);
      setSirenMode(mode);
    });
    return unsubscribe;
  }, []);

  const handleToggleSiren = () => {
    soundEngine.toggleContinuousSiren(sirenMode);
  };

  const handleSelectMode = (mode: SirenMode) => {
    setSirenMode(mode);
    if (isPlaying) {
      soundEngine.setSirenMode(mode);
    } else {
      soundEngine.startSiren(mode);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol);
  };

  return (
    <div className={`transition-all duration-300 rounded-2xl border p-4 ${
      isPlaying
        ? 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-rose-500 shadow-2xl shadow-rose-950/80 ring-2 ring-rose-500/30'
        : 'bg-slate-900/90 border-slate-800'
    }`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Emergency Status & Flashing Strobe */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Dual LED Beacon */}
          <div className="relative w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
            {isPlaying ? (
              <>
                <div className="absolute top-1.5 left-2 w-3 h-3 rounded-full bg-rose-500 animate-siren-red" />
                <div className="absolute top-1.5 right-2 w-3 h-3 rounded-full bg-blue-500 animate-siren-blue" />
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/40 animate-emergency-pulse mt-2" />
              </>
            ) : (
              <>
                <div className="absolute top-1.5 left-2 w-3 h-3 rounded-full bg-rose-950" />
                <div className="absolute top-1.5 right-2 w-3 h-3 rounded-full bg-blue-950" />
                <Heart className="w-5 h-5 text-slate-600 mt-2" />
              </>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${isPlaying ? 'text-rose-400' : 'text-slate-400'}`}>
                {isPlaying 
                  ? (lang === 'gu' ? '૧૦૮ સતત સાયરન ચાલુ છે' : '108 CONTINUOUS SIREN ACTIVE')
                  : (lang === 'gu' ? '૧૦૮ સાયરન કંટ્રોલ પેનલ' : '108 SIREN CONTROLLER')}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-0.5">
              {isPlaying
                ? (lang === 'gu' 
                    ? `મોડ: ${sirenMode.toUpperCase()} · સતત અવાજ ચાલુ રહેશે જ્યાં સુધી બંધ ન કરો`
                    : `Mode: ${sirenMode.toUpperCase()} · Continuous broadcast active`)
                : (lang === 'gu'
                    ? 'બટન દબાવીને એકધારી સાયરન શરૂ કરો'
                    : 'Click to start continuous ambulance siren')}
            </p>
          </div>
        </div>

        {/* Center: Live Audio Equalizer Waves (animated when active) */}
        {isPlaying && (
          <div className="hidden lg:flex items-center gap-1 h-8 px-4 bg-slate-950/60 rounded-xl border border-rose-900/40">
            <span className="w-1 bg-rose-500 rounded animate-[emergencyPulse_0.4s_ease-in-out_infinite] h-5" />
            <span className="w-1 bg-amber-400 rounded animate-[emergencyPulse_0.6s_ease-in-out_infinite] h-7" />
            <span className="w-1 bg-blue-500 rounded animate-[emergencyPulse_0.3s_ease-in-out_infinite] h-4" />
            <span className="w-1 bg-rose-500 rounded animate-[emergencyPulse_0.5s_ease-in-out_infinite] h-6" />
            <span className="w-1 bg-emerald-400 rounded animate-[emergencyPulse_0.7s_ease-in-out_infinite] h-8" />
            <span className="w-1 bg-rose-500 rounded animate-[emergencyPulse_0.4s_ease-in-out_infinite] h-5" />
            <span className="w-1 bg-blue-500 rounded animate-[emergencyPulse_0.6s_ease-in-out_infinite] h-7" />
            <span className="text-[11px] font-mono-nums font-bold text-rose-300 ml-2">
              {sirenMode === 'yelp' ? '2.4 Hz' : sirenMode === 'piercer' ? '4.2 Hz' : '0.32 Hz'}
            </span>
          </div>
        )}

        {/* Right: Master Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Continuous Play / Stop Button */}
          <button
            onClick={handleToggleSiren}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950 animate-pulse ring-2 ring-rose-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>
              {isPlaying
                ? (lang === 'gu' ? 'સાયરન બંધ કરો' : 'STOP SIREN')
                : (lang === 'gu' ? 'સતત સાયરન ચાલુ કરો' : 'CONTINUE SIREN')}
            </span>
          </button>

          {/* Mode Selector Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => handleSelectMode('wail')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                sirenMode === 'wail'
                  ? 'bg-slate-800 text-rose-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Wail: Slow high-low emergency sweep"
            >
              Wail
            </button>

            <button
              onClick={() => handleSelectMode('yelp')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                sirenMode === 'yelp'
                  ? 'bg-slate-800 text-rose-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Yelp: Fast emergency cycling"
            >
              Yelp
            </button>

            <button
              onClick={() => handleSelectMode('hi_lo')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                sirenMode === 'hi_lo'
                  ? 'bg-slate-800 text-rose-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hi-Lo: European dual tone horn"
            >
              Hi-Lo
            </button>

            <button
              onClick={() => handleSelectMode('piercer')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                sirenMode === 'piercer'
                  ? 'bg-slate-800 text-rose-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Piercer: Ultra fast intersection phaser"
            >
              Piercer
            </button>
          </div>

          {/* Electric Air Horn Blast Button */}
          <button
            onClick={() => soundEngine.playAirHornBlast()}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-amber-950 cursor-pointer"
            title="Press for high-decibel vehicle air horn blast"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>{lang === 'gu' ? 'હોર્ન બ્લાસ્ટ' : 'AIR HORN'}</span>
          </button>

          {/* Volume Control */}
          <div className="relative">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Volume"
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
            </button>

            {showVolumeSlider && (
              <div className="absolute right-0 bottom-full mb-2 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 flex items-center gap-2 w-44">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-800 h-2 rounded cursor-pointer"
                />
                <span className="text-[11px] font-mono-nums font-bold text-slate-300 w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
