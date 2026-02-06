
import React from 'react';

interface Props {
  suspicion: number;
  reputation: number;
}

const NaughtyMeter: React.FC<Props> = ({ suspicion, reputation }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/20 w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Kecurigaan Guru</span>
          <span className={`font-black text-sm ${suspicion > 70 ? 'text-red-500' : 'text-blue-500'}`}>{suspicion}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              suspicion > 70 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-blue-400 to-indigo-500'
            }`}
            style={{ width: `${suspicion}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">Street Cred (Reputasi)</span>
          <span className="font-black text-sm text-orange-500">{reputation}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${Math.min(reputation / 2, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default NaughtyMeter;
