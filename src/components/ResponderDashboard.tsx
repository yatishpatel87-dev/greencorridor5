import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Clock, 
  Heart,
  Share2
} from 'lucide-react';
import { AmbulanceData, EmergencyRoute, SirenMode } from '../types/emergency';
import { soundEngine } from '../services/soundEngine';

interface ResponderDashboardProps {
  ambulance: AmbulanceData;
  activeRoute: EmergencyRoute;
  onRouteChange: (route: EmergencyRoute) => void;
  allRoutes: EmergencyRoute[];
  onToggleSiren: (mode: SirenMode | 'off') => void;
  lang: 'gu' | 'en';
}

export const ResponderDashboard: React.FC<ResponderDashboardProps> = ({
  ambulance,
  activeRoute,
  onRouteChange,
  allRoutes,
  onToggleSiren,
  lang,
}) => {
  const [signals, setSignals] = useState(activeRoute.signals);
  const [patientUrgency, setPatientUrgency] = useState(ambulance.urgency);
  const [medicalCase, setMedicalCase] = useState<'cardiac' | 'organ' | 'trauma' | 'neonatal'>('cardiac');
  const [heartRate, setHeartRate] = useState(104);
  const [spo2, setSpo2] = useState(97);
  const [goldenHourSec, setGoldenHourSec] = useState(42 * 60 + 15); // 42 min 15 sec
  const [isHeartSoundActive, setIsHeartSoundActive] = useState(false);
  const [activeSirenMode, setActiveSirenMode] = useState<SirenMode | 'off'>(
    soundEngine.isPlaying() ? soundEngine.getSirenMode() : 'off'
  );
  const [broadcastSent, setBroadcastSent] = useState(false);

  useEffect(() => {
    const unsub = soundEngine.subscribeSiren((active, mode) => {
      setActiveSirenMode(active ? mode : 'off');
    });
    return unsub;
  }, []);

  // Golden hour countdown & dynamic heart rate jitter
  useEffect(() => {
    const interval = window.setInterval(() => {
      setGoldenHourSec(prev => Math.max(0, prev - 1));
      setHeartRate(prev => {
        const jitter = Math.floor(Math.random() * 5) - 2;
        return Math.min(130, Math.max(85, prev + jitter));
      });
      if (isHeartSoundActive) {
        soundEngine.playHeartbeatBeep();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isHeartSoundActive]);

  // Toggle signal override
  const handleToggleSignalOverride = (sigId: string) => {
    setSignals(prev =>
      prev.map(sig => {
        if (sig.id === sigId) {
          const nextState = !sig.isPreempted;
          if (nextState) {
            soundEngine.playSignalPreemptionChime();
          }
          return {
            ...sig,
            isPreempted: nextState,
            status: nextState ? 'preempted' : 'red',
          };
        }
        return sig;
      })
    );
  };

  const handleSirenSelect = (mode: SirenMode | 'off') => {
    setActiveSirenMode(mode);
    onToggleSiren(mode);
    if (mode === 'off') {
      soundEngine.stopSiren();
    } else {
      soundEngine.startSiren(mode);
    }
  };

  const handleBroadcastAlert = () => {
    setBroadcastSent(true);
    soundEngine.playRadioChirp();
    soundEngine.speakGujarati(
      `કટોકટી ચેતવણી! ૧૦૮ એમ્બ્યુલન્સ યુનિટ ${activeRoute.startPointGu} તરફથી આવી રહ્યું છે. ગ્રીન કોરિડોર સક્રિય છે. તમામ વાહનચાલકો ડાબી તરફ ખસી જાવ.`,
      `Emergency priority alert! 108 ambulance corridor active. All drivers on route please clear right lanes immediately.`
    );
    setTimeout(() => setBroadcastSent(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Emergency Responder Status & Siren Beacon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Pulsing Emergency Vehicle Livery */}
            <div className="relative w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/50 flex items-center justify-center shrink-0">
              <div className="absolute -top-1 -right-1 flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-siren-red" />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-siren-blue" />
              </div>
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500/40" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono-nums font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                  {ambulance.regNumber}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-rose-400 font-semibold">
                  {lang === 'gu' ? ambulance.unitNameGu : ambulance.unitNameEn}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {lang === 'gu' ? 'ગ્રીન કોરિડોર સક્રિય' : 'Green Corridor Active'}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                {lang === 'gu' ? '૧૦૮ ઇમરજન્સી રિસ્પોન્ડર & પાઇલટ કન્સોલ' : '108 Emergency Responder Pilot Console'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'gu'
                  ? `દર્દી કેસ: ${ambulance.patientTypeGu} (ગોલ્ડન અવર રિસ્પોન્સ)`
                  : `Patient Condition: ${ambulance.patientTypeEn} (Golden Hour Critical Response)`}
              </p>
            </div>
          </div>

          {/* Siren Mode Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">
              {lang === 'gu' ? 'સાયરન મોડ:' : 'Siren:'}
            </span>

            <button
              onClick={() => handleSirenSelect('wail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSirenMode === 'wail'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 ring-2 ring-rose-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Wail (વેઇલ)
            </button>

            <button
              onClick={() => handleSirenSelect('yelp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSirenMode === 'yelp'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 ring-2 ring-rose-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Yelp (યેલ્પ)
            </button>

            <button
              onClick={() => handleSirenSelect('hi_lo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSirenMode === 'hi_lo'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 ring-2 ring-rose-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Hi-Lo (હાઇ-લો)
            </button>

            <button
              onClick={() => handleSirenSelect('piercer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSirenMode === 'piercer'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 ring-2 ring-rose-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Piercer (પિયર્સ)
            </button>

            <button
              onClick={() => handleSirenSelect('off')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSirenMode === 'off'
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <VolumeX className="w-3.5 h-3.5 inline mr-1" />
              {lang === 'gu' ? 'બંધ' : 'Off'}
            </button>

            {/* Electronic Air Horn Blast Button */}
            <button
              onClick={() => soundEngine.playAirHornBlast()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 transition-all flex items-center gap-1 shadow-md shadow-amber-950 cursor-pointer ml-1"
              title="Electric air horn burst for clearing junctions"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>{lang === 'gu' ? 'હોર્ન બ્લાસ્ટ' : 'AIR HORN'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ICU Patient Vitals & Golden Hour Survival Monitor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {lang === 'gu'
                  ? 'દર્દી લાઈવ ICU વાઇટલ્સ અને ગોલ્ડન અવર મોનિટર'
                  : 'Patient Live ICU Vitals & Golden Hour Telemetry'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'gu'
                ? 'એમ્બ્યુલન્સ લાઈફ-સપોર્ટ સિસ્ટમમાંથી હોસ્પિટલ ટ્રોમા સેન્ટરને સીધું ડેટા ટ્રાન્સમિશન'
                : 'Direct hospital telemetry stream from 108 Advanced Life Support (ALS) Unit'}
            </p>
          </div>

          {/* Golden Hour Countdown Display */}
          <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-rose-900/60">
            <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                {lang === 'gu' ? 'ગોલ્ડન અવર બાકી સમય' : 'Golden Hour Window'}
              </span>
              <span className="text-sm font-mono-nums font-extrabold text-rose-400">
                {Math.floor(goldenHourSec / 60).toString().padStart(2, '0')}:{(goldenHourSec % 60).toString().padStart(2, '0')} min
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Case Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">
            {lang === 'gu' ? 'કેસ પ્રકાર:' : 'Case Type:'}
          </span>

          <button
            onClick={() => setMedicalCase('cardiac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              medicalCase === 'cardiac'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {lang === 'gu' ? 'હાર્ટ એટેક (Cardiac Golden Hour)' : 'Acute Cardiac'}
          </button>

          <button
            onClick={() => setMedicalCase('organ')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              medicalCase === 'organ'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {lang === 'gu' ? 'જીવંત અંગ પ્રત્યારોપણ (Organ Transplant)' : 'Organ Transplant'}
          </button>

          <button
            onClick={() => setMedicalCase('trauma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              medicalCase === 'trauma'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {lang === 'gu' ? 'પોલિ-ટ્રોમા અકસ્માત (Severe Trauma)' : 'Severe Trauma'}
          </button>

          <button
            onClick={() => setMedicalCase('neonatal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              medicalCase === 'neonatal'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-950'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {lang === 'gu' ? 'નવજાત શિશુ (NICU Mobile Incubator)' : 'Neonatal Care'}
          </button>
        </div>

        {/* 4 Critical Vitals Panels + Live ECG Waveform */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Heart Rate BPM with ECG Wave */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                {lang === 'gu' ? 'હાર્ટ રેટ (BPM)' : 'Heart Rate'}
              </span>
              <button
                onClick={() => setIsHeartSoundActive(!isHeartSoundActive)}
                className={`p-1 rounded text-[10px] transition-colors cursor-pointer ${
                  isHeartSoundActive ? 'text-emerald-400 bg-emerald-950' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle ECG audio beep"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono-nums text-emerald-400">
                {heartRate}
              </span>
              <span className="text-xs text-slate-400 font-sans">bpm</span>
            </div>

            {/* Mini Animated ECG Line */}
            <div className="w-full h-5 relative flex items-center overflow-hidden opacity-80">
              <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path
                  d="M0 10 L20 10 L25 2 L30 18 L35 6 L40 12 L45 10 L65 10 L70 2 L75 18 L80 6 L85 12 L90 10 L100 10"
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>

          {/* SpO2 Oxygen */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              {lang === 'gu' ? 'ઓક્સિજન સેચ્યુરેશન (SpO2)' : 'Oxygen (SpO2)'}
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono-nums text-cyan-400">
                {spo2}%
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {lang === 'gu' ? 'O2 સપોર્ટ' : 'O2 High Flow'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {lang === 'gu' ? 'વેન્ટિલેટર: સ્થિર' : 'Ventilator: Stable'}
            </span>
          </div>

          {/* Blood Pressure */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              {lang === 'gu' ? 'બ્લડ પ્રેશર (BP)' : 'Blood Pressure'}
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold font-mono-nums text-amber-400">
                118/76
              </span>
              <span className="text-[10px] text-slate-400 font-sans">mmHg</span>
            </div>
            <span className="text-[10px] text-slate-400">
              MAP: 90 mmHg (Normal)
            </span>
          </div>

          {/* Hospital Handshake Status */}
          <div className="p-3 bg-slate-950 rounded-xl border border-rose-950/80 flex flex-col justify-between">
            <span className="text-[10px] text-rose-400 font-semibold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              {lang === 'gu' ? 'હોસ્પિટલ સ્ટેન્ડબાય' : 'Hospital Standby'}
            </span>
            <div className="text-xs font-bold text-white mt-1 line-clamp-1">
              {activeRoute.hospitalGu}
            </div>
            <span className="text-[10px] text-emerald-400 mt-1">
              {lang === 'gu' ? 'ટ્રોમા ICU બે નં. ૩ તૈયાર' : 'Trauma ICU Bay 3 Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Corridor Route Prioritization & ETA Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Route Selector & Time-Saved Metrics (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {lang === 'gu' ? 'રૂટ પ્રાયોરિટી પ્લાનર' : 'Route Prioritization'}
              </span>
              <span className="text-xs text-emerald-400 font-mono-nums font-bold">
                {activeRoute.cityGu} ({activeRoute.cityEn})
              </span>
            </div>

            {/* Route Switcher Dropdown */}
            <div className="mt-4">
              <label className="text-xs text-slate-400 block mb-1.5">
                {lang === 'gu' ? 'સક્રિય ગ્રીન કોરિડોર રૂટ પસંદ કરો:' : 'Select Active Corridor Route:'}
              </label>
              <select
                value={activeRoute.id}
                onChange={(e) => {
                  const sel = allRoutes.find(r => r.id === e.target.value);
                  if (sel) {
                    onRouteChange(sel);
                    setSignals(sel.signals);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {allRoutes.map(r => (
                  <option key={r.id} value={r.id}>
                    {lang === 'gu' ? `${r.cityGu}: ${r.nameGu}` : `${r.cityEn}: ${r.nameEn}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Route Path Overview */}
            <div className="my-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    {lang === 'gu' ? 'શરૂઆતનું સ્થળ (ઇમરજન્સી પિકઅપ)' : 'Pickup Origin'}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {lang === 'gu' ? activeRoute.startPointGu : activeRoute.startPointEn}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    {lang === 'gu' ? 'ગંતવ્ય હોસ્પિટલ (ઈમરજન્સી ટ્રોમા સેન્ટર)' : 'Destination Hospital'}
                  </span>
                  <span className="text-xs font-semibold text-rose-300">
                    {lang === 'gu' ? activeRoute.hospitalGu : activeRoute.hospitalEn}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Saved Comparison (The Mechanism to Outcome Chain) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30">
              <span className="text-xs font-semibold text-emerald-400 block mb-2">
                {lang === 'gu' ? 'ગ્રીન કોરિડોર દ્વારા બચેલો સમય:' : 'Time Saved via Green Corridor:'}
              </span>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">
                    {lang === 'gu' ? 'સામાન્ય ટ્રાફિક' : 'Regular ETA'}
                  </span>
                  <span className="text-base font-bold font-mono-nums text-slate-400 line-through">
                    {activeRoute.standardDurationMin} m
                  </span>
                </div>

                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">
                    {lang === 'gu' ? 'ગ્રીન કોરિડોર' : 'Corridor ETA'}
                  </span>
                  <span className="text-base font-bold font-mono-nums text-emerald-400">
                    {activeRoute.priorityDurationMin} m
                  </span>
                </div>

                <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/40">
                  <span className="text-[10px] text-emerald-300 block">
                    {lang === 'gu' ? 'સમય બચાવ્યો' : 'Time Saved'}
                  </span>
                  <span className="text-base font-extrabold font-mono-nums text-emerald-300">
                    +{activeRoute.savedMinutes} min
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                {lang === 'gu'
                  ? 'સ્માર્ટ ટ્રાફિક પ્રિ-એમ્પશન અને નાગરિક લેન ક્લિયરિંગથી ગોલ્ડન અવરમાં ૨૪ મિનિટ બચી રહી છે.'
                  : 'Automated signal preemption and civilian yielding save 24 vital minutes.'}
              </p>
            </div>
          </div>

          {/* Broadcast alert to nearby civilian vehicles */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={handleBroadcastAlert}
              disabled={broadcastSent}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-950 disabled:opacity-60 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>
                {broadcastSent
                  ? (lang === 'gu' ? 'ચેતવણી તમામ વાહનોને મોકલાઈ ગઈ!' : 'Alert Broadcasted to 1km radius!')
                  : (lang === 'gu' ? 'વાહનોને તાત્કાલિક સાયરન બ્રોડકાસ્ટ કરો' : 'Broadcast Priority Siren to Nearby Vehicles')}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Smart Traffic Signal Preemption Intersections (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {lang === 'gu' ? 'સ્માર્ટ ટ્રાફિક સિગ્નલ પ્રિ-એમ્પશન મેનેજર' : 'Smart Traffic Signal Preemption Manager'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'gu'
                    ? 'એમ્બ્યુલન્સ નજીક આવતા જ સિગ્નલ ઓટોમેટિક લીલું થઈ જંક્શન ક્લીયર કરે છે'
                    : 'Signals automatically switch to green within 400m to clear intersections'}
                </p>
              </div>

              <span className="px-2.5 py-1 text-xs font-mono-nums font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
                {signals.filter(s => s.isPreempted).length}/{signals.length} {lang === 'gu' ? 'ગ્રીન લૉક' : 'Locked'}
              </span>
            </div>

            {/* List of Intersections along the path */}
            <div className="space-y-2.5 my-4">
              {signals.map((sig, idx) => (
                <div
                  key={sig.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    sig.isPreempted
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono-nums flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {lang === 'gu' ? sig.nameGu : sig.nameEn}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({lang === 'gu' ? sig.crossStreetGu : sig.crossStreetEn})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono-nums">
                          {lang === 'gu' ? 'અંતર:' : 'Distance:'} {sig.distanceMeters}m
                        </span>
                        <span>·</span>
                        <span className="font-mono-nums">
                          {lang === 'gu' ? 'આગમન:' : 'ETA:'} {sig.timeToArrivalSec}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${
                        sig.isPreempted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${sig.isPreempted ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                      {sig.isPreempted
                        ? (lang === 'gu' ? 'ગ્રીન પ્રિ-એમ્પટેડ' : 'GREEN PREEMPTED')
                        : (lang === 'gu' ? 'સામાન્ય લાલ' : 'RED STOP')}
                    </span>

                    <button
                      onClick={() => handleToggleSignalOverride(sig.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Toggle manual override"
                    >
                      {sig.isPreempted ? (lang === 'gu' ? 'રિલીઝ' : 'Release') : (lang === 'gu' ? 'ફોર્સ ગ્રીન' : 'Force Green')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Corridor Clearance Rate & Choke Points */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">
                  {lang === 'gu' ? 'નાગરિક વાહન સહયોગ દર' : 'Citizen Yield Compliance'}
                </span>
                <span className="text-sm font-bold font-mono-nums text-white">
                  {ambulance.vehiclesMovedAside} / {ambulance.totalVehiclesAlerted} {lang === 'gu' ? 'વાહનો ખસ્યા' : 'vehicles cleared'} (91.4%)
                </span>
              </div>
            </div>

            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {lang === 'gu' ? 'કોરિડોર ક્લીયર' : 'Corridor Clear'}
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Responder Ambulance Unit Photo Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[21/9] max-h-56">
        <img
          src="/src/assets/images/hero_ambulance_corridor_1790845321776.jpg"
          alt="108 Emergency ambulance on dedicated green corridor"
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">
              {lang === 'gu' ? 'ગુજરાત ૧૦૮ ઇમરજન્સી મેનેજમેન્ટ એન્ડ રિસર્ચ ઇન્સ્ટિટ્યૂટ (GVK EMRI)' : 'Gujarat 108 Emergency Response System'}
            </span>
            <p className="text-sm font-medium text-slate-200 max-w-xl mt-0.5">
              {lang === 'gu'
                ? 'અમદાવાદ અને સમગ્ર ગુજરાતમાં સેટેલાઇટ જીપીએસ અને ટ્રાફિક કમાન્ડ સેન્ટર સાથે જોડાયેલ હાઇ-ટેક ગ્રીન કોરિડોર.'
                : 'Connected with Gujarat Traffic Command Center for zero-delay emergency transit.'}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono-nums px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300">
            <span>{lang === 'gu' ? 'સક્રિય યુનિટ:' : 'Unit:'}</span>
            <span className="text-rose-400 font-bold">GJ-01-EG-1088</span>
          </div>
        </div>
      </div>
    </div>
  );
};
