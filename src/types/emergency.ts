export type AppMode = 'driver' | 'responder' | 'command';


export type EmergencyUrgency = 'critical' | 'severe' | 'standard';

export interface BuzzerConfig {
  type: 'active' | 'passive';
  pinNumber: number;
  triggerDistanceCm: number;
  mode: 'siren' | 'proximity_pulses' | 'continuous' | 'traffic_preempt';
  frequencyHz: number;
}


export interface TrafficSignal {
  id: string;
  nameGu: string;
  nameEn: string;
  distanceMeters: number;
  status: 'red' | 'yellow' | 'green' | 'preempted';
  timeToArrivalSec: number;
  isPreempted: boolean;
  crossStreetGu: string;
  crossStreetEn: string;
}

export interface RouteWaypoint {
  id: string;
  xPercent: number;
  yPercent: number;
  nameGu: string;
  nameEn: string;
  type: 'pickup' | 'junction' | 'hospital';
  nextInstructionGu?: string;
  nextInstructionEn?: string;
}

export interface EmergencyRoute {
  id: string;
  cityGu: string;
  cityEn: string;
  nameGu: string;
  nameEn: string;
  startPointGu: string;
  startPointEn: string;
  hospitalGu: string;
  hospitalEn: string;
  totalDistanceKm: number;
  standardDurationMin: number;
  priorityDurationMin: number;
  savedMinutes: number;
  signals: TrafficSignal[];
  waypoints?: RouteWaypoint[];
}


export type SirenMode = 'wail' | 'yelp' | 'hi_lo' | 'piercer';

export interface AmbulanceData {
  id: string;
  regNumber: string;
  unitNameGu: string;
  unitNameEn: string;
  currentSpeedKmH: number;
  distanceToDriverMeters: number;
  status: 'en_route_pickup' | 'transporting_to_hospital' | 'clearing_corridor';
  patientTypeGu: string;
  patientTypeEn: string;
  urgency: EmergencyUrgency;
  beaconActive: boolean;
  sirenActive: boolean;
  sirenMode: SirenMode;
  audioVoiceEnabled: boolean;
  destinationHospitalGu: string;
  destinationHospitalEn: string;
  totalVehiclesAlerted: number;
  vehiclesMovedAside: number;
}


export interface DriverState {
  currentLane: 'left' | 'center' | 'right';
  hasYielded: boolean;
  yieldTimeSec: number | null;
  speedKmH: number;
  lifeSaverPoints: number;
  clearedCount: number;
  warningLevel: 'safe' | 'caution' | 'urgent';
}
