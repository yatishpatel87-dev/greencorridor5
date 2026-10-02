import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ArrowLeft, 
  Award, 
  Clock, 
  Activity,
  Heart,
  Car,
  Zap
} from 'lucide-react';
import { AmbulanceData, DriverState } from '../types/emergency';
import { soundEngine } from '../services/soundEngine';

interface DriverHudViewProps {
  ambulance: AmbulanceData;
  driverState: DriverState;
  onYieldSuccess: () => void;
  lang: 'gu' | 'en';
}

export const DriverHudView: React.FC<DriverHudViewProps> = ({
  ambulance,
  driverState,
  onYieldSuccess,
  lang,
}) => {
  const [distance, setDistance] = useState(ambulance.distanceToDriverMeters);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [hasYieldedLocal, setHasYieldedLocal] = useState(driverState.hasYielded);
  const [reactionTimer, setReactionTimer] = useState(0);

  // Proximity countdown simulation
  useEffect(() => {
    const interval = window.setInterval(() => {
      setDistance((prev) => {
        if (prev <= 30) return 30; // Passed
        const decrement = Math.floor(Math.random() * 8) + 12;
        const nextDist = Math.max(30, prev - decrement);

        // Sound ping at specific proximity thresholds
        if (!isAudioMuted) {
          if (nextDist < 200 && nextDist > 180) {
            soundEngine.playProximityPing('urgent');
          } else if (nextDist < 400 && nextDist > 380) {
            soundEngine.playProximityPing('caution');
          }
        }

        return nextDist;
      });
      setReactionTimer(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAudioMuted]);

  // Urgency classification based on distance
  const getAlertLevel = () => {
    if (distance <= 150) return 'urgent';
    if (distance <= 450) return 'caution';
    return 'safe';
  };

  const alertLevel = getAlertLevel();

  const handleYield = () => {
    setHasYieldedLocal(true);
    soundEngine.playChimeSuccess();
    soundEngine.speakGujarati(
      'આભાર! તમે ૧૦૮ એમ્બ્યુલન્સને રસ્તો આપ્યો. એક જીવ બચી શકે છે.',
      'Thank you! You cleared the lane for the emergency vehicle.'
    );
    onYieldSuccess();
  };

  const handleSpeakAlert = () => {
    soundEngine.speakGujarati(
      `સાવધાન! ૧૦૮ એમ્બ્યુલન્સ ${distance} મીટર પાછળ આવી રહી છે. કૃપા કરીને વાહન તાત્કાલિક ડાબી બાજુ ખસેડો!`,
      `Caution! Emergency ambulance is approaching behind. Please pull over to the left lane immediately.`
    );
  };

  return (
    <div className="space-y-6">
      {/* High Urgency Heads-Up Banner */}
      <div 
        className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-500 ${
          alertLevel === 'urgent'
            ? 'bg-rose-950/80 border-rose-500 shadow-2xl shadow-rose-950/80 ring-2 ring-rose-500/40'
            : alertLevel === 'caution'
            ? 'bg-amber-950/70 border-amber-500/80 shadow-xl'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        {/* Flashing strobe bar */}
        {alertLevel === 'urgent' && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse" />
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
              alertLevel === 'urgent'
                ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-emergency-pulse'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
            }`}>
              <Activity className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                  alertLevel === 'urgent' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                }`} />
                <span className={alertLevel === 'urgent' ? 'text-rose-400' : 'text-amber-400'}>
                  {alertLevel === 'urgent'
                    ? (lang === 'gu' ? 'કટોકટી સાયરન નજીક છે' : 'CRITICAL PROXIMITY ALERT')
                    : (lang === 'gu' ? 'સાવધાન: એમ્બ્યુલન્સ એપ્રોચ' : 'CAUTION: APPROACHING AMBULANCE')}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-400 font-mono-nums">{ambulance.regNumber}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                {lang === 'gu'
                  ? '૧૦૮ એમ્બ્યુલન્સ આવી રહી છે - કૃપા કરીને ડાબી બાજુ ખસો!'
                  : 'Emergency 108 Approaching - Move to the Left Lane!'}
              </h2>

              <p className="text-sm text-slate-300 mt-1">
                {lang === 'gu'
                  ? `દર્દી કટોકટી: ${ambulance.patientTypeGu} · ગંતવ્ય: ${ambulance.destinationHospitalGu}`
                  : `Condition: ${ambulance.patientTypeEn} · Destination: ${ambulance.destinationHospitalEn}`}
              </p>
            </div>
          </div>

          {/* Quick Audio & Speech Controls */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => soundEngine.playAirHornBlast()}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-amber-950 cursor-pointer"
              title="Test 108 air horn in driver cabin"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>{lang === 'gu' ? '૧૦૮ હોર્ન સાંભળો' : 'Test Horn'}</span>
            </button>

            <button
              onClick={handleSpeakAlert}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Speak alert in Gujarati"
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'gu' ? 'અવાજ ચેતવણી' : 'Voice Alert'}</span>
            </button>

            <button
              onClick={() => {
                const nextMute = !isAudioMuted;
                setIsAudioMuted(nextMute);
                if (nextMute) {
                  soundEngine.stopSiren();
                }
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
              title={isAudioMuted ? 'Unmute siren' : 'Mute siren'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Cockpit Rear-View Mirror (રિયર-વ્યૂ મિરર) Interactive HUD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>{lang === 'gu' ? 'લાઇવ રિયર-વ્યૂ મિરર (પાછળ જોવાનો અરીસો)' : 'Live Cockpit Rear-View Mirror'}</span>
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {hasYieldedLocal 
              ? (lang === 'gu' ? '✓ તમે ડાબી લેનમાં સલામત છો' : '✓ Pulled safely into left lane')
              : (lang === 'gu' ? '૧૦૮ બરાબર પાછળ છે - ડાબે ખસો!' : 'Ambulance directly behind - Move Left!')}
          </span>
        </div>

        {/* Realistic Automotive Rear-View Mirror Case */}
        <div className="max-w-3xl mx-auto p-1.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700">
          <div className="relative h-44 sm:h-52 w-full rounded-[22px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden border border-slate-800 shadow-inner">
            {/* Anti-glare bluish mirror coating sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-950/20 via-transparent to-white/5 pointer-events-none z-20" />

            {/* Mirror Perspective Road Canvas Behind Driver */}
            <div className="absolute inset-0 flex flex-col justify-end">
              {/* Vanishing horizon */}
              <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-slate-950 to-transparent z-10" />

              {/* Highway Asphalt Road perspective */}
              <div className="relative w-full h-full flex justify-center items-end pb-2 overflow-hidden">
                {/* Road surface */}
                <div 
                  className="w-full h-full relative"
                  style={{
                    background: 'linear-gradient(180deg, #090d16 0%, #0f172a 100%)',
                  }}
                >
                  {/* Perspective Lane Lines */}
                  {/* Left Lane separator */}
                  <div className="absolute top-0 bottom-0 left-[32%] w-1 border-r-2 border-dashed border-amber-400/40" />
                  {/* Right Lane separator */}
                  <div className="absolute top-0 bottom-0 right-[32%] w-1 border-r-2 border-dashed border-white/40" />

                  {/* Lane Labels in Mirror */}
                  <div className="absolute top-3 left-[14%] text-[10px] font-bold text-emerald-400/70 uppercase">
                    {lang === 'gu' ? 'ડાબી લેન' : 'Left Lane'}
                  </div>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400/70 uppercase">
                    {lang === 'gu' ? 'મધ્યમ લેન' : 'Center Lane'}
                  </div>
                  <div className="absolute top-3 right-[14%] text-[10px] font-bold text-rose-400/70 uppercase">
                    {lang === 'gu' ? 'કોરિડોર લેન' : 'Corridor Lane'}
                  </div>

                  {/* Your Car Position Indicator in Mirror Bottom Edge */}
                  <div 
                    className={`absolute bottom-1 z-30 transition-all duration-700 flex flex-col items-center ${
                      hasYieldedLocal ? 'left-[16%]' : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    <div className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-emerald-400 shadow">
                      {lang === 'gu' ? 'તમારું વાહન' : 'Your Car'}
                    </div>
                    <div className="w-10 h-3 bg-emerald-500/30 rounded-t-lg border-t-2 border-emerald-400 mt-0.5" />
                  </div>

                  {/* The Approaching 108 Ambulance Vehicle in Mirror */}
                  <div
                    style={{
                      left: hasYieldedLocal ? '72%' : '50%',
                      bottom: `${Math.min(75, Math.max(15, (500 - distance) / 5.8))}%`,
                      transform: 'translate(-50%, 50%)',
                    }}
                    className="absolute z-20 flex flex-col items-center transition-all duration-700 select-none"
                  >
                    {/* Flashing Strobe Light Aura on mirror glass */}
                    <div className="absolute -inset-8 bg-gradient-to-r from-rose-500/25 via-blue-500/25 to-rose-500/25 rounded-full animate-ping opacity-75 pointer-events-none" />

                    {/* Dual Strobe Beacons on Roof */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-3.5 h-2 rounded bg-rose-500 shadow-lg shadow-rose-500 animate-siren-red" />
                      <div className="w-3.5 h-2 rounded bg-blue-500 shadow-lg shadow-blue-500 animate-siren-blue" />
                    </div>

                    {/* Ambulance Front Grille & Livery Box */}
                    <div 
                      className="rounded-xl bg-white border-2 border-rose-600 shadow-2xl flex flex-col items-center justify-center p-1.5 transition-all"
                      style={{
                        width: `${Math.min(96, Math.max(52, 96 - (distance / 8)))}px`,
                        height: `${Math.min(68, Math.max(38, 68 - (distance / 10)))}px`,
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-extrabold text-rose-600 leading-none">૧૦૮</span>
                        <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 animate-pulse" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-800 tracking-tighter mt-0.5 font-mono">
                        EMERGENCY
                      </span>

                      {/* Headlights with High-Beam Flash */}
                      <div className="flex justify-between w-full px-1 mt-1">
                        <div className="w-2.5 h-1.5 rounded-sm bg-yellow-200 shadow-md shadow-yellow-200 animate-pulse" />
                        <div className="w-2.5 h-1.5 rounded-sm bg-yellow-200 shadow-md shadow-yellow-200 animate-pulse" />
                      </div>
                    </div>

                    {/* Mirror Distance Callout Badge */}
                    <div className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-rose-500/60 text-[9px] font-mono-nums font-bold text-white shadow-lg whitespace-nowrap">
                      {distance}m {lang === 'gu' ? 'પાછળ' : 'behind'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rearview Mirror Top Overlay Telemetry */}
            <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[11px] z-30 font-mono-nums">
              <span className="text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                CAM: REAR HUD · 108 APPROACHING
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                hasYieldedLocal ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50' : 'bg-rose-950/90 text-rose-300 border border-rose-500/50 animate-pulse'
              }`}>
                {hasYieldedLocal ? (lang === 'gu' ? 'માર્ગ મુક્ત' : 'LANE YIELDED') : (lang === 'gu' ? 'ડાબે ખસો!' : 'PULL TO LEFT!')}
              </span>
            </div>

            {/* Thank you splash when yielded */}
            {hasYieldedLocal && (
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-40 transition-opacity">
                <div className="px-4 py-2 rounded-xl bg-slate-950/95 border border-emerald-500 text-center shadow-2xl">
                  <span className="text-emerald-400 font-bold text-sm block">
                    {lang === 'gu' ? 'ધન્યવાદ! ૧૦૮ ને ઝડપી માર્ગ મળ્યો' : 'Thank You! Corridor Cleared'}
                  </span>
                  <span className="text-[11px] text-slate-300 block mt-0.5">
                    {lang === 'gu' ? 'તમારો સમયસરનો નિર્ણય એક જિંદગી બચાવી શકે છે.' : 'Your prompt action enables 108 to reach hospital in time.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Distance Meter & 3-Lane Yield Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Proximity Distance Radar Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {lang === 'gu' ? 'અંતર અને ઝડપ રડાર' : 'Proximity & Speed Radar'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono-nums">{reactionTimer}s {lang === 'gu' ? 'એલર્ટ સમય' : 'alert active'}</span>
              </span>
            </div>

            {/* Big Radial/Meter Display */}
            <div className="text-center py-6">
              <span className="text-xs text-slate-400 block mb-1">
                {lang === 'gu' ? 'તમારા વાહનથી અંતર' : 'Distance from Your Vehicle'}
              </span>
              <div className="text-6xl font-extrabold font-mono-nums tracking-tight text-white flex items-baseline justify-center gap-2">
                <span className={distance < 150 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}>
                  {distance}
                </span>
                <span className="text-2xl text-slate-400 font-sans">
                  {lang === 'gu' ? 'મીટર' : 'meters'}
                </span>
              </div>

              {/* Progress bar of distance closing in */}
              <div className="w-full bg-slate-800 h-3 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    distance < 150 ? 'bg-rose-500' : distance < 350 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, (500 - distance) / 5))}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono-nums">
                <span>500m</span>
                <span>250m</span>
                <span className="text-rose-400 font-bold">0m (પાસે)</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">
                  {lang === 'gu' ? '૧૦૮ એમ્બ્યુલન્સ સ્પીડ' : 'Ambulance Speed'}
                </span>
                <span className="text-lg font-bold font-mono-nums text-slate-100">
                  {ambulance.currentSpeedKmH} km/h
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">
                  {lang === 'gu' ? 'અંદાજિત આગમન સમય' : 'Estimated Passing'}
                </span>
                <span className="text-lg font-bold font-mono-nums text-amber-400">
                  {Math.round(distance / 18)} {lang === 'gu' ? 'સેકન્ડ' : 'sec'}
                </span>
              </div>
            </div>
          </div>

          {/* Legal Fine Warning as per MV Act 194E */}
          <div className="mt-4 p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-xs text-rose-300">
            <span className="font-bold block">
              {lang === 'gu' ? 'મોટર વાહન અધિનિયમ કલમ ૧૯૪E:' : 'Motor Vehicles Act Sec 194E:'}
            </span>
            <span className="text-rose-200/80">
              {lang === 'gu'
                ? 'એમ્બ્યુલન્સ કે કટોકટી વાહનને રસ્તો ન આપવા પર ₹૧૦,૦૦૦ દંડ અને ૬ મહિના સુધીની સજા થઈ શકે છે.'
                : 'Failure to yield to emergency vehicles carries a ₹10,000 fine and up to 6 months imprisonment.'}
            </span>
          </div>
        </div>

        {/* Right Column: 3-Lane Visual Lane Clearance & Action Button (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {lang === 'gu' ? 'લેન ક્લિયરન્સ ગાઇડ (૩-લેન રસ્તો)' : 'Lane Clearance Guide (3 Lanes)'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'gu'
                    ? 'એમ્બ્યુલન્સ માટે ઝડપી લેન ખાલી કરો અને ડાબી બાજુ સુરક્ષિત રહો'
                    : 'Clear center & fast lane. Pull safely into the left lane.'}
                </p>
              </div>

              {hasYieldedLocal ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'gu' ? 'રસ્તો મુક્ત કર્યો' : 'Lane Cleared'}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1.5 animate-pulse">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {lang === 'gu' ? 'ડાબે ખસો!' : 'Move Left!'}
                </span>
              )}
            </div>

            {/* 3-Lane Diagram */}
            <div className="my-5 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium pb-2 border-b border-slate-800">
                <div className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                  <span>{lang === 'gu' ? 'ડાબી લેન (સલામત)' : 'Left (Safe)'}</span>
                </div>
                <div className="text-slate-400">
                  <span>{lang === 'gu' ? 'મધ્યમ લેન' : 'Center Lane'}</span>
                </div>
                <div className="text-rose-400 font-semibold flex items-center justify-center gap-1">
                  <span>{lang === 'gu' ? 'ઝડપી લેન (૧૦૮)' : 'Fast (108 Only)'}</span>
                </div>
              </div>

              {/* Lane Road Strip */}
              <div className="grid grid-cols-3 gap-2 h-44 relative py-3">
                {/* Lane 1: Left */}
                <div className={`rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-2 transition-all ${
                  hasYieldedLocal
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-emerald-950/10 border-emerald-800 text-emerald-500/70 hover:border-emerald-600'
                }`}>
                  <span className="text-[11px] font-bold text-emerald-400 mb-2">
                    {lang === 'gu' ? 'સલામત ઝોન' : 'SAFE ZONE'}
                  </span>
                  {hasYieldedLocal && (
                    <div className="flex flex-col items-center animate-bounce">
                      <Car className="w-8 h-8 text-emerald-400" />
                      <span className="text-[10px] mt-1 text-emerald-200">
                        {lang === 'gu' ? 'તમારું વાહન' : 'Your Car'}
                      </span>
                    </div>
                  )}
                  {!hasYieldedLocal && (
                    <span className="text-[11px] text-center text-emerald-400/80">
                      {lang === 'gu' ? 'અહીં વાહન લાવો ➔' : 'Move vehicle here ➔'}
                    </span>
                  )}
                </div>

                {/* Lane 2: Center */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col items-center justify-center p-2">
                  {!hasYieldedLocal && (
                    <div className="flex flex-col items-center">
                      <Car className="w-8 h-8 text-amber-400 animate-pulse" />
                      <span className="text-[10px] mt-1 text-amber-300">
                        {lang === 'gu' ? 'તમારું વાહન (વચ્ચે)' : 'Your Car (Center)'}
                      </span>
                      <span className="text-[10px] text-rose-400 font-bold mt-1 flex items-center gap-0.5">
                        <ArrowLeft className="w-3 h-3" /> {lang === 'gu' ? 'ડાબે વળો' : 'Shift Left'}
                      </span>
                    </div>
                  )}
                  {hasYieldedLocal && (
                    <span className="text-xs text-slate-400">
                      {lang === 'gu' ? 'ખાલી માર્ગ' : 'Clear Lane'}
                    </span>
                  )}
                </div>

                {/* Lane 3: Fast / Emergency Corridor */}
                <div className="rounded-lg border-2 border-rose-500/50 bg-rose-950/30 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent pointer-events-none" />
                  <span className="text-[10px] font-bold text-rose-400 mb-1 uppercase tracking-wider">
                    {lang === 'gu' ? 'ગ્રીન કોરિડોર' : 'Green Corridor'}
                  </span>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/50 animate-emergency-pulse">
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                    <span className="text-[10px] font-mono-nums font-bold text-white mt-1">
                      ૧૦૮ AMB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button: I have yielded */}
            {!hasYieldedLocal ? (
              <button
                onClick={handleYield}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>
                  {lang === 'gu' ? 'મેં રસ્તો આપ્યો છે - વાહન ડાબે લીધું' : 'I Have Yielded - Pulled Over to Left'}
                </span>
              </button>
            ) : (
              <div className="w-full py-3 px-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold">
                    {lang === 'gu'
                      ? 'શાબાશ! તમે એમ્બ્યુલન્સને સુરક્ષિત રસ્તો આપ્યો છે.'
                      : 'Great Job! You safely cleared the lane for 108.'}
                  </span>
                </div>
                <button
                  onClick={() => setHasYieldedLocal(false)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  {lang === 'gu' ? 'ફરી સિમ્યુલેટ કરો' : 'Simulate Again'}
                </button>
              </div>
            )}
          </div>

          {/* Citizen Life-Saver Score Card */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">
                  {lang === 'gu' ? 'જીવન રક્ષક સ્કોર' : 'Citizen Life-Saver Points'}
                </span>
                <span className="text-base font-bold font-mono-nums text-white">
                  {driverState.lifeSaverPoints} {lang === 'gu' ? 'પોઇન્ટ્સ' : 'pts'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">
                {lang === 'gu' ? 'સફળતાપૂર્વક આપેલા રસ્તા' : 'Corridors Cleared'}
              </span>
              <span className="text-base font-bold font-mono-nums text-emerald-400">
                {driverState.clearedCount} {lang === 'gu' ? 'વખત' : 'times'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Cockpit Windshield Perspective Photo */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[21/9] max-h-56">
        <img
          src="/src/assets/images/hud_driver_perspective_1790845341184.jpg"
          alt="Driver windshield HUD road view"
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              {lang === 'gu' ? 'વાસ્તવિક ડ્રાઇવિંગ દૃશ્ય (HUD વિઝન)' : 'Real Driving HUD Perspective'}
            </span>
            <p className="text-sm font-medium text-slate-200 max-w-lg mt-0.5">
              {lang === 'gu'
                ? 'જ્યારે ૧૦૮ સાયરન સંભળાય, હંમેશા તમારા રિયર-વ્યૂ મિરરમાં તપાસો અને ઈન્ડિકેટર આપી ડાબી બાજુ લો.'
                : 'Always check your rear-view mirror when hearing the emergency siren, signal left and yield.'}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono-nums px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300">
            <span>{lang === 'gu' ? 'રિસ્પોન્સ સમય:' : 'Response:'}</span>
            <span className="text-emerald-400 font-bold">3.2s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
