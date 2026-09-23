import React, { useState } from 'react';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Trophy,
  Flame,
  Waves,
  Activity,
  Compass,
  ShieldAlert,
  Wind,
  Zap,
  Lightbulb,
  Check,
  ChevronRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DisasterId } from '../types/disaster';
import { QUIZ_QUESTIONS } from '../data/quizData';
import { DISASTERS_DATA } from '../data/disasterData';
import { soundEngine } from '../audio/soundEngine';

interface QuizViewProps {
  initialDisasterId?: DisasterId | 'ALL';
  onNavigate?: (view: any) => void;
  onAddXp: (amount: number) => void;
}

interface QuestionAnswerState {
  selectedOption: number;
  isCorrect: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({
  initialDisasterId = 'ALL',
  onNavigate,
  onAddXp
}) => {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterId | 'ALL'>(initialDisasterId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answersHistory, setAnswersHistory] = useState<Record<number, QuestionAnswerState>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Filter questions according to selected filter
  const filteredQuestions = QUIZ_QUESTIONS.filter(q => 
    selectedDisaster === 'ALL' ? true : q.disasterId === selectedDisaster
  );

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];
  const currentDisasterData = currentQ && currentQ.disasterId in DISASTERS_DATA 
    ? DISASTERS_DATA[currentQ.disasterId as DisasterId] 
    : null;

