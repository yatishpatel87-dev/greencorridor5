import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  AlertCircle, 
  CheckCircle2,
  Activity,
  Heart,
  Car
} from 'lucide-react';
import { EmergencyRoute } from '../types/emergency';

import { soundEngine } from '../services/soundEngine';

interface TrafficCommandGridProps {
  allRoutes: EmergencyRoute[];
  lang: 'gu' | 'en';
}

interface CorridorFleetItem {
  id: string;
  reg: string;
  city: string;
  routeGu: string;
  routeEn: string;
  hospitalGu: string;
  hospitalEn: string;
  speedKmH: number;
  signalsPreempted: string;
  urgency: 'critical' | 'severe' | 'standard';
  etaMin: number;
  complianceRate: number;
}

interface EscortUnit {
  id: string;
  callSign: string;
  typeGu: string;
  typeEn: string;
  locationGu: string;
  locationEn: string;
  status: 'patrolling' | 'escorting' | 'clearing';
  distanceToAmbKm: number;
}

export const TrafficCommandGrid: React.FC<TrafficCommandGridProps> = ({
  allRoutes,
  lang,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isMasterPreemptActive, setIsMasterPreemptActive] = useState(false);
  const [escortUnits, setEscortUnits] = useState<EscortUnit[]>([
    {
      id: 'esc_1',
      callSign: 'POLICE-INTERCEPTOR-01',
      typeGu: 'હાઇ-સ્પીડ પાયલટ એસ્કોર્ટ કાર',
      typeEn: 'High-Speed Pilot Escort Car',
      locationGu: 'એસ.જી. હાઇવે (ઈસ્કોન - પકવાન)',
      locationEn: 'SG Highway (Iscon - Pakwan)',
      status: 'escorting',
      distanceToAmbKm: 0.4,
    },
    {
      id: 'esc_2',
      callSign: 'TRAFFIC-CRANE-04',
      typeGu: 'હાઇડ્રોલિક ઓબ્સ્ટેકલ ક્રેન વાન',
      typeEn: 'Rapid Obstacle Clearance Crane',
      locationGu: 'હેલ્મેટ સર્કલ જંક્શન',
      locationEn: 'Helmet Circle Junction',
      status: 'patrolling',
      distanceToAmbKm: 2.1,
    },
    {
      id: 'esc_3',
      callSign: 'OUTRIDER-MOTO-08',
      typeGu: 'ટ્રાફિક મોટરસાઇકલ આઉટરાઇડર',
      typeEn: 'Motorcycle Junction Outrider',
      locationGu: 'સુભાષબ્રિજ એપ્રોચ',
      locationEn: 'Subhash Bridge Approach',
      status: 'clearing',
      distanceToAmbKm: 4.8,
    },
  ]);

  const handleMasterPreemptToggle = () => {
    const nextState = !isMasterPreemptActive;
    setIsMasterPreemptActive(nextState);
    if (nextState) {
      soundEngine.playSignalPreemptionChime();
      soundEngine.playRadioChirp();
      soundEngine.speakGujarati(
        'કમાન્ડ કંટ્રોલ આદેશ: સમગ્ર કોરિડોરના તમામ સિગ્નલ ગ્રીન લૉક કરવામાં આવ્યા છે.',
        'Command Control Order: All corridor traffic signals locked to green.'
      );
    }
  };

  const handleDispatchSupport = (id: string) => {
    soundEngine.playRadioChirp();
    setEscortUnits(prev =>
      prev.map(u => (u.id === id ? { ...u, status: 'escorting' as const } : u))
    );
  };

  const fleetData: CorridorFleetItem[] = [
    {
      id: 'amb_1',
      reg: 'GJ-01-EG-1088',
      city: 'Ahmedabad',
      routeGu: 'એસ.જી. હાઇવે ➔ યુ.એન. મહેતા & સિવિલ મેડિસિટી',
      routeEn: 'SG Highway ➔ U.N. Mehta Heart Institute',
      hospitalGu: 'યુ.એન. મહેતા હોસ્પિટલ, અસારવા',
      hospitalEn: 'U.N. Mehta Hospital, Asarwa',
      speedKmH: 82,
      signalsPreempted: '૪/૫ ગ્રીન લૉક',
      urgency: 'critical',
      etaMin: 14,
      complianceRate: 92.5,
    },
    {
      id: 'amb_2',
      reg: 'GJ-01-EG-1042',
      city: 'Ahmedabad',
      routeGu: 'પ્રહલાદનગર ➔ એસ.વી.પી. હોસ્પિટલ (એલિસબ્રિજ)',
      routeEn: 'Prahladnagar ➔ SVP Hospital (Ellisbridge)',
      hospitalGu: 'સરદાર પટેલ હોસ્પિટલ (SVP)',
      hospitalEn: 'Sardar Vallabhbhai Patel Hospital',
      speedKmH: 74,
      signalsPreempted: '૩/૪ ગ્રીન લૉક',
      urgency: 'severe',
      etaMin: 11,
      complianceRate: 88.0,
    },
    {
      id: 'amb_3',
      reg: 'GJ-05-EM-1081',
      city: 'Surat',
      routeGu: 'અડાજણ ➔ નવી સિવિલ હોસ્પિટલ (મજુરા ગેટ)',
      routeEn: 'Adajan ➔ New Civil Hospital Majura Gate',
      hospitalGu: 'નવી સિવિલ હોસ્પિટલ (NCH), સુરત',
      hospitalEn: 'New Civil Hospital, Surat',
      speedKmH: 78,
      signalsPreempted: '૨/૨ ગ્રીન લૉક',
      urgency: 'critical',
      etaMin: 9,
      complianceRate: 94.2,
    },
    {
      id: 'amb_4',
      reg: 'GJ-06-ER-1086',
      city: 'Vadodara',
      routeGu: 'અલકાપુરી ➔ એસ.એસ.જી. હોસ્પિટલ (રાવપુરા)',
      routeEn: 'Alkapuri ➔ SSG General Hospital',
      hospitalGu: 'એસ.એસ.જી. હોસ્પિટલ, વડોદરા',
      hospitalEn: 'Sir Sayajirao General Hospital',
      speedKmH: 68,
      signalsPreempted: '૨/૨ ગ્રીન લૉક',
      urgency: 'standard',
      etaMin: 8,
      complianceRate: 91.0,
    },
  ];

  const filteredFleet = selectedCity === 'all' 
    ? fleetData 
    : fleetData.filter(item => item.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Top Gujarat Command Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>{lang === 'gu' ? 'સક્રિય ૧૦૮ એમ્બ્યુલન્સ' : 'Active 108 Ambulances'}</span>
          </div>
          <div className="text-2xl font-bold font-mono-nums text-white">૧૪ વાહનો</div>
          <span className="text-[11px] text-emerald-400 block mt-0.5">
            {lang === 'gu' ? '૧૦૦% સેટેલાઇટ ટ્રેકિંગ' : '100% GPS connected'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'gu' ? 'ગ્રીન કોરિડોર લૉક' : 'Active Green Corridors'}</span>
          </div>
          <div className="text-2xl font-bold font-mono-nums text-emerald-400">૬ કોરિડોર</div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {lang === 'gu' ? 'અમદાવાદ, સુરત, વડોદરા' : 'Ahmedabad, Surat, Vadodara'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{lang === 'gu' ? 'સરેરાશ સમય બચત' : 'Avg. Time Saved'}</span>
          </div>
          <div className="text-2xl font-bold font-mono-nums text-amber-400">૧૯.૪ મિનિટ</div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {lang === 'gu' ? 'પ્રતિ ગોલ્ડન અવર કેસ' : 'Per Golden Hour Case'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'gu' ? 'નાગરિક અનુપાલન દર' : 'Citizen Compliance Rate'}</span>
          </div>
          <div className="text-2xl font-bold font-mono-nums text-cyan-400">૯૨.૩%</div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {lang === 'gu' ? 'ડાબી લેન ક્લિયરન્સ' : 'Smooth lane yielding'}
          </span>
        </div>
      </div>

      {/* Master Emergency Green Corridor Preemption Action Bar */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isMasterPreemptActive
          ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-500/40'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isMasterPreemptActive ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isMasterPreemptActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {lang === 'gu'
                    ? 'રાજ્યવ્યાપી માસ્ટર સિગ્નલ પ્રિ-એમ્પશન કંટ્રોલ (ગુજરાત ટ્રાફિક પોલીસ)'
                    : 'Statewide Master Signal Preemption Control (Gujarat Traffic Police)'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMasterPreemptActive
                  ? (lang === 'gu'
                      ? 'સર્વ કોરિડોર જંક્શનો ગ્રીન લૉક છે · તમામ ક્રોસ-ટ્રાફિક લાલ સિગ્નલ પર રોકી રાખેલ છે'
                      : 'All corridor junctions locked green · Cross traffic halted on red signals')
                  : (lang === 'gu'
                      ? 'ઇમરજન્સી કેસમાં એક ક્લિક દ્વારા સમગ્ર રૂટના તમામ સિગ્નલો એકસાથે ગ્રીન લૉક કરો'
                      : 'One-click command override to preempt all signals along active corridors')}
              </p>
            </div>
          </div>

          <button
            onClick={handleMasterPreemptToggle}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer shrink-0 ${
              isMasterPreemptActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400 shadow-emerald-950 animate-pulse'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isMasterPreemptActive
                ? (lang === 'gu' ? '✓ સર્વ સિગ્નલ ગ્રીન લૉક છે' : '✓ All Signals Locked Green')
                : (lang === 'gu' ? 'તમામ સિગ્નલ ગ્રીન લૉક કરો' : 'Preempt All Signals')}
            </span>
          </button>
        </div>
      </div>

      {/* Main Command Room Table & City Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">
              {lang === 'gu' ? 'ગુજરાત ૧૦૮ ઇમરજન્સી કોરિડોર મોનિટર' : 'Gujarat 108 Emergency Corridor Live Monitor'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'gu'
                ? 'રાજ્યવ્યાપી સક્રિય એમ્બ્યુલન્સ અને ટ્રાફિક સિગ્નલ પ્રિ-એમ્પશન સ્થિતિ'
                : 'Statewide active corridor transit and automated signal overrides'}
            </p>
          </div>

          {/* Interactive City Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedCity('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                selectedCity === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'gu' ? 'બધા શહેરો' : 'All Cities'}
            </button>

            <button
              onClick={() => setSelectedCity('ahmedabad')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                selectedCity === 'ahmedabad'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'gu' ? 'અમદાવાદ' : 'Ahmedabad'}
            </button>

            <button
              onClick={() => setSelectedCity('surat')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                selectedCity === 'surat'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'gu' ? 'સુરત' : 'Surat'}
            </button>

            <button
              onClick={() => setSelectedCity('vadodara')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                selectedCity === 'vadodara'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'gu' ? 'વડોદરા' : 'Vadodara'}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 pl-2">{lang === 'gu' ? 'એમ્બ્યુલન્સ યુનિટ' : 'Ambulance Unit'}</th>
                <th className="pb-3">{lang === 'gu' ? 'શહેર અને કોરિડોર રૂટ' : 'Corridor Route'}</th>
                <th className="pb-3">{lang === 'gu' ? 'ગંતવ્ય હોસ્પિટલ' : 'Hospital Destination'}</th>
                <th className="pb-3 font-mono-nums">{lang === 'gu' ? 'સ્પીડ' : 'Speed'}</th>
                <th className="pb-3">{lang === 'gu' ? 'સિગ્નલ સ્થિતિ' : 'Signals'}</th>
                <th className="pb-3 font-mono-nums">{lang === 'gu' ? 'ETA' : 'ETA'}</th>
                <th className="pb-3 pr-2 text-right">{lang === 'gu' ? 'સહયોગ દર' : 'Yield Rate'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFleet.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <div>
                        <span className="font-mono-nums font-bold text-white block">
                          {item.reg}
                        </span>
                        <span className="text-[10px] text-rose-400 font-semibold uppercase">
                          {item.urgency === 'critical' ? 'ICU કટોકટી' : 'ઇમરજન્સી ટ્રોમા'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <div className="font-medium text-slate-200">
                      {lang === 'gu' ? item.routeGu : item.routeEn}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.city} City Zone
                    </span>
                  </td>

                  <td className="py-3.5 text-slate-300">
                    {lang === 'gu' ? item.hospitalGu : item.hospitalEn}
                  </td>

                  <td className="py-3.5 font-mono-nums font-semibold text-slate-200">
                    {item.speedKmH} km/h
                  </td>

                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono-nums font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {item.signalsPreempted}
                    </span>
                  </td>

                  <td className="py-3.5 font-mono-nums font-bold text-amber-400">
                    {item.etaMin} {lang === 'gu' ? 'મિનિટ' : 'min'}
                  </td>

                  <td className="py-3.5 pr-2 text-right font-mono-nums font-bold text-emerald-400">
                    {item.complianceRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gujarat Traffic Police Rapid Escort & Obstacle Clearance Fleet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {lang === 'gu'
                  ? 'પોલીસ પાયલટ એસ્કોર્ટ & રેપિડ ઓબ્સ્ટેકલ ક્લિયરન્સ વાહનો'
                  : 'Police Pilot Escort & Rapid Obstacle Clearance Fleet'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'gu'
                ? 'કોરિડોર માર્ગ પર અડચણરૂપ વાહનો અને જંક્શનો તાત્કાલિક સાફ કરવા માટે સક્રિય યુનિટ્સ'
                : 'Dedicated units positioned ahead of 108 ambulances to clear lane blockages'}
            </p>
          </div>

          <span className="text-xs font-mono-nums text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            {escortUnits.length} {lang === 'gu' ? 'યુનિટ્સ ઓન-ડ્યુટી' : 'Units on Duty'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {escortUnits.map((unit) => (
            <div
              key={unit.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                unit.status === 'escorting'
                  ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono-nums font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {unit.callSign}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    unit.status === 'escorting'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : unit.status === 'clearing'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {unit.status === 'escorting'
                      ? (lang === 'gu' ? 'એસ્કોર્ટ સક્રિય' : 'Escorting')
                      : unit.status === 'clearing'
                      ? (lang === 'gu' ? 'અવરોધ મુક્ત કરે છે' : 'Clearing')
                      : (lang === 'gu' ? 'પેટ્રોલિંગ' : 'Patrolling')}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-100">
                  {lang === 'gu' ? unit.typeGu : unit.typeEn}
                </div>

                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{lang === 'gu' ? unit.locationGu : unit.locationEn}</span>
                </div>

                <div className="text-xs text-slate-400 mt-2 font-mono-nums flex items-center justify-between">
                  <span>{lang === 'gu' ? '૧૦૮ થી અંતર:' : 'Distance to 108:'}</span>
                  <span className="text-emerald-400 font-bold">{unit.distanceToAmbKm} km ahead</span>
                </div>
              </div>

              <button
                onClick={() => handleDispatchSupport(unit.id)}
                className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  unit.status === 'escorting'
                    ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>
                  {unit.status === 'escorting'
                    ? (lang === 'gu' ? '✓ પાયલટ એસ્કોર્ટ ચાલુ છે' : '✓ Escort Active')
                    : (lang === 'gu' ? 'આ યુનિટને એસ્કોર્ટ ઓર્ડર આપો' : 'Order Escort Link')}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gujarat Emergency Helpline Directory & SOS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-300 block">
              {lang === 'gu' ? '૧૦૮ ઇમરજન્સી એમ્બ્યુલન્સ' : '108 Emergency Ambulance'}
            </span>
            <div className="text-2xl font-bold font-mono-nums text-white mt-0.5">108</div>
            <span className="text-[10px] text-rose-300/80 block">
              {lang === 'gu' ? 'સમગ્ર ગુજરાત મફત સેવા' : 'Gujarat 24x7 Toll Free'}
            </span>
          </div>
          <a
            href="tel:108"
            className="w-10 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title="Call 108"
          >
            <PhoneCall className="w-5 h-5" />
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">
              {lang === 'gu' ? '૧૦૦ પોલીસ કંટ્રોલ રૂમ' : '100 Police Control Room'}
            </span>
            <div className="text-2xl font-bold font-mono-nums text-white mt-0.5">100 / 112</div>
            <span className="text-[10px] text-slate-400 block">
              {lang === 'gu' ? 'ટ્રાફિક ક્લિયરન્સ સહાય' : 'Traffic Emergency Support'}
            </span>
          </div>
          <a
            href="tel:100"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
            title="Call 100"
          >
            <PhoneCall className="w-5 h-5" />
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">
              {lang === 'gu' ? '૧૦૧ ફાયર બ્રિગેડ' : '101 Fire Emergency'}
            </span>
            <div className="text-2xl font-bold font-mono-nums text-white mt-0.5">101</div>
            <span className="text-[10px] text-slate-400 block">
              {lang === 'gu' ? 'રેસ્ક્યુ અને આપત્તિ વ્યવસ્થાપન' : 'Rescue & Disaster Ops'}
            </span>
          </div>
          <a
            href="tel:101"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
            title="Call 101"
          >
            <PhoneCall className="w-5 h-5" />
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">
              {lang === 'gu' ? '૧૦૨ જનની એક્સપ્રેસ' : '102 Maternity Express'}
            </span>
            <div className="text-2xl font-bold font-mono-nums text-white mt-0.5">102</div>
            <span className="text-[10px] text-slate-400 block">
              {lang === 'gu' ? 'માતૃ અને બાળ આરોગ્ય' : 'Maternal Emergency'}
            </span>
          </div>
          <a
            href="tel:102"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
            title="Call 102"
          >
            <PhoneCall className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};
