
import React, { useState, useEffect } from 'react';
import { Mission, GameState, AIResponse } from './types';
import { generateMission, generateScenario } from './services/geminiService';
import NaughtyMeter from './components/NaughtyMeter';
import { 
  Trophy, 
  Skull, 
  Zap, 
  Search, 
  Map as MapIcon, 
  Backpack, 
  AlertTriangle,
  RefreshCw,
  Play,
  User,
  ChevronRight,
  ShieldAlert,
  Flame,
  Sword
} from 'lucide-react';

const CHARACTERS = [
  { id: 'imam', name: 'Imam', desc: 'Si Otak Encer tapi hobi bolos kantin.', color: 'from-blue-600 to-cyan-500' },
  { id: 'ojan', name: 'Ojan', desc: 'Spesialis petasan dan jebakan kursi guru.', color: 'from-orange-600 to-yellow-500' },
  { id: 'vino', name: 'Vino', desc: 'Visual sekolah yang ternyata raja bully.', color: 'from-emerald-600 to-teal-400' },
  { id: 'budi', name: 'Budi', desc: 'Legenda hidup kekacauan SMA 1 Jakarta.', color: 'from-rose-600 to-pink-500' },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerName: "",
    selectedCharacter: "",
    reputation: 10,
    suspicion: 0,
    missionCount: 0,
    inventory: ["Kapur Ajaib", "Permen Karet"],
    currentMission: null,
    history: ["Selamat datang di sekolah. Pak Yono sudah standby di gerbang..."],
    gameOver: false,
    won: false,
    isStarted: false,
    isExpelled: false
  });

  const [scenario, setScenario] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'hallway' | 'inventory' | 'history'>('hallway');

  const startGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState.playerName.trim() && gameState.selectedCharacter) {
      setGameState(prev => ({ ...prev, isStarted: true }));
    }
  };

  const startNewMission = async () => {
    setLoading(true);
    try {
      const mission = await generateMission(gameState.selectedCharacter, gameState.playerName, gameState.missionCount);
      const scn = await generateScenario(gameState.selectedCharacter, gameState.playerName, mission, gameState.missionCount);
      setGameState(prev => ({ 
        ...prev, 
        currentMission: mission,
        history: [`Misi #${prev.missionCount + 1}: ${mission.title}`, ...prev.history]
      }));
      setScenario(scn);
    } catch (error) {
      console.error("Error loading mission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (optionIndex: number) => {
    if (!scenario || !gameState.currentMission) return;

    const choice = scenario.options[optionIndex];
    const isSuccess = Math.random() * 100 < choice.successChance;
    const isFinalStage = gameState.missionCount >= 5;
    
    // Logic for ending: Fight vs Expulsion
    const isAggressiveAction = choice.text.toLowerCase().includes('lawan') || 
                               choice.text.toLowerCase().includes('berantem') || 
                               choice.text.toLowerCase().includes('hajar');

    let newSuspicion = gameState.suspicion + (isSuccess ? choice.risk / 4 : choice.risk);
    let newReputation = gameState.reputation + (isSuccess ? gameState.currentMission.reward : -20);
    
    const outcomeMsg = isSuccess 
      ? `BERHASIL! ${choice.outcome}` 
      : `HANCUR! ${choice.outcome}. Pak Yono murka!`;

    const newHistory = [outcomeMsg, ...gameState.history];
    
    // Final Boss Logic: If failed aggression or high suspicion in climax
    if (newSuspicion >= 100 || (isFinalStage && !isSuccess && isAggressiveAction)) {
      setGameState(prev => ({
        ...prev,
        suspicion: 100,
        history: ["PAK YONO: 'SAYA TIDAK TAHAN LAGI! KAMU RESMI DIKELUARKAN DARI SEKOLAH INI!'", ...newHistory],
        gameOver: true,
        isExpelled: true,
        currentMission: null
      }));
      setScenario(null);
    } else {
      setGameState(prev => ({
        ...prev,
        suspicion: Math.min(100, Math.max(0, newSuspicion)),
        reputation: Math.max(0, newReputation),
        missionCount: prev.missionCount + 1,
        history: newHistory,
        currentMission: null
      }));
      setScenario(null);
      
      if (newReputation >= 400) {
        setGameState(prev => ({ ...prev, won: true, gameOver: true }));
      }
    }
  };

  const restartGame = () => {
    setGameState({
      playerName: gameState.playerName,
      selectedCharacter: "",
      reputation: 10,
      suspicion: 0,
      missionCount: 0,
      inventory: ["Kapur Ajaib", "Permen Karet"],
      currentMission: null,
      history: ["Mari kita coba lagi, Pak Yono tidak akan tahu apa yang menimpanya..."],
      gameOver: false,
      won: false,
      isStarted: false,
      isExpelled: false
    });
    setScenario(null);
  };

  if (!gameState.isStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans overflow-y-auto">
        <div className="max-w-2xl w-full space-y-8 py-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="text-center space-y-3">
            <h1 className="text-7xl font-comic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 drop-shadow-2xl">
              MURID BANDEL 2
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[2px] w-12 bg-red-600"></span>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Edisi Amarah Pak Yono</p>
              <span className="h-[2px] w-12 bg-red-600"></span>
            </div>
          </div>

          <form onSubmit={startGame} className="space-y-10 bg-white/5 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/10 shadow-[0_0_50px_rgba(255,0,0,0.1)]">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">Nama Pemberontak</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={24} />
                <input 
                  type="text" 
                  placeholder="Ketik namamu di sini..." 
                  className="w-full bg-slate-900/80 border-2 border-white/5 rounded-3xl py-5 pl-14 pr-6 text-white text-lg focus:outline-none focus:ring-4 focus:ring-red-600/20 focus:border-red-600 transition-all font-bold placeholder:text-slate-600"
                  value={gameState.playerName}
                  onChange={(e) => setGameState(prev => ({ ...prev, playerName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">Pilih Karaktermu</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setGameState(prev => ({ ...prev, selectedCharacter: char.id }))}
                    className={`relative p-6 rounded-[2rem] border-2 transition-all text-left group overflow-hidden ${
                      gameState.selectedCharacter === char.id 
                        ? 'border-red-600 bg-red-600/10 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${char.color} opacity-10 group-hover:opacity-30 transition-opacity rounded-full blur-xl`}></div>
                    <div className="relative z-10">
                      <p className={`font-black text-xl mb-1 ${gameState.selectedCharacter === char.id ? 'text-red-400' : 'text-white'}`}>{char.name}</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{char.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={!gameState.selectedCharacter || !gameState.playerName}
              className="w-full bg-gradient-to-br from-red-600 to-rose-700 py-6 rounded-[2rem] font-black text-2xl shadow-2xl hover:shadow-red-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale group"
            >
              MASUK SEKOLAH <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pb-36 overflow-x-hidden selection:bg-red-200">
      {/* Dynamic Header */}
      <header className="w-full max-w-2xl mt-4 mb-8">
        <div className="bg-white p-6 rounded-[3rem] border border-slate-200 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br ${CHARACTERS.find(c => c.id === gameState.selectedCharacter)?.color} animate-pulse`}>
              <User size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">PROFIL PEMBERONTAK</p>
              <h2 className="text-2xl font-comic text-slate-900 leading-tight">
                {gameState.playerName} <span className="text-slate-300 text-lg">|</span> <span className="text-red-600">{gameState.selectedCharacter.toUpperCase()}</span>
              </h2>
            </div>
          </div>
          <div className="hidden sm:block bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-lg">
            <p className="text-[9px] font-black text-slate-400 uppercase text-center">Progresi</p>
            <p className="text-lg font-black text-center leading-none mt-1">LV. {gameState.missionCount + 1}</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-8 animate-in slide-in-from-bottom-12 duration-700">
        <NaughtyMeter suspicion={gameState.suspicion} reputation={gameState.reputation} />

        <div className="bg-white rounded-[4rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-slate-100 min-h-[520px] flex flex-col relative">
          {gameState.gameOver ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
              {gameState.won ? (
                <>
                  <div className="w-32 h-32 bg-yellow-100 rounded-[3rem] flex items-center justify-center animate-bounce shadow-[0_20px_40px_rgba(234,179,8,0.2)]">
                    <Trophy className="w-16 h-16 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-5xl font-comic text-slate-900 mb-4 uppercase">PENGUASA SEKOLAH!</h2>
                    <p className="text-slate-500 font-bold text-lg max-w-md mx-auto">
                      Pak Yono resmi mengundurkan diri karena stres. Sekolah ini sekarang di bawah kendalimu!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-32 h-32 bg-rose-100 rounded-[3rem] flex items-center justify-center shadow-[0_20px_40px_rgba(225,29,72,0.2)]">
                    {gameState.isExpelled ? <ShieldAlert className="w-16 h-16 text-rose-700" /> : <Skull className="w-16 h-16 text-rose-600" />}
                  </div>
                  <div>
                    <h2 className="text-5xl font-comic text-rose-600 mb-4 uppercase">DIKELUARKAN!</h2>
                    <p className="text-slate-500 font-bold text-lg max-w-md mx-auto leading-relaxed">
                      {gameState.isExpelled 
                        ? "Kamu berantem hebat dengan Pak Yono di tengah lapangan. Surat DO ditandatangani hari ini juga." 
                        : "Pak Yono menangkap basah aksimu. Tidak ada ampun lagi bagi murid sepertimu."}
                    </p>
                  </div>
                </>
              )}
              <button 
                onClick={restartGame}
                className="bg-slate-950 text-white px-14 py-6 rounded-[2.5rem] font-black text-xl flex items-center gap-4 hover:bg-slate-800 transition-all shadow-2xl active:scale-95 group"
              >
                <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" /> COBA LAGI
              </button>
            </div>
          ) : (
            <div className="flex-1">
              {activeTab === 'hallway' && (
                <div className="space-y-8">
                  {!gameState.currentMission ? (
                    <div className="text-center space-y-10 py-16">
                      <div className="relative inline-block group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-orange-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                          <p className="text-2xl font-bold text-slate-700 italic leading-relaxed">
                            {gameState.missionCount >= 5 
                              ? "Lonceng pulang sebentar lagi berbunyi. Ini saatnya menjatuhkan Pak Yono!" 
                              : "Keadaan terlalu tenang... Pak Yono pasti sedang ngopi di ruang guru."}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={startNewMission}
                        disabled={loading}
                        className="group bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-3xl px-16 py-8 rounded-[3rem] shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:shadow-red-600/50 active:scale-[0.97] transition-all w-full flex items-center justify-center gap-5 border-b-[10px] border-red-900"
                      >
                        {loading ? <RefreshCw className="animate-spin" size={32} /> : (gameState.missionCount >= 5 ? <Sword size={36} className="fill-current" /> : <Flame size={36} className="fill-current" />)}
                        {loading ? 'MENYUSUN RENCANA...' : (gameState.missionCount >= 5 ? 'HADAPI PAK YONO' : 'CARI GARA-GARA')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in slide-in-from-right-16 duration-700">
                      <div className={`p-8 rounded-[3rem] shadow-2xl text-white transform rotate-1 ${gameState.missionCount >= 5 ? 'bg-slate-950 border-4 border-red-600 shadow-red-600/20' : 'bg-slate-900'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-comic text-3xl text-orange-400 tracking-wide uppercase leading-none">{gameState.currentMission.title}</h3>
                          {gameState.missionCount >= 5 && <span className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black animate-pulse shadow-lg uppercase">Puncak Amarah</span>}
                        </div>
                        <p className="text-slate-300 font-medium text-lg leading-relaxed italic">"{gameState.currentMission.description}"</p>
                        <div className="mt-6 flex items-center gap-3">
                          <Zap size={18} className="text-yellow-400" />
                          <span className="text-sm font-black text-yellow-400 uppercase tracking-widest">Hadiah: +{gameState.currentMission.reward} Cred</span>
                        </div>
                      </div>

                      {scenario ? (
                        <div className="space-y-8">
                          <div className="p-8 bg-rose-50 rounded-[3rem] border-2 border-rose-100 text-rose-950 font-bold relative shadow-inner text-xl leading-snug">
                            <div className="absolute -top-6 -left-6 bg-red-600 text-white p-4 rounded-[1.5rem] shadow-2xl transform -rotate-12 border-4 border-red-400">
                              <AlertTriangle size={32} />
                            </div>
                            <p className="pl-6"><span className="text-red-700 uppercase tracking-tighter block mb-2 text-sm opacity-60">Pak Yono Menghadang:</span> "{scenario.scenario}"</p>
                          </div>
                          <div className="grid gap-4">
                            {scenario.options.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleChoice(idx)}
                                className="group relative bg-white border-2 border-slate-100 p-7 rounded-[2.5rem] text-left hover:border-red-600 hover:bg-red-50/50 transition-all flex justify-between items-center shadow-lg hover:shadow-2xl active:scale-[0.98]"
                              >
                                <div className="flex-1 pr-6">
                                  <p className="font-black text-slate-800 text-xl leading-tight group-hover:text-red-700 transition-colors">{opt.text}</p>
                                  <div className="flex gap-6 mt-3 opacity-60">
                                    <span className={`text-[11px] uppercase font-black tracking-[0.2em] ${opt.risk > 50 ? 'text-red-600' : 'text-slate-500'}`}>Risiko: {opt.risk}%</span>
                                    <span className="text-[11px] uppercase font-black text-slate-500 tracking-[0.2em]">Berhasil: {opt.successChance}%</span>
                                  </div>
                                </div>
                                <div className="h-14 w-14 bg-slate-100 rounded-[1.5rem] flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner border border-slate-200">
                                  <Play size={20} fill="currentColor" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-20 space-y-6">
                          <div className="relative">
                            <RefreshCw className="animate-spin text-red-600" size={56} />
                            <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20"></div>
                          </div>
                          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Menghitung Langkah Pak Yono...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in zoom-in-95 duration-500">
                  {gameState.inventory.map((item, i) => (
                    <div key={i} className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl hover:border-red-600 transition-all group cursor-default">
                      <div className="bg-rose-50 p-5 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                        <Backpack size={32} className="text-red-600" />
                      </div>
                      <span className="font-black text-slate-800 text-xl">{item}</span>
                    </div>
                  ))}
                  <div className="border-4 border-dashed border-slate-100 p-8 rounded-[2.5rem] flex items-center justify-center text-slate-300 font-black text-xs uppercase tracking-widest">Slot Kosong</div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-5 max-h-[480px] overflow-y-auto pr-4 custom-scrollbar">
                  {gameState.history.map((entry, i) => (
                    <div key={i} className={`p-8 rounded-[2.5rem] border-2 shadow-sm transition-all ${i === 0 ? 'bg-red-600 text-white border-red-700 shadow-red-200' : 'bg-white border-slate-50 text-slate-600 opacity-60'}`}>
                      <p className={`text-lg leading-relaxed ${i === 0 ? 'font-black' : 'font-medium'}`}>{entry}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modern Floating Bottom Nav */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/95 backdrop-blur-3xl p-5 rounded-[3.5rem] flex justify-between items-center shadow-[0_30px_70px_rgba(0,0,0,0.4)] z-50 border border-white/10 ring-1 ring-white/20">
        <button 
          onClick={() => setActiveTab('hallway')}
          className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-3xl transition-all duration-300 ${activeTab === 'hallway' ? 'bg-white text-slate-950 scale-105 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
        >
          <Search size={26} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Eksplor</span>
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-3xl transition-all duration-300 ${activeTab === 'inventory' ? 'bg-white text-slate-950 scale-105 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
        >
          <Backpack size={26} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Stok</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-3xl transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-slate-950 scale-105 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
        >
          <MapIcon size={26} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Catatan</span>
        </button>
      </nav>

      {/* Extreme Warning Overlay */}
      {gameState.suspicion > 80 && !gameState.gameOver && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 bg-red-600 text-white px-10 py-5 rounded-[2.5rem] font-black flex items-center gap-5 animate-bounce shadow-[0_25px_50px_rgba(220,38,38,0.5)] z-50 uppercase text-sm tracking-[0.2em] border-4 border-red-400">
          <ShieldAlert size={32} className="animate-pulse" /> AWAS! PAK YONO NGAMUK!
        </div>
      )}
    </div>
  );
};

export default App;
