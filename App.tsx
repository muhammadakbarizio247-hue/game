
import React, { useState } from 'react';
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
  Flame
} from 'lucide-react';

const CHARACTERS = [
  { id: 'imam', name: 'Imam', desc: 'Si Tukang Bolos berotak cerdas.', color: 'from-blue-500 to-indigo-600' },
  { id: 'ojan', name: 'Ojan', desc: 'Ahli petasan dan bom air.', color: 'from-orange-500 to-red-600' },
  { id: 'vino', name: 'Vino', desc: 'Ganteng-ganteng tukang bully.', color: 'from-emerald-500 to-teal-600' },
  { id: 'budi', name: 'Budi', desc: 'Legenda hidup kekacauan sekolah.', color: 'from-pink-500 to-rose-600' },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerName: "",
    selectedCharacter: "",
    reputation: 10,
    suspicion: 0,
    missionCount: 0,
    inventory: ["Kapur Ajaib", "Karet Gelang"],
    currentMission: null,
    history: ["Petualangan dimulai. Pak Yono sudah mulai curiga..."],
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
      const scn = await generateScenario(gameState.selectedCharacter, gameState.playerName, mission, gameState.suspicion);
      setGameState(prev => ({ 
        ...prev, 
        currentMission: mission,
        history: [`Misi #${prev.missionCount + 1}: ${mission.title}`, ...prev.history]
      }));
      setScenario(scn);
    } catch (error) {
      console.error("Gagal memuat misi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (optionIndex: number) => {
    if (!scenario || !gameState.currentMission) return;

    const choice = scenario.options[optionIndex];
    const isSuccess = Math.random() * 100 < choice.successChance;
    const isFinalMission = gameState.missionCount >= 5;
    
    let newSuspicion = gameState.suspicion + (isSuccess ? choice.risk / 3 : choice.risk);
    let newReputation = gameState.reputation + (isSuccess ? gameState.currentMission.reward : -15);
    
    // Alur Berantem vs Pak Yono
    const isFighting = choice.text.toLowerCase().includes('berantem') || choice.text.toLowerCase().includes('lawan');
    
    const outcomeMsg = isSuccess 
      ? `MENANG! ${choice.outcome}` 
      : `HANCUR! ${choice.outcome}. Pak Yono murka!`;

    const newHistory = [outcomeMsg, ...gameState.history];
    
    if (newSuspicion >= 100 || (isFinalMission && !isSuccess && isFighting)) {
      setGameState(prev => ({
        ...prev,
        suspicion: 100,
        history: ["PAK YONO: 'SAYA TIDAK TAHAN LAGI! KAMU SAYA DO!' Kamu resmi dikeluarkan!", ...newHistory],
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
      
      if (newReputation >= 300) {
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
      inventory: ["Kapur Ajaib", "Karet Gelang"],
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="max-w-2xl w-full space-y-8 animate-in fade-in duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-6xl font-comic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              MURID BANDEL 2
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">The Final Boss: Pak Yono</p>
          </div>

          <form onSubmit={startGame} className="space-y-8 bg-white/5 backdrop-blur-md p-8 rounded-[3rem] border border-white/10 shadow-2xl">
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Siapa Namamu?</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Ketik namamu..." 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold"
                  value={gameState.playerName}
                  onChange={(e) => setGameState(prev => ({ ...prev, playerName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Pilih Karaktermu</label>
              <div className="grid grid-cols-2 gap-4">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setGameState(prev => ({ ...prev, selectedCharacter: char.id }))}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-left overflow-hidden group ${
                      gameState.selectedCharacter === char.id 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${char.color} opacity-20 group-hover:opacity-40 transition-opacity rounded-bl-full`}></div>
                    <p className={`font-black text-lg ${gameState.selectedCharacter === char.id ? 'text-red-400' : 'text-white'}`}>{char.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{char.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={!gameState.selectedCharacter || !gameState.playerName}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 py-5 rounded-[2rem] font-black text-xl shadow-xl hover:shadow-red-500/40 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              MASUK SEKOLAH <ChevronRight />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 pb-32 overflow-x-hidden">
      {/* Header Statis */}
      <header className="w-full max-w-2xl mt-4 mb-6">
        <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${CHARACTERS.find(c => c.id === gameState.selectedCharacter)?.color}`}>
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Karakter: {gameState.selectedCharacter.toUpperCase()}</p>
              <h2 className="text-2xl font-comic text-slate-800 leading-tight">{gameState.playerName}</h2>
            </div>
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase">Progres</p>
            <p className="text-sm font-black text-slate-700">Level {gameState.missionCount + 1}</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-6">
        <NaughtyMeter suspicion={gameState.suspicion} reputation={gameState.reputation} />

        <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 min-h-[480px] flex flex-col relative overflow-hidden">
          {gameState.gameOver ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              {gameState.won ? (
                <>
                  <div className="w-24 h-24 bg-yellow-100 rounded-[2rem] flex items-center justify-center animate-bounce shadow-lg">
                    <Trophy className="w-12 h-12 text-yellow-500" />
                  </div>
                  <h2 className="text-4xl font-comic text-emerald-600">RAJA SEKOLAH!</h2>
                  <p className="text-slate-500 font-medium">Pak Yono akhirnya menyerah dan pensiun dini. Sekolah milikmu sekarang!</p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-rose-100 rounded-[2rem] flex items-center justify-center shadow-lg">
                    {gameState.isExpelled ? <ShieldAlert className="w-12 h-12 text-rose-600" /> : <Skull className="w-12 h-12 text-rose-500" />}
                  </div>
                  <h2 className="text-4xl font-comic text-rose-600 uppercase">DIKELUARKAN!</h2>
                  <p className="text-slate-500 font-medium italic">
                    {gameState.isExpelled 
                      ? "Kamu berantem dengan Pak Yono dan kalah telak secara hukum. Surat DO sudah di tangan." 
                      : "Kecurigaan Pak Yono terbukti. Kamu diseret keluar pagar sekolah."}
                  </p>
                </>
              )}
              <button 
                onClick={restartGame}
                className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              >
                <RefreshCw size={20} /> MULAI LAGI
              </button>
            </div>
          ) : (
            <div className="flex-1">
              {activeTab === 'hallway' && (
                <div className="space-y-6">
                  {!gameState.currentMission ? (
                    <div className="text-center space-y-8 py-12">
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative bg-white p-8 rounded-[2rem] border border-slate-100">
                          <p className="text-xl font-bold text-slate-700 italic">
                            {gameState.missionCount >= 5 
                              ? "Pak Yono sedang lengah di ruang guru. Inilah saatnya!" 
                              : "Lorong kelas 10 sepertinya butuh sedikit 'warna'..."}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={startNewMission}
                        disabled={loading}
                        className="group bg-gradient-to-br from-red-600 to-rose-600 text-white font-black text-2xl px-12 py-6 rounded-[2rem] shadow-2xl shadow-red-200 hover:shadow-red-400 active:scale-95 transition-all w-full flex items-center justify-center gap-4 border-b-8 border-red-800"
                      >
                        {loading ? <RefreshCw className="animate-spin" /> : <Flame size={32} className="fill-current" />}
                        {loading ? 'MENYIAPKAN JEBAKAN...' : (gameState.missionCount >= 5 ? 'MISI FINAL' : 'CARI MASALAH')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-12 duration-500">
                      <div className={`p-6 rounded-[2rem] shadow-xl text-white transform rotate-1 ${gameState.missionCount >= 5 ? 'bg-slate-950 ring-4 ring-red-600' : 'bg-slate-900'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-comic text-2xl text-orange-400 tracking-wide uppercase">{gameState.currentMission.title}</h3>
                          {gameState.missionCount >= 5 && <span className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-black animate-pulse">CLIMAX</span>}
                        </div>
                        <p className="text-slate-300 font-medium leading-relaxed italic">"{gameState.currentMission.description}"</p>
                      </div>

                      {scenario ? (
                        <div className="space-y-6">
                          <div className="p-6 bg-red-50 rounded-[2rem] border-2 border-red-100 text-red-900 font-bold relative shadow-inner">
                            <div className="absolute -top-4 -left-4 bg-red-600 text-white p-3 rounded-2xl shadow-xl transform -rotate-12">
                              <AlertTriangle size={24} />
                            </div>
                            <p className="ml-4">PAK YONO: "{scenario.scenario}"</p>
                          </div>
                          <div className="grid gap-3">
                            {scenario.options.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleChoice(idx)}
                                className="group relative bg-white border-2 border-slate-100 p-5 rounded-[1.5rem] text-left hover:border-red-500 hover:bg-red-50/50 transition-all flex justify-between items-center shadow-md hover:shadow-xl active:scale-[0.98]"
                              >
                                <div className="flex-1 pr-4">
                                  <p className="font-black text-slate-800 text-lg leading-tight">{opt.text}</p>
                                  <div className="flex gap-4 mt-2">
                                    <span className={`text-[10px] uppercase font-black tracking-widest ${opt.risk > 50 ? 'text-red-500' : 'text-slate-400'}`}>Risiko: {opt.risk}%</span>
                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Sukses: {opt.successChance}%</span>
                                  </div>
                                </div>
                                <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
                                  <Play size={16} fill="currentColor" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                          <RefreshCw className="animate-spin text-red-500" size={40} />
                          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Mendeteksi Langkah Pak Yono...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">
                  {gameState.inventory.map((item, i) => (
                    <div key={i} className="bg-white border-2 border-slate-100 p-6 rounded-3xl flex items-center gap-4 shadow-md hover:border-red-200 transition-all">
                      <div className="bg-red-50 p-3 rounded-2xl shadow-inner">
                        <Backpack size={24} className="text-red-600" />
                      </div>
                      <span className="font-black text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {gameState.history.map((entry, i) => (
                    <div key={i} className={`p-6 rounded-3xl border-2 shadow-sm ${i === 0 ? 'bg-red-600 text-white border-red-700 animate-in slide-in-from-left-4' : 'bg-white border-slate-50 text-slate-600'}`}>
                      <p className={`text-sm ${i === 0 ? 'font-black' : 'font-medium'}`}>{entry}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Navigasi Bawah */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-slate-900/95 backdrop-blur-2xl p-4 rounded-[3rem] flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 border border-white/10">
        <button 
          onClick={() => setActiveTab('hallway')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${activeTab === 'hallway' ? 'bg-white text-slate-950 scale-105 shadow-xl' : 'text-slate-400'}`}
        >
          <Search size={22} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Misi</span>
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-950 scale-105 shadow-xl' : 'text-slate-400'}`}
        >
          <Backpack size={22} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Barang</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${activeTab === 'history' ? 'bg-white text-slate-950 scale-105 shadow-xl' : 'text-slate-400'}`}
        >
          <MapIcon size={22} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Jurnal</span>
        </button>
      </nav>

      {gameState.suspicion > 80 && !gameState.gameOver && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-3xl font-black flex items-center gap-4 animate-bounce shadow-2xl z-50 uppercase text-sm tracking-widest border-4 border-red-400">
          <ShieldAlert size={24} /> PAK YONO DI BELAKANGMU!
        </div>
      )}
    </div>
  );
};

export default App;
