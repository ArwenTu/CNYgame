
import React from 'react';
import { Player } from '../types';

interface LeaderboardProps {
  players: Player[];
  currentPlayerIndex: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, currentPlayerIndex }) => {
  return (
    <div className="bg-red-800/90 border-4 border-yellow-600 rounded-[2.5rem] p-4 md:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <h2 className="text-2xl md:text-3xl font-serif text-yellow-500 mb-4 text-center border-b-2 border-yellow-800/50 pb-2">積分排行榜</h2>
      <div className="space-y-3">
        {[...players].sort((a, b) => b.score - a.score).map((p, idx) => (
          <div 
            key={p.id}
            className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${players[currentPlayerIndex].id === p.id ? 'bg-yellow-600/90 shadow-xl ring-2 ring-yellow-300 translate-x-1' : 'bg-red-900/40'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-yellow-400">#{idx + 1}</span>
              <div className="w-8 h-8 rounded-full border-2 border-white/80 shadow-sm" style={{ backgroundColor: p.color }} />
              <span className="text-lg font-bold truncate max-w-[80px]">{p.name}</span>
            </div>
            <div className="text-xl font-black text-white drop-shadow-sm">
              {p.score} <span className="text-[10px] font-normal text-yellow-200 uppercase tracking-tighter">pts</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Description section removed as requested */}
    </div>
  );
};

export default Leaderboard;
