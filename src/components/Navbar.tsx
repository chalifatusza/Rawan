import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  MapPin, 
  PackageCheck, 
  Award, 
  Layers,
  Menu,
  X,
  Home
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAccessibility: () => void;
  userXp?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  soundEnabled,
  onToggleSound,
  onOpenAccessibility,
  userXp = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const handleNav = (view: string) => {
    soundEngine.playClick();
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-6 py-2 h-14 flex items-center justify-between backdrop-blur-xl bg-black/95 border-b border-zinc-800">
      {/* Brand / Logo */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => handleNav('HOME')}
      >
        <img 
          src="/logo_rawan.png" 
          alt="Logo RAWAN" 
          className="w-7 h-7 object-contain group-hover:scale-105 transition-transform" 
        />
        <div>
          <div className="flex items-center gap-1">
            <span className="text-base sm:text-lg font-black tracking-tight text-white">RAWAN</span>
          </div>
          <p className="text-[9px] text-zinc-400 tracking-wide hidden sm:block leading-none">Ruang Antisipasi Waspada Anak Nusantara</p>
        </div>
      </div>

      {/* Main Desktop Navigation Links (Centered mathematically on viewport) */}
      <nav className="hidden lg:flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
        <button
          onClick={() => handleNav('HOME')}
          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'HOME' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Home className="w-3.5 h-3.5" /> Beranda
        </button>

        <button
          onClick={() => handleNav('MODULES')}
          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'MODULES' || currentView === 'SIMULATION' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Modul Bencana
        </button>

        <button
          onClick={() => handleNav('MAP')}
          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'MAP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Peta Bencana
        </button>

        <button
          onClick={() => handleNav('CHECKLIST')}
          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'CHECKLIST' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" /> Tas Siaga
        </button>

        <button
          onClick={() => handleNav('QUIZ')}
          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'QUIZ' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Kuis & Ujian
        </button>
      </nav>

      {/* Right Controls: Sound, Accessibility & Mobile Menu Toggle */}
      <div className="flex items-center gap-2">
        {/* Sound Toggle with Volume Popover */}
        <div className="relative">
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleSound();
            }}
            onMouseEnter={() => setShowVolumeSlider(true)}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
              soundEnabled
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title={soundEnabled ? "Nonaktifkan Suara" : "Aktifkan Suara"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Mini Volume Slider on Hover */}
          {showVolumeSlider && soundEnabled && (
            <div 
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="absolute right-0 top-10 p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl flex flex-col gap-1 w-32 animate-in fade-in z-50"
            >
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Accessibility Modal Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenAccessibility();
          }}
          className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center"
          title="Pengaturan Aksesibilitas"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className="lg:hidden w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs flex items-center justify-center transition-all"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay & Dropdown Menu */}
      {mobileMenuOpen && (
        <>
          {/* Click-outside backdrop */}
          <div 
            className="lg:hidden fixed inset-0 top-14 bg-black/70 backdrop-blur-sm z-30 animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Navigation Drawer */}
          <div className="lg:hidden absolute top-full left-0 right-0 bg-zinc-950/95 border-b border-zinc-800 p-3 sm:p-4 flex flex-col gap-1.5 shadow-2xl animate-in slide-in-from-top-2 z-40 backdrop-blur-xl">
            <button
              onClick={() => handleNav('HOME')}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                currentView === 'HOME' ? 'bg-emerald-600 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
              }`}
            >
              <Home className="w-4 h-4" /> Beranda
            </button>

            <button
              onClick={() => handleNav('MODULES')}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                currentView === 'MODULES' || currentView === 'SIMULATION' ? 'bg-emerald-600 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Modul Bencana
            </button>

            <button
              onClick={() => handleNav('MAP')}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                currentView === 'MAP' ? 'bg-emerald-600 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
              }`}
            >
              <MapPin className="w-4 h-4" /> Peta Bencana
            </button>

            <button
              onClick={() => handleNav('CHECKLIST')}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                currentView === 'CHECKLIST' ? 'bg-emerald-600 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
              }`}
            >
              <PackageCheck className="w-4 h-4" /> Tas Siaga Bencana
            </button>

            <button
              onClick={() => handleNav('QUIZ')}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                currentView === 'QUIZ' ? 'bg-emerald-600 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
              }`}
            >
              <Award className="w-4 h-4" /> Kuis & Ujian
            </button>
          </div>
        </>
      )}
    </header>
  );
};