  const handleSelectTopic = (topic: DisasterId | 'ALL') => {
    soundEngine.playClick();
    setSelectedDisaster(topic);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setAnswersHistory({});
    setIsQuizCompleted(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundEngine.playClick();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    setAnswersHistory(prev => ({
      ...prev,
      [currentIndex]: { selectedOption, isCorrect }
    }));

    if (isCorrect) {
      soundEngine.playCorrect();
      setScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      onAddXp(25 + (newStreak > 2 ? 10 : 0));
    } else {
      soundEngine.playWrong();
      setStreak(0);
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (currentIndex + 1 < filteredQuestions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const prevAnswer = answersHistory[nextIndex];
      if (prevAnswer) {
        setSelectedOption(prevAnswer.selectedOption);
        setIsAnswerSubmitted(true);
      } else {
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
      }
    } else {
      setIsQuizCompleted(true);
      if (score >= Math.floor(filteredQuestions.length / 2)) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleJumpToQuestion = (index: number) => {
    soundEngine.playClick();
    setCurrentIndex(index);
    const prevAnswer = answersHistory[index];
    if (prevAnswer) {
      setSelectedOption(prevAnswer.selectedOption);
      setIsAnswerSubmitted(true);
    } else {
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setAnswersHistory({});
    setIsQuizCompleted(false);
  };

  const categories = [
    { id: 'ALL', label: 'Semua Bencana', icon: Sparkles, color: '#10b981' },
    { id: 'EARTHQUAKE', label: 'Gempa Bumi', icon: Activity, color: '#10b981' },
    { id: 'TSUNAMI', label: 'Tsunami', icon: Waves, color: '#06b6d4' },
    { id: 'VOLCANO', label: 'Gunung Api', icon: Flame, color: '#ef4444' },
    { id: 'FLOOD', label: 'Banjir', icon: Compass, color: '#3b82f6' },
    { id: 'LANDSLIDE', label: 'Tanah Longsor', icon: ShieldAlert, color: '#f59e0b' },
    { id: 'TORNADO', label: 'Puting Beliung', icon: Wind, color: '#8b5cf6' },
  ];

  const getDifficultyBadge = (diff?: string) => {
    switch (diff) {
      case 'Mudah':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">Tingkat: Dasar</span>;
      case 'Sedang':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">Tingkat: Menengah</span>;
      case 'Tantangan':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">Tingkat: Lanjutan</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">Mitigasi</span>;
    }
  };

  const getDisasterIcon = (id?: string) => {
    switch (id) {
      case 'EARTHQUAKE': return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'TSUNAMI': return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'VOLCANO': return <Flame className="w-5 h-5 text-rose-400" />;
      case 'FLOOD': return <Compass className="w-5 h-5 text-blue-400" />;
      case 'LANDSLIDE': return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'TORNADO': return <Wind className="w-5 h-5 text-purple-400" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <section className="relative z-20 w-full h-[100dvh] pt-16 sm:pt-18 pb-3 px-3 sm:px-6 flex flex-col justify-between max-w-6xl mx-auto overflow-hidden animate-in fade-in duration-300">
      
      {/* ── Top Bar: Header & Category Pills ─────────────────────────── */}
      <div className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400 shadow-sm">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 leading-none">
              <span>Ujian & Kuis Kebencanaan</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 hidden sm:inline-block">
                Evaluasi Mandiri
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 leading-tight mt-0.5 hidden sm:block">
              Uji pemahaman mitigasi sains, kumpulkan XP, dan raih sertifikasi siaga bencana.
            </p>
          </div>
        </div>

        {/* Category Topic Selector (Sleek Horizontal Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 max-w-full">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedDisaster === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectTopic(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border border-emerald-500 shadow-sm shadow-emerald-950'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Quiz Card ────────────────────────────────────────────── */}
      <div className="flex-1 w-full relative min-h-0 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between">
        
        {!isQuizCompleted ? (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            
            {/* ── Left Sidebar (Topic Context, Question Matrix, Streak) ──── */}
            <div className="w-full lg:w-72 xl:w-80 bg-zinc-900/60 border-b lg:border-b-0 lg:border-r border-zinc-800 p-2.5 sm:p-3 lg:p-4 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar">
              <div>
                {/* Topic Card & Stats Row */}
                <div className="flex items-center justify-between lg:flex-col lg:items-stretch gap-2.5 mb-2 sm:mb-3">
                  {/* Topic Card */}
                  <div className="flex items-center gap-2.5 p-2 sm:p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                      {getDisasterIcon(currentQ.disasterId)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Topik Materi</div>
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {currentDisasterData?.indonesianName || 'Mitigasi Bencana'}
                      </div>
                      <div className="mt-0.5 hidden sm:block">{getDifficultyBadge(currentQ.difficulty)}</div>
                    </div>
                  </div>

                  {/* Score & Streak Stats */}
                  <div className="flex items-center lg:grid lg:grid-cols-2 gap-1.5 sm:gap-2 shrink-0">
                    <div className="p-1.5 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center sm:text-left">
                      <div className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold flex items-center gap-1 justify-center sm:justify-start">
                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> <span className="hidden sm:inline">Skor</span>
                      </div>
                      <div className="text-xs sm:text-base font-black text-emerald-400 font-mono">
                        {score}/{filteredQuestions.length}
                      </div>
                    </div>

                    <div className="p-1.5 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center sm:text-left">
                      <div className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold flex items-center gap-1 justify-center sm:justify-start">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> <span className="hidden sm:inline">Streak</span>
                      </div>
                      <div className="text-xs sm:text-base font-black text-amber-400 font-mono">
                        {streak > 0 ? `🔥${streak}x` : '0x'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Matrix Map (Jump to any question) - Hidden on ultra small screens, visible on sm+ */}
                <div className="hidden sm:block">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                    <span>Peta Soal ({currentIndex + 1}/{filteredQuestions.length})</span>
                    <span className="text-[9px] text-emerald-400 font-mono">+{score * 25} XP</span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-1.5">
                    {filteredQuestions.map((_, idx) => {
                      const ans = answersHistory[idx];
                      const isCurrent = idx === currentIndex;
                      
                      let cellClass = 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700';
                      if (ans) {
                        cellClass = ans.isCorrect
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                          : 'bg-rose-950 border-rose-600 text-rose-300 font-bold';
                      }
                      if (isCurrent) {
                        cellClass += ' ring-2 ring-emerald-400 text-white font-black scale-105';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleJumpToQuestion(idx)}
                          className={`h-7 rounded-lg text-xs border transition-all flex items-center justify-center cursor-pointer ${cellClass}`}
                          title={`Soal ${idx + 1}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mitigation Tip Card */}
              <div className="mt-3 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-[11px] text-zinc-300 hidden lg:flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Kunci jawaban membuka penjelasan ilmiah agar Anda paham logika di balik tindakan mitigasi.
                </p>
              </div>
            </div>

            {/* ── Right Main Question Area ─────────────────────────────── */}
            <div className="flex-1 flex flex-col justify-between min-h-0 bg-zinc-950">
              
              {/* Question Header & Progress Bar */}
              <div className="shrink-0">
                <div className="px-4 sm:px-6 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                      Pertanyaan {currentIndex + 1} dari {filteredQuestions.length}
                    </span>
                    <span className="text-zinc-700 hidden sm:inline">|</span>
                    <span className="text-xs text-zinc-400 hidden sm:inline">
                      Pilih 1 opsi jawaban terbaik
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-zinc-700">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>+25 XP per benar</span>
                  </div>
                </div>
              </div>

              {/* Question Prompt & 4 Option Cards */}
              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center min-h-0 overflow-y-auto custom-scrollbar">
                
                {/* Question Prompt */}
                <div className="mb-4">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Skenario Kebencanaan</span>
                  </div>
                  <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white leading-relaxed">
                    {currentQ.question}
                  </h2>
                </div>

                {/* 4 Interactive Option Cards (Grid 2x2 on sm+) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;

                    let optionClass = 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850';
                    let badgeClass = 'bg-zinc-800 text-zinc-400 border border-zinc-700';

                    if (isSelected && !isAnswerSubmitted) {
                      optionClass = 'bg-emerald-950/80 border-emerald-500 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500';
                      badgeClass = 'bg-emerald-600 text-white border border-emerald-400 font-bold';
                    } else if (isAnswerSubmitted) {
                      if (isCorrect) {
                        optionClass = 'bg-emerald-950 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500';
                        badgeClass = 'bg-emerald-600 text-white border border-emerald-400 font-bold';
                      } else if (isSelected && !isCorrect) {
                        optionClass = 'bg-rose-950 border-rose-500 text-white shadow-md ring-1 ring-rose-500';
                        badgeClass = 'bg-rose-600 text-white border border-rose-400 font-bold';
                      } else {
                        optionClass = 'bg-zinc-950/60 border-zinc-900 text-zinc-500 opacity-40';
                        badgeClass = 'bg-zinc-900 text-zinc-600 border border-zinc-800';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all duration-200 ${optionClass} ${
                          !isAnswerSubmitted ? 'cursor-pointer hover:scale-[1.01]' : 'cursor-default'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5 transition-colors ${badgeClass}`}>
                          {isAnswerSubmitted && isCorrect ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : isAnswerSubmitted && isSelected && !isCorrect ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            String.fromCharCode(65 + idx)
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-snug flex-1">
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Banner (Appears immediately after submission) */}
                {isAnswerSubmitted && (
                  <div className={`mt-3.5 p-3 rounded-xl border animate-in fade-in flex items-start gap-2.5 ${
                    selectedOption === currentQ.correctIndex 
                      ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-200' 
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                  }`}>
                    <div className="w-6 h-6 rounded-md bg-zinc-950/80 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-white mb-0.5 flex items-center gap-1.5">
                        <span>Penjelasan Ilmiah & Mitigasi:</span>
                        {selectedOption === currentQ.correctIndex ? (
                          <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-900/50">Tepat</span>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-bold px-1.5 py-0.2 rounded bg-rose-900/50">Evaluasi</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="shrink-0 px-4 sm:px-6 py-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {isAnswerSubmitted ? (
                    <div className="flex items-center gap-2 text-xs">
                      {selectedOption === currentQ.correctIndex ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          Jawaban Benar! (+25 XP)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-400 font-bold truncate">
                          <XCircle className="w-4 h-4 shrink-0" />
                          Jawaban benar adalah opsi {String.fromCharCode(65 + currentQ.correctIndex)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 hidden sm:inline">
                      Pilih jawaban lalu tekan <strong>Kunci Jawaban</strong> untuk melihat evaluasi.
                    </span>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 ${
                        selectedOption !== null
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:scale-105 shadow-emerald-950'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      }`}
                    >
                      <span>Kunci Jawaban</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950 flex items-center gap-2 cursor-pointer hover:scale-105"
                    >
                      <span>{currentIndex + 1 < filteredQuestions.length ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* ── Result Summary Arena (Celebration Card) ───────────────── */
          <div className="flex-1 p-6 sm:p-10 text-center flex flex-col items-center justify-center bg-radial from-emerald-950/20 to-zinc-950">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-zinc-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-4 shadow-xl shadow-emerald-950/40 animate-bounce">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evaluasi Kompetensi Selesai</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {score === filteredQuestions.length 
                ? 'Luar Biasa! Skor Sempurna 100%' 
                : score >= Math.floor(filteredQuestions.length * 0.7)
                ? 'Hebat! Kesiapsiagaan Sangat Baik'
                : 'Bagus! Tingkatkan Latihan Mitigasi'}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto mb-6 leading-relaxed">
              Anda berhasil menjawab <strong>{score}</strong> dari <strong>{filteredQuestions.length}</strong> pertanyaan skenario dengan tepat dan mengumpulkan <strong>+{score * 25} XP</strong> ke akun Anda.
            </p>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md w-full mb-6">
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Akurasi</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  {Math.round((score / filteredQuestions.length) * 100)}%
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Max Streak</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  🔥 {maxStreak}x
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">XP Diperoleh</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  +{score * 25}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleRestart}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" /> Ulangi Ujian Ini
              </button>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('MODULES')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm transition-all border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer hover:border-zinc-500"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  Eksplorasi Modul 3D Lainnya
                </button>
              )}
            </div>
          </div>
        )}

      </div>

    </section>
  );
};
