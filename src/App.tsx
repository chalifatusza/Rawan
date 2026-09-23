import React, { useState, useEffect, useRef } from 'react';
import { EruptionStage } from './scenes/VolcanoScene';
import { TsunamiStage } from './scenes/TsunamiScene';
import { FloodStage } from './scenes/FloodScene';
import { EarthquakeStage } from './scenes/EarthquakeScene';
import { LandslideStage } from './scenes/LandslideScene';
import { TornadoStage } from './scenes/TornadoScene';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { 
  Play, 
  BookOpen, 
  MapPin, 
  PackageCheck, 
  Award, 
  Activity, 
  Compass,
  ArrowRight,
  ShieldAlert,
  Flame,
  Waves,
  Wind,
  Layers
} from 'lucide-react';

import { DisasterId } from './types/disaster';
import { DISASTERS_DATA } from './data/disasterData';
import { soundEngine } from './audio/soundEngine';

// 3D Scenes
import { HomeEarthScene } from './scenes/HomeEarthScene';
import { EarthquakeScene } from './scenes/EarthquakeScene';
import { TsunamiScene } from './scenes/TsunamiScene';
import { VolcanoScene } from './scenes/VolcanoScene';
import { FloodScene } from './scenes/FloodScene';
import { LandslideScene } from './scenes/LandslideScene';
import { TornadoScene } from './scenes/TornadoScene';

// UI Components & Full-Page Views
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DisasterDetailModal } from './components/DisasterDetailModal';
import { SimulationOverlay } from './components/SimulationOverlay';
import { AccessibilityModal } from './components/AccessibilityModal';
import { IndonesiaMapView } from './components/IndonesiaMapView';
import { EmergencyChecklistView } from './components/EmergencyChecklistView';
import { QuizView } from './components/QuizView';

// Camera & Scene View Controller: ensures optimal viewpoints without clipping through walls
const CameraController: React.FC<{ 
  view: string; 
  disaster: DisasterId; 
  reducedMotion: boolean; 
}> = ({ view, disaster, reducedMotion }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (view === 'HOME') {
      camera.position.set(0, 0, 7.2);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    } else if (view === 'SIMULATION') {
      if (disaster === 'EARTHQUAKE') {
        camera.position.set(0, 6.8, 15.2);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, -0.4, 0);
          controlsRef.current.update();
        }
      } else if (disaster === 'TSUNAMI') {
        camera.position.set(0, 3.8, 14.5);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0.2, 0);
          controlsRef.current.update();
        }
      } else if (disaster === 'VOLCANO') {
        camera.position.set(0, 1.8, 14.0);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 1.8, 0);
          controlsRef.current.update();
        }
      } else if (disaster === 'FLOOD') {
        camera.position.set(0, 7.2, 14.8);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, -0.4, 0);
          controlsRef.current.update();
        }
      } else if (disaster === 'LANDSLIDE') {
        camera.position.set(0, 7.5, 16.0);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 1.2, 0);
          controlsRef.current.update();
        }
      } else if (disaster === 'TORNADO') {
        camera.position.set(0, 6.5, 15.5);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0.4, 0);
          controlsRef.current.update();
        }
      }
    }
  }, [view, disaster, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={view !== 'HOME'}
      enablePan={view !== 'HOME'}
      enableRotate={true}
      screenSpacePanning={true}
      maxDistance={28}
      minDistance={4.0}
      maxPolarAngle={view === 'HOME' ? Math.PI : Math.PI / 2 - 0.04}
      minPolarAngle={0}
      autoRotate={view === 'HOME' && !reducedMotion}
      autoRotateSpeed={0.5}
      rotateSpeed={0.8}
      enableDamping={true}
      dampingFactor={0.05}
    />
  );
};


