/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Heart, 
  Activity, 
  Map, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  BookOpen, 
  Globe, 
  ShieldAlert,
  Radio,
  PhoneCall
} from 'lucide-react';
import { AppMode, AmbulanceData, DriverState, EmergencyRoute, SirenMode } from './types/emergency';
import { GUJARAT_EMERGENCY_ROUTES } from './data/emergencyRoutes';
import { soundEngine } from './services/soundEngine';
import { DriverHudView } from './components/DriverHudView';
import { ResponderDashboard } from './components/ResponderDashboard';
import { InteractiveCorridorCanvas } from './components/InteractiveCorridorCanvas';
import { TrafficCommandGrid } from './components/TrafficCommandGrid';
import { ReportBlockageModal } from './components/ReportBlockageModal';
import { AwarenessGuideModal } from './components/AwarenessGuideModal';
import { ContinuousSirenBar } from './components/ContinuousSirenBar';
import { LiveCorridorRouteMap } from './components/LiveCorridorRouteMap';
import { Navigation, Eye } from 'lucide-react';




export default function App() {
  const [activeTab, setActiveTab] = useState<AppMode | 'simulation'>('driver');
  const [lang, setLang] = useState<'gu' | 'en'>('gu');
  const [activeRoute, setActiveRoute] = useState<EmergencyRoute>(GUJARAT_EMERGENCY_ROUTES[0]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [simulationView, setSimulationView] = useState<'both' | 'map' | 'canvas'>('both');


  // Synchronized Ambulance State
  const [ambulance, setAmbulance] = useState<AmbulanceData>({
    id: 'amb_108_ahm_1',
    regNumber: 'GJ-01-EG-1088',
    unitNameGu: 'એસ.જી. હાઇવે ૧૦૮ એમ્બ્યુલન્સ યુનિટ',
    unitNameEn: 'SG Highway 108 Emergency Unit',
    currentSpeedKmH: 82,
    distanceToDriverMeters: 420,
    status: 'transporting_to_hospital',
    patientTypeGu: 'ગંભીર હૃદયરોગ કટોકટી (એક્યુટ કાર્ડિયાક એરેસ્ટ)',
    patientTypeEn: 'Acute Cardiac Emergency (ICU Golden Hour)',
    urgency: 'critical',
    beaconActive: true,
    sirenActive: true,
    sirenMode: 'wail',
    audioVoiceEnabled: true,
    destinationHospitalGu: 'યુ.એન. મહેતા ઇન્સ્ટિટ્યૂટ ઓફ કાર્ડિયોલોજી, અસારવા',
    destinationHospitalEn: 'U.N. Mehta Heart Institute, Asarwa',
    totalVehiclesAlerted: 35,
    vehiclesMovedAside: 32,
  });

  // Driver Profile State
  const [driverState, setDriverState] = useState<DriverState>({
    currentLane: 'center',
    hasYielded: false,
    yieldTimeSec: null,
    speedKmH: 45,
    lifeSaverPoints: 180,
    clearedCount: 3,
    warningLevel: 'urgent',
  });

  // Toggle siren state
  const handleToggleSiren = (mode: SirenMode | 'off') => {
    setAmbulance(prev => ({
      ...prev,
      sirenActive: mode !== 'off',
      sirenMode: mode === 'off' ? prev.sirenMode : mode,
    }));
  };


  // When driver yields successfully
  const handleDriverYieldSuccess = () => {
    setDriverState(prev => ({
      ...prev,
      hasYielded: true,
      yieldTimeSec: 3.4,
      currentLane: 'left',
      lifeSaverPoints: prev.lifeSaverPoints + 50,
      clearedCount: prev.clearedCount + 1,
    }));

    setAmbulance(prev => ({
      ...prev,
      vehiclesMovedAside: Math.min(prev.totalVehiclesAlerted, prev.vehiclesMovedAside + 1),
    }));
  };

  const handleCorridorVehicleYielded = React.useCallback(() => {
    setAmbulance(prev => {
      if (prev.vehiclesMovedAside >= prev.totalVehiclesAlerted) return prev;
      return {
        ...prev,
        vehiclesMovedAside: prev.vehiclesMovedAside + 1,
      };
    });
  }, []);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-950 shrink-0">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              {lang === 'gu' ? 'આપત માર્ગ - ૧૦૮ કોરિડોર' : 'AapatMarg 108 Priority'}
            </a>
          </div>

          {/* Zone 2: Clean 4 Navigation links */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('driver')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'driver'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{lang === 'gu' ? 'વાહનચાલક મોડ' : 'Driver HUD'}</span>
            </button>

            <button
              onClick={() => setActiveTab('responder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'responder'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{lang === 'gu' ? '૧૦૮ એમ્બ્યુલન્સ મોડ' : 'Responder'}</span>
            </button>

            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'simulation'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{lang === 'gu' ? 'લાઈવ કોરિડોર રડાર' : 'Live Simulation'}</span>
            </button>

            <button
              onClick={() => setActiveTab('command')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'command'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{lang === 'gu' ? 'ટ્રાફિક કંટ્રોલ રૂમ' : 'Command Center'}</span>
            </button>
          </nav>



          {/* Zone 3: Primary Actions (Report Obstacle, Awareness, Language) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'gu' ? 'en' : 'gu')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'gu' ? 'English' : 'ગુજરાતી'}</span>
            </button>

            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'gu' ? 'નિયમો' : 'Rules'}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 transition-colors whitespace-nowrap cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lang === 'gu' ? 'અવરોધ રિપોર્ટ' : 'Report Block'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-900 bg-slate-950 text-xs">
          <button
            onClick={() => setActiveTab('driver')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'driver' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="text-[10px]">{lang === 'gu' ? 'વાહનચાલક' : 'Driver'}</span>
          </button>

          <button
            onClick={() => setActiveTab('responder')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'responder' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span className="text-[10px]">{lang === 'gu' ? '૧૦૮ પાયલટ' : 'Responder'}</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'simulation' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="text-[10px]">{lang === 'gu' ? 'સિમ્યુલેશન' : 'Radar'}</span>
          </button>

          <button
            onClick={() => setActiveTab('command')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
              activeTab === 'command' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Map className="w-4 h-4" />
            <span className="text-[10px]">{lang === 'gu' ? 'કમાન્ડ' : 'Command'}</span>
          </button>
        </div>
      </header>



      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* State Banner: Active Emergency Corridor Notice */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pb-2 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-200">
              {lang === 'gu' ? 'ગુજરાત ૧૦૮ ગ્રીન કોરિડોર સિસ્ટમ સક્રિય' : 'Gujarat 108 Smart Priority Corridor Active'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeRoute.cityGu} ({activeRoute.cityEn})</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-nums text-emerald-400">
              {lang === 'gu' ? '૨૪ મિનિટ બચત' : '24 min saved'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:108"
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{lang === 'gu' ? '૧૦૮ ઇમરજન્સી હેલ્પલાઇન' : '108 Toll Free'}</span>
            </a>
          </div>
        </div>

        {/* Global Continuous Siren & Strobe Beacon Controller */}
        <ContinuousSirenBar lang={lang} />

        {/* Tab 1: Driver Cockpit HUD View */}

        {activeTab === 'driver' && (
          <DriverHudView
            ambulance={ambulance}
            driverState={driverState}
            onYieldSuccess={handleDriverYieldSuccess}
            lang={lang}
          />
        )}

        {/* Tab 2: 108 Emergency Responder Console */}
        {activeTab === 'responder' && (
          <ResponderDashboard
            ambulance={ambulance}
            activeRoute={activeRoute}
            onRouteChange={setActiveRoute}
            allRoutes={GUJARAT_EMERGENCY_ROUTES}
            onToggleSiren={handleToggleSiren}
            lang={lang}
          />
        )}

        {/* Tab 3: Interactive Corridor Canvas Simulation & Live Map */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            {/* View Mode Selector Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>
                    {lang === 'gu'
                      ? '૧૦૮ ગ્રીન કોરિડોર લાઈવ મોનિટરિંગ & નેવિગેશન'
                      : '108 Live Corridor Monitoring & Route Navigation'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'gu'
                    ? 'વાહન ક્યાં જવાનું છે તેનો જીપીએસ મેપ અને વાહનો ખસવાનું ૨D સિમ્યુલેશન'
                    : 'GPS route tracking showing destination hospital and 2D road lane yielding simulation'}
                </p>
              </div>

              {/* View Switcher Buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
                <button
                  onClick={() => setSimulationView('both')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    simulationView === 'both'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'gu' ? 'બંને જુઓ (Dual View)' : 'Dual View'}
                </button>

                <button
                  onClick={() => setSimulationView('map')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    simulationView === 'map'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'gu' ? 'જીપીએસ મેપ (ક્યાં જવાનું છે)' : 'GPS Map'}
                </button>

                <button
                  onClick={() => setSimulationView('canvas')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    simulationView === 'canvas'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'gu' ? '૨D રોડ સિમ્યુલેશન' : '2D Road'}
                </button>
              </div>
            </div>

            {/* Render Live GPS Map */}
            {(simulationView === 'both' || simulationView === 'map') && (
              <LiveCorridorRouteMap
                currentRoute={activeRoute}
                onRouteChange={setActiveRoute}
                lang={lang}
              />
            )}

            {/* Render 2D Road Canvas */}
            {(simulationView === 'both' || simulationView === 'canvas') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-300">
                    {lang === 'gu' ? '૨D વાહન લેન ક્લિયરન્સ સિમ્યુલેશન (રોડ વ્યુ)' : '2D Lane Yielding Simulation (Road View)'}
                  </h4>
                </div>
                <InteractiveCorridorCanvas
                  ambulanceSpeedKmH={ambulance.currentSpeedKmH}
                  isSirenActive={ambulance.sirenActive}
                  onVehicleYielded={handleCorridorVehicleYielded}
                  lang={lang}
                />
              </div>
            )}
          </div>
        )}


        {/* Tab 4: Traffic Command Center */}
        {activeTab === 'command' && (
          <TrafficCommandGrid
            allRoutes={GUJARAT_EMERGENCY_ROUTES}
            lang={lang}
          />
        )}
      </main>



      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-rose-600/30 text-rose-400 flex items-center justify-center font-bold text-[10px]">
              ૧૦૮
            </div>
            <span>
              {lang === 'gu'
                ? 'આપત માર્ગ - ગુજરાત ઇમરજન્સી એમ્બ્યુલન્સ પ્રાયોરિટી & સેફ્ટી સિસ્ટમ'
                : 'AapatMarg - Gujarat Emergency Ambulance Priority & Safety System'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              {lang === 'gu' ? 'ટ્રાફિક નિયમો (કલમ ૧૯૪E)' : 'MV Act Sec 194E Rules'}
            </button>
            <span>·</span>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              {lang === 'gu' ? 'અવરોધ નોંધાવો' : 'Report Obstacle'}
            </button>
            <span>·</span>
            <a href="tel:108" className="hover:text-rose-400 transition-colors font-mono-nums">
              108 Helpline
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportBlockageModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        lang={lang}
      />

      <AwarenessGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
