import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Car {
  id: number;
  x: number;
  y: number;
  targetX: number;
  speed: number;
  lane: 'left' | 'center' | 'right';
  hasYielded: boolean;
  color: string;
  type: 'sedan' | 'suv' | 'auto' | 'bike';
}

interface InteractiveCorridorCanvasProps {
  ambulanceSpeedKmH: number;
  isSirenActive: boolean;
  onVehicleYielded?: (count: number) => void;
  lang: 'gu' | 'en';
}

export const InteractiveCorridorCanvas: React.FC<InteractiveCorridorCanvasProps> = ({
  ambulanceSpeedKmH,
  isSirenActive,
  onVehicleYielded,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [clearedVehicles, setClearedVehicles] = useState(14);
  const [corridorClearRate, setCorridorClearRate] = useState(92);
  const [obstacleSimulated, setObstacleSimulated] = useState(false);

  const onVehicleYieldedRef = useRef(onVehicleYielded);
  useEffect(() => {
    onVehicleYieldedRef.current = onVehicleYielded;
  }, [onVehicleYielded]);

  const carsRef = useRef<Car[]>([]);
  const roadOffsetRef = useRef(0);
  const lightStatusRef = useRef<'red' | 'green'>('red');
  const animationFrameRef = useRef<number | null>(null);
  const ambulanceYRef = useRef(380);


  // Initialize cars in 3 lanes
  useEffect(() => {
    const laneX = {
      left: 70,
      center: 150,
      right: 230,
    };

    const initialCars: Car[] = [
      { id: 1, x: laneX.center, y: 120, targetX: laneX.center, speed: 1.2, lane: 'center', hasYielded: false, color: '#38bdf8', type: 'sedan' },
      { id: 2, x: laneX.right, y: 190, targetX: laneX.right, speed: 1.4, lane: 'right', hasYielded: false, color: '#f59e0b', type: 'auto' },
      { id: 3, x: laneX.left, y: 80, targetX: laneX.left, speed: 0.9, lane: 'left', hasYielded: true, color: '#a855f7', type: 'suv' },
      { id: 4, x: laneX.center, y: 260, targetX: laneX.center, speed: 1.1, lane: 'center', hasYielded: false, color: '#ec4899', type: 'sedan' },
      { id: 5, x: laneX.right, y: 40, targetX: laneX.right, speed: 1.3, lane: 'right', hasYielded: false, color: '#10b981', type: 'bike' },
    ];
    carsRef.current = initialCars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      tick++;
      const width = canvas.width;
      const height = canvas.height;

      // Road background (asphalt)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Road curb / shoulder
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 0, width - 40, height);

      // Grass / Sidewalk borders
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, 20, height);
      ctx.fillRect(width - 20, 0, 20, height);

      // Road surface
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(25, 0, width - 50, height);

      // Animated dashed lane dividers
      const speedMultiplier = isRunning ? ambulanceSpeedKmH / 30 : 0;
      roadOffsetRef.current = (roadOffsetRef.current + speedMultiplier * 2.5) % 40;

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 16]);
      ctx.lineDashOffset = -roadOffsetRef.current;

      // Lane 1 divider (between Left & Center: x = 110)
      ctx.beginPath();
      ctx.moveTo(110, 0);
      ctx.lineTo(110, height);
      ctx.stroke();

      // Lane 2 divider (between Center & Right: x = 190)
      ctx.beginPath();
      ctx.moveTo(190, 0);
      ctx.lineTo(190, height);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Green Corridor Glow in Center & Right lanes when siren is active
      if (isSirenActive) {
        const pulse = Math.sin(tick * 0.08) * 0.15 + 0.25;
        const grad = ctx.createLinearGradient(110, 0, 270, 0);
        grad.addColorStop(0, `rgba(16, 185, 129, ${pulse})`);
        grad.addColorStop(0.5, `rgba(5, 150, 105, ${pulse * 1.4})`);
        grad.addColorStop(1, `rgba(16, 185, 129, ${pulse})`);
        ctx.fillStyle = grad;
        ctx.fillRect(110, 0, 160, height);

        // Emergency route arrows pointing forward
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        for (let y = (tick * 3) % 80; y < height; y += 80) {
          ctx.beginPath();
          ctx.moveTo(190, y);
          ctx.lineTo(205, y + 15);
          ctx.lineTo(190, y + 10);
          ctx.lineTo(175, y + 15);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Traffic Signal at the top of the canvas (x: 275, y: 40)
      const isApproachingLight = tick % 300 < 220;
      lightStatusRef.current = isApproachingLight ? 'green' : 'red';

      // Signal pole
      ctx.fillStyle = '#334155';
      ctx.fillRect(width - 45, 20, 18, 50);
      // Red light
      ctx.fillStyle = lightStatusRef.current === 'red' ? '#ef4444' : '#450a0a';
      ctx.beginPath();
      ctx.arc(width - 36, 32, 6, 0, Math.PI * 2);
      ctx.fill();
      if (lightStatusRef.current === 'red') {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // Green light
      ctx.fillStyle = lightStatusRef.current === 'green' ? '#10b981' : '#064e3b';
      ctx.beginPath();
      ctx.arc(width - 36, 52, 6, 0, Math.PI * 2);
      ctx.fill();
      if (lightStatusRef.current === 'green') {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw and update civilian cars
      const leftLaneX = 65;
      carsRef.current.forEach((car) => {
        if (isRunning) {
          // Cars move down relative to fast ambulance
          car.y += (car.speed - (ambulanceSpeedKmH / 45)) * 1.8;

          // If car is ahead of ambulance and siren is active, yield to the left lane!
          if (isSirenActive && car.y < ambulanceYRef.current && car.lane !== 'left') {
            car.targetX = leftLaneX + (car.id % 2) * 12;
            if (Math.abs(car.x - car.targetX) < 4 && !car.hasYielded) {
              car.hasYielded = true;
              car.lane = 'left';
              setClearedVehicles(prev => prev + 1);
              if (onVehicleYieldedRef.current) {
                const callback = onVehicleYieldedRef.current;
                setTimeout(() => {
                  callback(1);
                }, 0);
              }
            }
          }


          // Smooth interpolation to targetX (swerving to the left safely)
          car.x += (car.targetX - car.x) * 0.08;

          // Wrap around top/bottom
          if (car.y > height + 40) {
            car.y = -50;
            // Spawn back randomly in center or right unless yielded
            car.lane = Math.random() > 0.5 ? 'center' : 'right';
            car.targetX = car.lane === 'center' ? 150 : 230;
            car.x = car.targetX;
            car.hasYielded = false;
          }
          if (car.y < -60) {
            car.y = height + 30;
          }
        }

        // Draw civilian car
        ctx.save();
        ctx.translate(car.x, car.y);

        // Car shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(-14, -20, 28, 44, 6);
        ctx.fill();

        // Car body
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.roundRect(-12, -18, 24, 40, 5);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-9, -10, 18, 8);
        ctx.fillRect(-9, 6, 18, 5);

        // Turn indicator flashing left if moving to left lane
        if (car.targetX < car.x - 2 && tick % 20 < 10) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(-11, -16, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw 108 Emergency Ambulance (fixed at ambulanceYRef with vibrating / pulsing siren)
      const ambX = 185; // Traveling down center/right corridor
      const ambY = ambulanceYRef.current;

      ctx.save();
      ctx.translate(ambX, ambY);

      // Flashing siren beam waves spreading forward
      if (isSirenActive) {
        const beamPhase = (tick * 0.1) % 1;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(-65, -160);
        ctx.lineTo(65, -160);
        ctx.closePath();
        const beamGrad = ctx.createRadialGradient(0, -25, 10, 0, -100, 150);
        const redAlpha = Math.sin(tick * 0.25) > 0 ? 0.35 : 0.05;
        const blueAlpha = Math.sin(tick * 0.25) <= 0 ? 0.35 : 0.05;
        beamGrad.addColorStop(0, `rgba(239, 68, 68, ${redAlpha})`);
        beamGrad.addColorStop(0.5, `rgba(59, 130, 246, ${blueAlpha})`);
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fill();
        ctx.restore();

        // Pulse concentric rings ahead
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 - beamPhase * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -30, 20 + beamPhase * 70, Math.PI, 0);
        ctx.stroke();
      }

      // Ambulance shadow
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.roundRect(-18, -32, 36, 68, 6);
      ctx.fill();

      // Ambulance body (White with 108 Green & Red stripe)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-16, -30, 32, 64, 5);
      ctx.fill();

      // Green & Orange side livery
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-15, -2, 4, 28);
      ctx.fillRect(11, -2, 4, 28);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-15, 6, 4, 12);
      ctx.fillRect(11, 6, 4, 12);

      // Windshield
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-13, -22, 26, 12);
      // Rear glass
      ctx.fillRect(-12, 22, 24, 6);

      // Red cross symbol on roof
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-2, -2, 4, 12);
      ctx.fillRect(-6, 2, 12, 4);

      // Front headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-13, -31, 5, 2);
      ctx.fillRect(8, -31, 5, 2);

      // Dual-Color Emergency Beacon Bar on top
      const isRedPhase = Math.sin(tick * 0.3) > 0;
      // Left Beacon (Red)
      ctx.fillStyle = isSirenActive && isRedPhase ? '#ef4444' : '#991b1b';
      ctx.fillRect(-11, -12, 8, 4);
      if (isSirenActive && isRedPhase) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.fillRect(-11, -12, 8, 4);
        ctx.shadowBlur = 0;
      }

      // Right Beacon (Blue)
      ctx.fillStyle = isSirenActive && !isRedPhase ? '#3b82f6' : '#1e3a8a';
      ctx.fillRect(3, -12, 8, 4);
      if (isSirenActive && !isRedPhase) {
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 12;
        ctx.fillRect(3, -12, 8, 4);
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // UI HUD Overlays on Canvas
      // Lane tags on road bottom
      ctx.font = '10px "Noto Sans Gujarati", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(lang === 'gu' ? 'ડાબી લેન (મુક્તિ)' : 'Left (Yield)', 40, height - 12);
      ctx.fillStyle = '#10b981';
      ctx.fillText(lang === 'gu' ? 'ગ્રીન કોરિડોર (૧૦૮)' : 'Green Corridor (108)', 150, height - 12);

      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, ambulanceSpeedKmH, isSirenActive, lang]);


  const handleSimulateObstacle = () => {
    setObstacleSimulated(true);
    // Move one car in front of ambulance
    if (carsRef.current.length > 0) {
      carsRef.current[0].lane = 'center';
      carsRef.current[0].targetX = 180;
      carsRef.current[0].y = 280;
      carsRef.current[0].hasYielded = false;
      setCorridorClearRate(76);
    }
    setTimeout(() => {
      setObstacleSimulated(false);
      setCorridorClearRate(94);
    }, 4500);
  };

  const handleResetPositions = () => {
    carsRef.current.forEach(c => {
      c.y = Math.random() * 260;
      c.hasYielded = false;
      c.lane = Math.random() > 0.5 ? 'center' : 'right';
      c.targetX = c.lane === 'center' ? 150 : 230;
      c.x = c.targetX;
    });
    setCorridorClearRate(91);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-5 items-center">
      {/* 2D Animated Road Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950 shrink-0">
        <canvas
          ref={canvasRef}
          width={300}
          height={430}
          className="block w-[300px] h-[430px]"
        />
        {/* Beacon active indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-md border border-slate-700 text-xs">
          <span className={`w-2 h-2 rounded-full ${isSirenActive ? 'bg-rose-500 animate-ping' : 'bg-slate-500'}`} />
          <span className="font-medium text-slate-200">
            {lang === 'gu' ? 'લાઇવ કોરિડોર સિમ્યુલેશન' : 'Live Corridor Radar'}
          </span>
        </div>
      </div>

      {/* Corridor Radar Statistics & Interactive Triggers */}
      <div className="flex-1 flex flex-col justify-between h-full w-full">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-base font-semibold text-slate-100">
                {lang === 'gu' ? '૧૦૮ ગ્રીન કોરિડોર રિયલ્ટી ટ્રેકર' : '108 Green Corridor Live Tracker'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'gu'
                  ? 'વાહનો ડાબી બાજુ ખસીને ૧૦૮ એમ્બ્યુલન્સને મુક્ત રસ્તો આપે છે'
                  : 'Automated civilian lane-clearing radar'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono-nums px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{corridorClearRate}% {lang === 'gu' ? 'માર્ગ મુક્ત' : 'Cleared'}</span>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-xs text-slate-400 block">
                {lang === 'gu' ? 'ખસેલા વાહનોની સંખ્યા' : 'Vehicles Cleared'}
              </span>
              <span className="text-2xl font-bold font-mono-nums text-emerald-400">
                {clearedVehicles}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {lang === 'gu' ? 'ડાબી લેન તરફ વળ્યા' : 'Moved to left shoulder'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-xs text-slate-400 block">
                {lang === 'gu' ? 'આગામી સિગ્નલ પ્રિ-એમ્પશન' : 'Signal Preemption'}
              </span>
              <span className="text-base font-bold font-mono-nums text-emerald-400 flex items-center gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'gu' ? 'ગ્રીન લૉક (૧૮ સે.)' : 'GREEN LOCKED (18s)'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {lang === 'gu' ? 'ઈસ્કોન જંક્શન ક્લીયર' : 'Iscon Junction Open'}
              </span>
            </div>
          </div>

          {/* Lane Protocol Advisory */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              {lang === 'gu' ? 'ગુજરાત ટ્રાફિક નિયમ - ઇમરજન્સી રાઇટ ઓફ વે:' : 'Gujarat Traffic Rule - Right of Way:'}
            </div>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'gu'
                ? 'જ્યારે ૧૦૮ સાયરન સાંભળો ત્યારે ગભરાયા વિના ધીમેથી વાહનને ડાબી લેનમાં લો. વચ્ચે કે જમણી બાજુ ઊભા ન રહો.'
                : 'When hearing the 108 siren, pull smoothly into the left-most lane. Keep center and fast lanes completely open.'}
            </p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800 mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isRunning ? (lang === 'gu' ? 'થોભો' : 'Pause') : (lang === 'gu' ? 'શરૂ કરો' : 'Play')}</span>
          </button>

          <button
            onClick={handleSimulateObstacle}
            disabled={obstacleSimulated}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>
              {obstacleSimulated
                ? (lang === 'gu' ? 'અવરોધ હટાવાઈ રહ્યો છે...' : 'Clearing Obstacle...')
                : (lang === 'gu' ? 'ટ્રાફિક અવરોધ ટેસ્ટ કરો' : 'Simulate Choke Point')}
            </span>
          </button>

          <button
            onClick={handleResetPositions}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors ml-auto"
            title="Reset positions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'gu' ? 'રીસેટ' : 'Reset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