export const App: React.FC = () => {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'HOME' | 'MODULES' | 'SIMULATION' | 'MAP' | 'CHECKLIST' | 'QUIZ'>('HOME');
  const [activeDisaster, setActiveDisaster] = useState<DisasterId>('EARTHQUAKE');
  const [isSimulating, setIsSimulating] = useState(true);
  const [volcanoStage, setVolcanoStage] = useState<EruptionStage>(0);
  const [tsunamiStage, setTsunamiStage] = useState<TsunamiStage>(0);
  const [floodStage, setFloodStage] = useState<FloodStage>(0);
  const [earthquakeStage, setEarthquakeStage] = useState<EarthquakeStage>(0);
  const [landslideStage, setLandslideStage] = useState<LandslideStage>(0);
  const [tornadoStage, setTornadoStage] = useState<TornadoStage>(0);
  const [showCutaway, setShowCutaway] = useState<boolean>(true);

  // Modals & Active Selections
  const [selectedDisasterForDetail, setSelectedDisasterForDetail] = useState<DisasterId | null>(null);
  const [quizDisasterFilter, setQuizDisasterFilter] = useState<DisasterId | 'ALL'>('ALL');
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);

  // User Progression & Settings (Persisted in localStorage)
  const [userXp, setUserXp] = useState<number>(() => {
    const saved = localStorage.getItem('dv3d_user_xp');
    return saved ? parseInt(saved, 10) : 50;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('dv3d_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [voiceNarrationEnabled, setVoiceNarrationEnabled] = useState(true);

  useEffect(() => {
    localStorage.setItem('dv3d_user_xp', userXp.toString());
  }, [userXp]);

  useEffect(() => {
    localStorage.setItem('dv3d_sound_enabled', soundEnabled.toString());
    soundEngine.setMuted(!soundEnabled);
  }, [soundEnabled]);

  const addXp = (amount: number) => {
    setUserXp(prev => prev + amount);
  };

  const handleStartSimulation = (id: DisasterId) => {
    setActiveDisaster(id);
    setCurrentView('SIMULATION');
    setSelectedDisasterForDetail(null);
    setIsSimulating(true);
    if (id === 'EARTHQUAKE') setEarthquakeStage(0);
    if (id === 'VOLCANO') setVolcanoStage(0);
    if (id === 'TSUNAMI') setTsunamiStage(0);
    if (id === 'FLOOD') setFloodStage(0);
    if (id === 'LANDSLIDE') setLandslideStage(0);
    if (id === 'TORNADO') setTornadoStage(0);
  };

  const handleStartQuiz = (id: DisasterId | 'ALL') => {
    setQuizDisasterFilter(id);
    setSelectedDisasterForDetail(null);
    setCurrentView('QUIZ');
  };

  const disasterList: DisasterId[] = [
    'EARTHQUAKE',
    'TSUNAMI',
    'VOLCANO',
    'FLOOD',
    'LANDSLIDE',
    'TORNADO'
  ];

  const getDisasterIcon = (id: DisasterId) => {
    switch (id) {
      case 'EARTHQUAKE': return <Activity className="w-5 h-5 text-amber-400" />;
      case 'TSUNAMI': return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'VOLCANO': return <Flame className="w-5 h-5 text-rose-400" />;
      case 'FLOOD': return <Compass className="w-5 h-5 text-blue-400" />;
      case 'LANDSLIDE': return <ShieldAlert className="w-5 h-5 text-lime-400" />;
      case 'TORNADO': return <Wind className="w-5 h-5 text-purple-400" />;
    }
  };

  const getCanvasBackground = () => {
    if (currentView === 'SIMULATION') {
      switch (activeDisaster) {
        case 'EARTHQUAKE': return '#93c5fd'; // Clear daylight diorama sky
        case 'TSUNAMI': return '#38bdf8'; // Tropical ocean daylight sky
        case 'FLOOD': return floodStage >= 1 && floodStage <= 3 ? '#64748b' : '#94a3b8'; // Dynamic flood overcast sky
        case 'LANDSLIDE': return landslideStage >= 1 && landslideStage <= 4 ? '#475569' : landslideStage >= 5 ? '#64748b' : '#38bdf8'; // Dynamic landslide daytime overcast sky
        case 'VOLCANO': return '#0f172a'; // Deep atmospheric volcanic twilight sky
        case 'TORNADO': return tornadoStage >= 1 && tornadoStage <= 5 ? '#1e293b' : '#38bdf8'; // Dynamic tornado sky
      }
    }
    return '#020617';
  };

  return (
    <div className={`flex flex-col bg-[#020617] text-slate-100 relative ${
      currentView === 'HOME' ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'
    } ${
      fontSize === 'large' ? 'font-size-large' : fontSize === 'xlarge' ? 'font-size-xlarge' : ''
    } ${highContrast ? 'high-contrast' : ''}`}>
      
      {/* Top Futuristic Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          soundEngine.playClick();
          setCurrentView(view as any);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenAccessibility={() => setShowAccessibilityModal(true)}
        userXp={userXp}
      />

      {/* 3D WebGL Canvas Layer (Interactive Fullscreen Live Background for HOME & SIMULATION) */}
      <div className={`w-full ${currentView === 'SIMULATION' ? 'fixed inset-0 z-10' : currentView === 'HOME' ? 'fixed inset-0 z-0' : 'hidden'}`}>
        <Canvas camera={{ position: [0, 0, currentView === 'HOME' ? 7.2 : 8.5], fov: 45 }}>
          <color attach="background" args={[getCanvasBackground()]} />
          {currentView !== 'SIMULATION' && (
            <Stars 
              radius={80} 
              depth={50} 
              count={2500} 
              factor={4} 
              saturation={0} 
              fade 
              speed={reducedMotion ? 0.2 : 0.8} 
            />
          )}

          {/* Dynamic 3D Scene Rendering according to View */}
          {currentView === 'HOME' && (
            <React.Suspense fallback={null}>
              <HomeEarthScene />
            </React.Suspense>
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'EARTHQUAKE' && (
            <EarthquakeScene 
              isSimulating={isSimulating && !reducedMotion} 
              earthquakeStage={earthquakeStage}
              showCutaway={showCutaway}
              onActionClick={(act) => {
                if (act === 'DROP_COVER_HOLD') {
                  soundEngine.playCorrect();
                  addXp(50);
                }
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'TSUNAMI' && (
            <TsunamiScene 
              isSimulating={isSimulating}
              tsunamiStage={tsunamiStage}
              showCutaway={showCutaway}
              onActionClick={(act) => {
                if (act === 'EVACUATE_HILL') {
                  soundEngine.playCorrect();
                  addXp(50);
                }
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'VOLCANO' && (
            <VolcanoScene 
              isSimulating={isSimulating}
              eruptionStage={volcanoStage}
              showCutaway={showCutaway}
              onActionClick={(act) => {
                if (act === 'EVACUATE_KRB') {
                  soundEngine.playCorrect();
                  addXp(50);
                }
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'FLOOD' && (
            <FloodScene 
              isSimulating={isSimulating}
              floodStage={floodStage}
              showCutaway={showCutaway}
              onActionClick={(act) => {
                soundEngine.playCorrect();
                addXp(50);
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'LANDSLIDE' && (
            <LandslideScene 
              isSimulating={isSimulating}
              landslideStage={landslideStage}
              showCutaway={showCutaway}
              onActionClick={(act) => {
                if (act === 'EVACUATE_LATERAL') {
                  soundEngine.playCorrect();
                  addXp(50);
                }
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'TORNADO' && (
            <TornadoScene 
              isSimulating={isSimulating}
              tornadoStage={tornadoStage}
              showCutaway={showCutaway}
              onActionClick={(act) => {
                if (act === 'SHELTER_SAFE_ROOM') {
                  soundEngine.playCorrect();
                  addXp(50);
                }
              }}
            />
          )}

          {/* Smart Camera Controller with View-Specific Targets & Orbit Bounds */}
          <CameraController 
            view={currentView} 
            disaster={activeDisaster} 
            reducedMotion={reducedMotion} 
          />
        </Canvas>

        {/* Simulation HUD Overlay when inside 3D simulation */}
        {currentView === 'SIMULATION' && (
          <SimulationOverlay
            disasterId={activeDisaster}
            isSimulating={isSimulating}
            onToggleSimulate={() => setIsSimulating(!isSimulating)}
            onExit={() => setCurrentView('MODULES')}
            onAddXp={addXp}
            onOpenDetails={() => setSelectedDisasterForDetail(activeDisaster)}
            earthquakeStage={activeDisaster === 'EARTHQUAKE' ? earthquakeStage : undefined}
            onSetEarthquakeStage={activeDisaster === 'EARTHQUAKE' ? setEarthquakeStage : undefined}
            volcanoStage={activeDisaster === 'VOLCANO' ? volcanoStage : undefined}
            onSetVolcanoStage={activeDisaster === 'VOLCANO' ? setVolcanoStage : undefined}
            tsunamiStage={activeDisaster === 'TSUNAMI' ? tsunamiStage : undefined}
            onSetTsunamiStage={activeDisaster === 'TSUNAMI' ? setTsunamiStage : undefined}
            floodStage={activeDisaster === 'FLOOD' ? floodStage : undefined}
            onSetFloodStage={activeDisaster === 'FLOOD' ? setFloodStage : undefined}
            landslideStage={activeDisaster === 'LANDSLIDE' ? landslideStage : undefined}
            onSetLandslideStage={activeDisaster === 'LANDSLIDE' ? setLandslideStage : undefined}
            tornadoStage={activeDisaster === 'TORNADO' ? tornadoStage : undefined}
            onSetTornadoStage={activeDisaster === 'TORNADO' ? setTornadoStage : undefined}
            showCutaway={showCutaway}
            onToggleCutaway={() => setShowCutaway(!showCutaway)}
          />
        )}
      </div>

      {/* Hero UI Layer for HOME View (Single-Screen 100% Non-Scrolling Layout) */}
      {currentView === 'HOME' && (
        <main className="relative z-10 flex-1 flex flex-col justify-between h-[100dvh] pt-16 sm:pt-20 pb-3 px-3 sm:px-6 pointer-events-none">
          {/* Top/Center Hero Typography */}
          <div className="max-w-3xl mx-auto text-center pointer-events-auto my-auto py-2 sm:py-4">
            {/* Main Hero Typography */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-1.5 sm:mb-2 text-emerald-400 text-glow-emerald drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
              RAWAN
            </h1>

            <p className="text-sm sm:text-lg md:text-xl font-extrabold text-white max-w-2xl mx-auto mb-1.5 sm:mb-2 leading-relaxed drop-shadow-sm">
              Ruang Antisipasi Waspada Anak Nusantara
            </p>

            <p className="text-[11px] sm:text-xs md:text-sm text-zinc-300 max-w-lg mx-auto mb-4 sm:mb-6 leading-relaxed px-2">
              Belajar sains di balik bencana alam dan simulasi mitigasi penyelamatan diri 3 dimensi interaktif untuk siswa dan anak Indonesia.
            </p>

            {/* Main Call To Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 px-4 sm:px-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setCurrentView('MODULES');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Mulai Eksplorasi 3D</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setCurrentView('MODULES');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer shadow-md hover:border-zinc-500"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pelajari Modul Bencana</span>
              </button>
            </div>
          </div>

          {/* Quick Access Feature Banners in Beranda (Compact Bottom Bar) */}
          <div className="max-w-5xl mx-auto w-full pointer-events-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5 w-full text-left">
              {/* Banner 1: Peta Bencana */}
              <div 
                onClick={() => {
                  soundEngine.playClick();
                  setCurrentView('MAP');
                }}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-600 cursor-pointer transition-all hover:-translate-y-0.5 shadow-md group flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">Peta Bencana Indonesia</h4>
                  <p className="text-[10px] text-zinc-400 truncate">Live gempa BMKG, gunung api & sesar aktif</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>

              {/* Banner 2: Tas Siaga Bencana */}
              <div 
                onClick={() => {
                  soundEngine.playClick();
                  setCurrentView('CHECKLIST');
                }}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-600 cursor-pointer transition-all hover:-translate-y-0.5 shadow-md group flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">Tas Siaga Bencana (TSB)</h4>
                  <p className="text-[10px] text-zinc-400 truncate">Kesiapan darurat 72 jam BNPB</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>

              {/* Banner 3: Kuis & Ujian */}
              <div 
                onClick={() => {
                  soundEngine.playClick();
                  handleStartQuiz('ALL');
                }}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-600 cursor-pointer transition-all hover:-translate-y-0.5 shadow-md group flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">Ujian & Kuis Kebencanaan</h4>
                  <p className="text-[10px] text-zinc-400 truncate">Uji pemahaman & raih skor</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </div>

            {/* Sleek single line copyright */}
            <div className="text-center text-[10px] text-zinc-500 mt-2.5">
              © 2026 RAWAN (Ruang Antisipasi Waspada Anak Nusantara) • Edukasi Mitigasi Kebencanaan 3D
            </div>
          </div>
        </main>
      )}

      {/* Grid of 6 Disaster Cards exclusively on MODULES View */}
      {currentView === 'MODULES' && (
        <section id="modul-bencana" className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12 w-full flex-1 animate-in fade-in duration-300">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-emerald-600 text-emerald-400 text-xs font-bold mb-2">
              <Layers className="w-3 h-3" />
              <span>Katalog Pembelajaran Interaktif</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">6 Modul Bencana Alam</h2>
            <p className="text-xs text-zinc-400 mt-1">Pilih modul untuk mempelajari sains di balik bencana dan menguji kesiapan mitigasi Anda</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {disasterList.map((id) => {
              const data = DISASTERS_DATA[id];
              return (
                <div
                  key={id}
                  className="group relative rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-600 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                >
                  {/* Accent border top */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-0.5 transition-all" 
                    style={{ backgroundColor: data.color }} 
                  />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${data.color}20`, border: `1px solid ${data.color}50` }}
                      >
                        {getDisasterIcon(id)}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-700">
                        {data.category}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                      {data.indonesianName}
                    </h3>
                    <p className="text-xs text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
                      {data.subtitle}
                    </p>

                    <div className="text-[11px] text-zinc-300 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 mb-4 italic">
                      "{data.tagline}"
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDisasterForDetail(id);
                      }}
                      className="py-2 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-zinc-800"
                    >
                      <BookOpen className="w-3 h-3" /> Pelajari
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        handleStartSimulation(id);
                      }}
                      className="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Play className="w-3 h-3 fill-white" /> Simulasi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Full-Page Interactive Map Portal */}
      {currentView === 'MAP' && (
        <IndonesiaMapView onNavigate={(view) => setCurrentView(view)} />
      )}

      {/* Full-Page Emergency Survival Kit Checklist */}
      {currentView === 'CHECKLIST' && (
        <EmergencyChecklistView onNavigate={(view) => setCurrentView(view)} />
      )}

      {/* Full-Page Gamified Quiz & Evaluation Arena */}
      {currentView === 'QUIZ' && (
        <QuizView 
          initialDisasterId={quizDisasterFilter}
          onNavigate={(view) => setCurrentView(view)}
          onAddXp={addXp}
        />
      )}

      {/* Educational Accreditation Footer (For scrollable views like MODULES, CHECKLIST) */}
      {currentView !== 'SIMULATION' && currentView !== 'HOME' && currentView !== 'MAP' && currentView !== 'QUIZ' && (
        <Footer 
          onSelectDisaster={(id) => setSelectedDisasterForDetail(id)}
          onOpenChecklist={() => setCurrentView('CHECKLIST')}
          onOpenMap={() => setCurrentView('MAP')}
        />
      )}

      {/* Modals & Dialogs */}
      {selectedDisasterForDetail && (
        <DisasterDetailModal
          disasterId={selectedDisasterForDetail}
          onClose={() => setSelectedDisasterForDetail(null)}
          onStartSimulation={(id) => handleStartSimulation(id)}
          onStartQuiz={(id) => handleStartQuiz(id)}
        />
      )}

      {showAccessibilityModal && (
        <AccessibilityModal
          onClose={() => setShowAccessibilityModal(false)}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          highContrast={highContrast}
          onToggleHighContrast={() => setHighContrast(!highContrast)}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
          voiceNarrationEnabled={voiceNarrationEnabled}
          onToggleVoiceNarration={() => setVoiceNarrationEnabled(!voiceNarrationEnabled)}
        />
      )}

    </div>
  );
};

export default App;
