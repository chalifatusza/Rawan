import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Activity, 
  Flame, 
  ShieldCheck, 
  HelpCircle, 
  Compass, 
  Play, 
  Volume2, 
  Sparkles,
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DisasterId } from '../types/disaster';
import { DISASTERS_DATA } from '../data/disasterData';
import { soundEngine } from '../audio/soundEngine';

interface DisasterDetailModalProps {
  disasterId: DisasterId | null;
  onClose: () => void;
  onStartSimulation: (id: DisasterId) => void;
  onStartQuiz: (id: DisasterId) => void;
}

type TabType = 'causes' | 'signs' | 'impacts' | 'prevention' | 'emergency' | 'evacuation';

export const DisasterDetailModal: React.FC<DisasterDetailModalProps> = ({
  disasterId,
  onClose,
  onStartSimulation,
  onStartQuiz
}) => {
  if (!disasterId) return null;
  const data = DISASTERS_DATA[disasterId];
  const [activeTab, setActiveTab] = useState<TabType>('causes');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'causes', label: 'Penyebab', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'signs', label: 'Tanda Peringatan', icon: <Activity className="w-4 h-4" /> },
    { id: 'impacts', label: 'Dampak Bahaya', icon: <Flame className="w-4 h-4" /> },
    { id: 'prevention', label: 'Mitigasi & Solusi', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'emergency', label: 'Prosedur Darurat', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'evacuation', label: 'Jalur Evakuasi', icon: <Compass className="w-4 h-4" /> },
  ];

  const handleSpeech = (text: string) => {
    if (isSpeaking) {
      soundEngine.stopSpeaking();
      setIsSpeaking(false);
    } else {
      soundEngine.speakIndonesian(text);
      setIsSpeaking(true);
    }
  };

  const getCurrentSection = () => {
    switch (activeTab) {
      case 'causes': return data.causes;
      case 'signs': return data.warningSigns;
      case 'impacts': return data.impacts;
      case 'prevention': return data.prevention;
      case 'emergency': return data.emergencyProcedures;
      case 'evacuation': return data.evacuation;
    }
  };

  const currentSection = getCurrentSection();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92dvh] bg-zinc-950/95 border border-emerald-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl">
        
        {/* Header Bar */}
        <div 
          className="p-4 sm:p-6 border-b border-zinc-800 flex items-start justify-between relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${data.color}15 0%, #090d1f 100%)` }}
        >
          <div className="flex items-center gap-3 sm:gap-4 z-10 min-w-0">
            <div 
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{ backgroundColor: `${data.color}25`, border: `1.5px solid ${data.color}60` }}
            >
              <AlertTriangle className="w-5 h-5 sm:w-8 sm:h-8" style={{ color: data.color }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-slate-300 border border-zinc-700">
                  {data.category}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-emerald-400 font-semibold hidden sm:inline">MODUL EDUKASI 3D</span>
              </div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white truncate">{data.indonesianName}</h2>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-0.5 truncate">{data.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 z-10 shrink-0">
            {/* Audio Reader Button */}
            <button
              onClick={() => handleSpeech(`${data.indonesianName}. ${currentSection.title}. ${currentSection.summary}. ${currentSection.points.join('. ')}`)}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                isSpeaking 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse' 
                  : 'bg-zinc-900/80 text-slate-300 border-zinc-750 hover:text-emerald-400'
              }`}
              title={isSpeaking ? "Hentikan Suara" : "Dengarkan Narasi Audio (Bahasa Indonesia)"}
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                soundEngine.stopSpeaking();
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 text-slate-400 hover:text-white border border-zinc-750 hover:bg-zinc-800 transition-all"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center overflow-x-auto custom-scrollbar px-4 sm:px-6 py-2 bg-black/60 border-b border-zinc-800 gap-1 sm:gap-1.5 shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white border border-emerald-500 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          
          {/* Main Tab Section Content */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl">
            <h3 className="text-base sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
              <span>{currentSection.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-200 bg-zinc-800 border border-zinc-700 p-3 sm:p-3.5 rounded-xl mb-4 leading-relaxed">
              {currentSection.summary}
            </p>

            <div className="space-y-3">
              {currentSection.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Case Study & Fun Fact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Historical Event */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                  <History className="w-4 h-4" />
                  <span>Kilas Sejarah Indonesia ({data.famousEventIndonesia.year})</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{data.famousEventIndonesia.title}</h4>
                <div className="text-xs text-zinc-400 mb-2 font-medium">{data.famousEventIndonesia.location}</div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {data.famousEventIndonesia.description}
                </p>
              </div>
            </div>

            {/* Fun Fact */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Fakta Sains Unik</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mt-2 italic">
                  "{data.funFact}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 sm:p-6 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onStartQuiz(disasterId);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-zinc-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Uji Pengetahuan (Kuis)
          </button>

          <button
            onClick={() => {
              soundEngine.stopSpeaking();
              soundEngine.playClick();
              onStartSimulation(disasterId);
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            Masuk Mode Simulasi 3D
          </button>
        </div>
      </div>
    </div>
  );
};
