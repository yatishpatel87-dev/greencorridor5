import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  Heart, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  ShieldCheck, 
  Volume2, 
  ArrowRight, 
  Compass, 
  Activity,
  Hospital,
  AlertCircle
} from 'lucide-react';
import { EmergencyRoute, RouteWaypoint } from '../types/emergency';
import { GUJARAT_EMERGENCY_ROUTES } from '../data/emergencyRoutes';
import { soundEngine } from '../services/soundEngine';

interface LiveCorridorRouteMapProps {
  currentRoute: EmergencyRoute;
  onRouteChange: (route: EmergencyRoute) => void;
  lang: 'gu' | 'en';
}

export const LiveCorridorRouteMap: React.FC<LiveCorridorRouteMapProps> = ({
  currentRoute,
  onRouteChange,
  lang,
}) => {
  const [progress, setProgress] = useState(0.25); // 0 (start) to 1.0 (hospital)
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(null);
  const [trafficDensity, setTrafficDensity] = useState<'light' | 'normal' | 'heavy'>('normal');
  const [signals, setSignals] = useState(currentRoute.signals);

  // Sync signals when route changes
  useEffect(() => {
    setSignals(currentRoute.signals);
    setProgress(0.15);
  }, [currentRoute]);

  const waypoints = currentRoute.waypoints || [
    { id: '1', xPercent: 15, yPercent: 75, nameGu: currentRoute.startPointGu, nameEn: currentRoute.startPointEn, type: 'pickup' },
    { id: '2', xPercent: 50, yPercent: 50, nameGu: 'ટ્રાફિક જંક્શન', nameEn: 'Traffic Junction', type: 'junction' },
    { id: '3', xPercent: 85, yPercent: 25, nameGu: currentRoute.hospitalGu, nameEn: currentRoute.hospitalEn, type: 'hospital' }
  ];

  // Automatic signal preemption as ambulance advances
  useEffect(() => {
    const totalWaypoints = waypoints.length;
    if (totalWaypoints < 2) return;

    setSignals(prevSignals => {
      let changed = false;
      const nextSignals = prevSignals.map((sig, idx) => {
        // Approximate junction progress threshold along route
        const sigProgressThreshold = (idx + 1) / (prevSignals.length + 1);
        const distanceToSig = sigProgressThreshold - progress;

        // When approaching within ~18% of route (~600m), trigger green corridor preemption
        if (distanceToSig >= -0.05 && distanceToSig <= 0.18 && !sig.isPreempted) {
          changed = true;
          soundEngine.playSignalPreemptionChime();
          return {
            ...sig,
            isPreempted: true,
            status: 'preempted' as const,
          };
        }
        return sig;
      });
      return changed ? nextSignals : prevSignals;
    });
  }, [progress, waypoints.length]);

  // Animation loop advancing ambulance along route
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setProgress(prev => {
          // Total route takes ~40 seconds at 1x speed
          const increment = (dt / 35) * speedMultiplier;
          const next = prev + increment;
          if (next >= 1) {
            return 1; // Reached hospital
          }
          return next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speedMultiplier]);

  // Compute interpolated vehicle position along waypoints
  const computeAmbulanceCoords = () => {
    if (waypoints.length < 2) return { x: 50, y: 50, angle: 0, currentSegment: 0 };
    
    const segmentCount = waypoints.length - 1;
    const scaledProgress = progress * segmentCount;
    const segmentIndex = Math.min(Math.floor(scaledProgress), segmentCount - 1);
    const segmentFraction = scaledProgress - segmentIndex;

    const p0 = waypoints[segmentIndex];
    const p1 = waypoints[segmentIndex + 1];

    const x = p0.xPercent + (p1.xPercent - p0.xPercent) * segmentFraction;
    const y = p0.yPercent + (p1.yPercent - p0.yPercent) * segmentFraction;

    const dx = p1.xPercent - p0.xPercent;
    const dy = p1.yPercent - p0.yPercent;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return { x, y, angle, currentSegment: segmentIndex };
  };

  const { x: ambX, y: ambY, angle: ambAngle, currentSegment } = computeAmbulanceCoords();

  // Next target waypoint
  const nextWaypoint = waypoints[Math.min(currentSegment + 1, waypoints.length - 1)];
  const currentWaypoint = waypoints[currentSegment];

  // Dynamic telemetry calculations
  const remainingDistanceKm = Math.max(0, Number(((1 - progress) * currentRoute.totalDistanceKm).toFixed(1)));
  const remainingMinutes = Math.max(0, Math.ceil((1 - progress) * currentRoute.priorityDurationMin));
  const hasArrived = progress >= 0.99;

  // Speak navigation guidance
  const handleSpeakInstruction = () => {
    const text = nextWaypoint.nextInstructionGu || `${currentRoute.hospitalGu} તરફ આગળ વધી રહ્યા છે`;
    soundEngine.speakGujarati(
      `૧૦૮ નેવિગેશન: ${text}. અંદાજે ${remainingDistanceKm} કિલોમીટર અંતર બાકી છે.`,
      `108 Navigation: Heading towards ${currentRoute.hospitalEn}. ${remainingDistanceKm} km remaining.`
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col space-y-4 p-5">
      {/* Top Header & Route Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              {lang === 'gu' ? 'લાઇવ ગ્રીન કોરિડોર જીપીએસ મેપ' : 'Live Green Corridor GPS Map'}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300 font-mono-nums">
              {currentRoute.cityGu} ({currentRoute.cityEn})
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white mt-1">
            {lang === 'gu' ? 'વાહન ક્યાં જવાનું છે? (રૂટ & હોસ્પિટલ નેવિગેશન)' : 'Where is the vehicle going? (Live Route & Destination)'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'gu'
              ? `${currentRoute.startPointGu} થી ${currentRoute.hospitalGu} સુધીનો જીવંત માર્ગ`
              : `Live tracking from ${currentRoute.startPointEn} to ${currentRoute.hospitalEn}`}
          </p>
        </div>

        {/* Corridor Route Selector Dropdown */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <select
            value={currentRoute.id}
            onChange={(e) => {
              const selected = GUJARAT_EMERGENCY_ROUTES.find(r => r.id === e.target.value);
              if (selected) {
                onRouteChange(selected);
                setProgress(0.1);
              }
            }}
            className="w-full lg:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {GUJARAT_EMERGENCY_ROUTES.map(r => (
              <option key={r.id} value={r.id}>
                {lang === 'gu' ? `${r.cityGu}: ${r.nameGu}` : `${r.cityEn}: ${r.nameEn}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Vector Map Display */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner select-none">
        {/* Subtle Map Grid lines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* SVG Route Canvas */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* City Landmark / River Outline */}
          <path
            d="M 50,0 Q 55,200 48,400"
            stroke="#1e293b"
            strokeWidth="28"
            fill="none"
            opacity="0.4"
          />

          {/* Background Full Road Track */}
          <path
            d={waypoints.map((wp, idx) => `${idx === 0 ? 'M' : 'L'} ${wp.xPercent}% ${wp.yPercent}%`).join(' ')}
            stroke="#334155"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Active Cleared Green Corridor Track (Glowing) */}
          <path
            d={waypoints.map((wp, idx) => `${idx === 0 ? 'M' : 'L'} ${wp.xPercent}% ${wp.yPercent}%`).join(' ')}
            stroke="url(#corridorGlow)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#glow)"
          />

          {/* Animated Directional Dash Line */}
          <path
            d={waypoints.map((wp, idx) => `${idx === 0 ? 'M' : 'L'} ${wp.xPercent}% ${wp.yPercent}%`).join(' ')}
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="8 12"
            strokeLinecap="round"
            fill="none"
            className="animate-[dash_1s_linear_infinite]"
          />
        </svg>

        {/* Waypoint Markers on Map */}
        {waypoints.map((wp, idx) => {
          const isPassed = (idx / (waypoints.length - 1)) <= progress;
          const isHospital = wp.type === 'hospital';
          const isPickup = wp.type === 'pickup';

          return (
            <div
              key={wp.id}
              onClick={() => setSelectedWaypointIndex(idx)}
              style={{ left: `${wp.xPercent}%`, top: `${wp.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
            >
              {/* Outer pulsing ring for Hospital & Current Goal */}
              {isHospital && (
                <div className="absolute -inset-2 rounded-full border-2 border-rose-500 animate-ping opacity-75" />
              )}

              {/* Pin Icon Bubble */}
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                isHospital
                  ? 'bg-rose-600 border-rose-300 text-white'
                  : isPickup
                  ? 'bg-emerald-600 border-emerald-300 text-white'
                  : isPassed
                  ? 'bg-emerald-500/90 border-emerald-300 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-400'
              }`}>
                {isHospital ? (
                  <Hospital className="w-4 h-4 fill-white" />
                ) : isPickup ? (
                  <MapPin className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>

              {/* Tooltip Label */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap px-2 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-[10px] font-semibold text-slate-200 pointer-events-none shadow-md">
                {lang === 'gu' ? wp.nameGu : wp.nameEn}
              </div>
            </div>
          );
        })}

        {/* Moving 108 Emergency Ambulance Marker on Map */}
        <div
          style={{
            left: `${ambX}%`,
            top: `${ambY}%`,
            transform: `translate(-50%, -50%)`,
          }}
          className="absolute z-20 transition-all duration-75 pointer-events-none"
        >
          {/* Beacon Glow Area */}
          <div className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping" />

          {/* Ambulance Vehicle Body */}
          <div className="relative w-11 h-11 rounded-2xl bg-white border-2 border-rose-600 shadow-2xl flex items-center justify-center">
            {/* Top Strobe Lights */}
            <div className="absolute -top-1 left-2 w-2 h-2 rounded-full bg-rose-600 animate-siren-red" />
            <div className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-blue-600 animate-siren-blue" />

            <div className="flex flex-col items-center">
              <span className="text-[9px] font-extrabold text-rose-600 leading-tight">૧૦૮</span>
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 animate-pulse" />
            </div>
          </div>

          {/* Real-time Location Pin Callout */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>{hasArrived ? (lang === 'gu' ? 'હોસ્પિટલ પહોંચ્યા!' : 'ARRIVED!') : (lang === 'gu' ? '૧૦૮ એમ્બ્યુલન્સ લાઈવ' : '108 EN ROUTE')}</span>
          </div>
        </div>

        {/* Destination Hospital Callout Banner on Map (Top Right) */}
        <div className="absolute top-3 right-3 z-10 max-w-xs bg-slate-950/90 backdrop-blur-md border border-rose-500/50 rounded-xl p-2.5 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center shrink-0">
              <Hospital className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                {lang === 'gu' ? 'મંજિલ હોસ્પિટલ (DESTINATION):' : 'DESTINATION HOSPITAL:'}
              </span>
              <span className="text-xs font-bold text-white line-clamp-1">
                {lang === 'gu' ? currentRoute.hospitalGu : currentRoute.hospitalEn}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Live Telemetry HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            {lang === 'gu' ? 'પીકઅપ સ્થળ (Origin)' : 'Pickup Origin'}
          </span>
          <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">
            {lang === 'gu' ? currentRoute.startPointGu : currentRoute.startPointEn}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
            {lang === 'gu' ? 'ક્યાં જવાનું છે (Destination)' : 'Destination'}
          </span>
          <span className="text-xs font-bold text-rose-300 mt-0.5 block truncate">
            {lang === 'gu' ? currentRoute.hospitalGu : currentRoute.hospitalEn}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
            {lang === 'gu' ? 'બાકી અંતર (Distance Left)' : 'Distance Left'}
          </span>
          <span className="text-sm font-bold text-emerald-400 font-mono-nums mt-0.5 block">
            {remainingDistanceKm} km
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
            {lang === 'gu' ? 'અંદાજિત સમય (ETA)' : 'ETA to Hospital'}
          </span>
          <span className="text-sm font-bold text-amber-400 font-mono-nums mt-0.5 block">
            {hasArrived ? (lang === 'gu' ? 'પહોંચી ગયા' : 'Arrived') : `${remainingMinutes} min`}
          </span>
        </div>
      </div>

      {/* Turn-by-Turn Instruction Banner */}
      <div className="p-3 bg-gradient-to-r from-indigo-950/60 to-slate-950 rounded-xl border border-indigo-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4 rotate-45" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
              {lang === 'gu' ? 'આગામી દિશા નિર્દેશ (Next Navigation Step):' : 'Next Navigation Instruction:'}
            </span>
            <span className="text-xs font-semibold text-white">
              {lang === 'gu'
                ? (nextWaypoint.nextInstructionGu || `સીધા આગળ વધી ${currentRoute.hospitalGu} પહોંચો`)
                : (nextWaypoint.nextInstructionEn || `Proceed to ${currentRoute.hospitalEn}`)}
            </span>
          </div>
        </div>

        <button
          onClick={handleSpeakInstruction}
          className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          title="Speak instruction in Gujarati"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'gu' ? 'દિશા સાંભળો' : 'Speak'}</span>
        </button>
      </div>

      {/* Rush Hour Traffic Density Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
            {lang === 'gu' ? 'શહેરી ટ્રાફિક પરિસ્થિતિ (City Traffic Density):' : 'City Traffic Congestion Scenario:'}
          </span>
          <span className="text-xs text-slate-400">
            {trafficDensity === 'heavy'
              ? (lang === 'gu' ? 'સાંજે પીક અવર્સ (ભારે ટ્રાફિક) · ગ્રીન કોરિડોરથી ૩૫+ મિનિટ બચી રહી છે' : 'Peak Evening Hours · Green corridor saves 35+ mins')
              : trafficDensity === 'light'
              ? (lang === 'gu' ? 'હળવો ટ્રાફિક (રાત્રિ / વહેલી સવાર)' : 'Light Traffic (Off-peak / Night)')
              : (lang === 'gu' ? 'સામાન્ય દિવસનો ટ્રાફિક · સરેરાશ ૨૪ મિનિટ બચત' : 'Normal Daytime Traffic · ~24 mins saved')}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setTrafficDensity('light')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              trafficDensity === 'light'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'gu' ? 'હળવો' : 'Light'}
          </button>
          <button
            onClick={() => setTrafficDensity('normal')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              trafficDensity === 'normal'
                ? 'bg-slate-800 text-amber-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'gu' ? 'સામાન્ય' : 'Normal'}
          </button>
          <button
            onClick={() => setTrafficDensity('heavy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              trafficDensity === 'heavy'
                ? 'bg-rose-600 text-white font-bold shadow-sm animate-pulse'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'gu' ? 'પીક અવર્સ (ભારે)' : 'Rush Hour'}
          </button>
        </div>
      </div>

      {/* Corridor Traffic Signal Preemption Matrix */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'gu'
                ? 'રૂટ ટ્રાફિક સિગ્નલ પ્રિ-એમ્પશન નેટવર્ક (૧૦૮ ગ્રીન વેવ)'
                : 'Route Traffic Signal Preemption Network (108 Green Wave)'}
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-nums">
            {signals.filter(s => s.isPreempted).length}/{signals.length} {lang === 'gu' ? 'ગ્રીન લૉક' : 'Locked'}
          </span>
        </div>

        {/* Horizontal Scrollable Signal Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {signals.map((sig, idx) => {
            const isPreempted = sig.isPreempted;
            return (
              <div
                key={sig.id}
                className={`p-3 rounded-xl border transition-all ${
                  isPreempted
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="font-mono-nums text-slate-400">Junction {idx + 1}</span>
                  {isPreempted ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      GREEN
                    </span>
                  ) : (
                    <span className="font-bold text-rose-400">RED STOP</span>
                  )}
                </div>

                <div className="font-bold text-xs text-white truncate" title={lang === 'gu' ? sig.nameGu : sig.nameEn}>
                  {lang === 'gu' ? sig.nameGu : sig.nameEn}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5" title={lang === 'gu' ? sig.crossStreetGu : sig.crossStreetEn}>
                  {lang === 'gu' ? sig.crossStreetGu : sig.crossStreetEn}
                </div>

                {/* Preempt Toggle Button */}
                <button
                  onClick={() => {
                    setSignals(prev =>
                      prev.map(s => {
                        if (s.id === sig.id) {
                          const nextPreempt = !s.isPreempted;
                          if (nextPreempt) {
                            soundEngine.playSignalPreemptionChime();
                          }
                          return {
                            ...s,
                            isPreempted: nextPreempt,
                            status: nextPreempt ? ('preempted' as const) : ('red' as const),
                          };
                        }
                        return s;
                      })
                    );
                  }}
                  className={`w-full mt-2 py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    isPreempted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isPreempted
                    ? (lang === 'gu' ? '✓ ગ્રીન લૉક' : '✓ Preempted')
                    : (lang === 'gu' ? 'લૉક કરો' : 'Preempt')}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Waypoint Detail Drawer (if selected) */}
      {selectedWaypointIndex !== null && waypoints[selectedWaypointIndex] && (
        <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                {lang === 'gu' ? waypoints[selectedWaypointIndex].nameGu : waypoints[selectedWaypointIndex].nameEn}
              </span>
              <span className="text-slate-400 text-[11px]">
                {waypoints[selectedWaypointIndex].nextInstructionGu || 'ગ્રીન કોરિડોર સુરક્ષા કંટ્રોલ દ્વારા નિરીક્ષણ હેઠળ'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedWaypointIndex(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
          >
            {lang === 'gu' ? 'બંધ કરો' : 'Close'}
          </button>
        </div>
      )}

      {/* Simulation Controls Bottom Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? (lang === 'gu' ? 'થોભો' : 'Pause') : (lang === 'gu' ? 'શરૂ' : 'Play')}</span>
          </button>

          {/* Reset */}
          <button
            onClick={() => setProgress(0)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'gu' ? 'રૂટ રીસેટ' : 'Reset'}</span>
          </button>

          {/* Speed Multiplier */}
          <button
            onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-emerald-400 font-mono-nums cursor-pointer"
            title="Speed"
          >
            {speedMultiplier}x Speed
          </button>
        </div>

        {/* Route Progress Slider */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-[10px] text-slate-400 font-mono-nums">0%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 font-mono-nums">{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
