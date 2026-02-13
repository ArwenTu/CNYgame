
import React, { useState } from 'react';
import { GameState } from '../types';

interface GameBoardProps {
  gameState: GameState;
  onMove: (steps: number) => void;
  isAnimating: boolean;
}

// Redesigned Horse Icon - Head-only matching the provided emoji image
const HorseIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg filter" style={{ filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.6))' }}>
    <path 
      d="M10,45 Q5,35 15,25 Q20,15 35,10 Q50,8 55,15 Q60,25 58,40 Q55,60 35,60 L15,60 Q10,60 10,45" 
      fill={color} 
      stroke="rgba(0,0,0,0.2)" 
      strokeWidth="1"
    />
    <path 
      d="M35,10 Q45,5 55,10 Q60,15 58,25 Q62,35 58,45 Q60,55 50,60 L45,60 Q40,40 35,10" 
      fill="#4B2C20" 
    />
    <path 
      d="M10,45 Q8,52 15,58 L25,55 Q20,40 10,45" 
      fill="rgba(0,0,0,0.1)" 
    />
    <circle cx="42" cy="28" r="4" fill="black" />
    <circle cx="43.5" cy="26.5" r="1.5" fill="white" />
    <ellipse cx="16" cy="50" rx="2" ry="3" fill="#2D1A12" transform="rotate(-20 16 50)" />
    <path d="M12,55 Q18,58 22,54" stroke="#2D1A12" fill="none" strokeWidth="2" strokeLinecap="round" />
    <path d="M48,12 L54,2 L58,10 Z" fill={color} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
  </svg>
);

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onMove, isAnimating }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(1);

  const rollDice = () => {
    if (isRolling || isAnimating || gameState.status === 'GAME_OVER') return;
    setIsRolling(true);
    
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setDiceResult(result);
      setIsRolling(false);
      onMove(result);
    }, 1000);
  };

  const renderSquares = () => {
    const squares: React.ReactElement[] = [];
    
    gameState.board.forEach((sq, idx) => {
      let gridPos = "";
      if (idx < 10) gridPos = `1 / ${idx + 1}`;
      else if (idx < 19) gridPos = `${idx - 8} / 10`;
      else if (idx < 28) gridPos = `10 / ${10 - (idx - 18)}`;
      else gridPos = `${10 - (idx - 27)} / 1`;

      const playersHere = gameState.players.filter(p => p.position === idx);

      let icon = "";
      switch(sq.type) {
        case 'START': icon = "⛩️"; break;
        case 'A': icon = "🧧"; break;
        case 'B': icon = "🏺"; break;
        case 'C': icon = "💰"; break;
        case 'D': icon = "💎"; break;
        case 'BOMB': icon = "🧨"; break;
      }

      return squares.push(
        <div 
          key={idx}
          className={`relative border-2 border-yellow-500/40 flex items-center justify-center p-1 overflow-hidden transition-all duration-500 ${
            sq.type === 'START' ? 'bg-yellow-500' :
            sq.type === 'BOMB' ? 'bg-black/60 border-red-500 ring-2 ring-red-600/50' :
            sq.type === 'A' ? 'bg-red-700 hover:bg-red-600' :
            sq.type === 'B' ? 'bg-yellow-800 hover:bg-yellow-700' :
            sq.type === 'C' ? 'bg-orange-800 hover:bg-orange-700' : 'bg-red-950'
          }`}
          style={{ gridArea: gridPos }}
        >
          <div className={`text-2xl md:text-4xl filter drop-shadow-md brightness-110 ${sq.type === 'BOMB' ? 'animate-pulse' : ''}`}>{icon}</div>
          
          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-1 z-20 pointer-events-none">
            {playersHere.map(p => (
              <div 
                key={p.id} 
                className="w-10 h-10 md:w-12 md:h-12 animate-bounce transition-all duration-300 transform scale-125"
                title={p.name}
              >
                <HorseIcon color={p.color} />
              </div>
            ))}
          </div>
        </div>
      );
    });

    return squares;
  };

  const render3DDice = () => {
    const faces = [
      { id: 1, dots: [5], isRed: true },
      { id: 2, dots: [1, 9] },
      { id: 3, dots: [1, 5, 9] },
      { id: 4, dots: [1, 3, 7, 9], isRed: true },
      { id: 5, dots: [1, 3, 5, 7, 9] },
      { id: 6, dots: [1, 3, 4, 6, 7, 9] }
    ];

    return (
      <div className="dice-scene">
        <div className={`dice roll-${diceResult} ${isRolling ? 'dice-spinning' : ''}`}>
          {faces.map(f => (
            <div key={f.id} className={`dice-face face-${f.id}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <div key={i} className={`dot ${f.dots.includes(i) ? (f.isRed ? 'red' : '') : 'invisible'}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[700px] aspect-square bg-red-950/80 rounded-[3rem] p-3 md:p-6 shadow-[0_30px_60px_rgba(0,0,0,0.7)] border-[12px] border-yellow-700 grid grid-cols-10 grid-rows-10">
      {renderSquares()}

      {/* Center Area */}
      <div className="col-start-2 col-end-10 row-start-2 row-end-10 flex flex-col items-center justify-between py-10 bg-red-900/40 rounded-[2rem] text-center border-4 border-yellow-600/30 backdrop-blur-md">
        
        <div className="mt-2 w-full px-4">
          <p className="text-xl md:text-3xl font-serif text-yellow-400 mb-1">
            輪到：
          </p>
          <span className="text-3xl md:text-5xl font-black text-white px-8 py-3 bg-red-600/90 rounded-2xl shadow-[0_10px_0_#991b1b] border-2 border-yellow-500/30 inline-block transform -rotate-1 tracking-wider">
            {gameState.players[gameState.currentPlayerIndex]?.name}
          </span>
        </div>

        <div className="scale-[1.8] my-4">
          {render3DDice()}
        </div>

        <button 
          onClick={rollDice}
          disabled={isRolling || isAnimating || gameState.status === 'GAME_OVER'}
          className={`px-16 py-5 bg-gradient-to-b from-yellow-300 to-yellow-600 text-red-950 rounded-full text-4xl font-black shadow-[0_12px_0_#92400e] active:translate-y-2 active:shadow-none transition-all disabled:opacity-50 disabled:grayscale hover:brightness-110 mb-4`}
        >
          擲骰子
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
