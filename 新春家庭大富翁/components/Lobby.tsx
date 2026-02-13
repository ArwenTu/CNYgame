
import React, { useState, useEffect } from 'react';
import { GameStatus, GameState, Player } from '../types';
import { HORSE_COLORS } from '../constants';

interface LobbyProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const Lobby: React.FC<LobbyProps> = ({ gameState, setGameState }) => {
  const [inputCode, setInputCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [registeredPlayers, setRegisteredPlayers] = useState<Player[]>([]);

  // Simulate Multiplayer Synchronization via localStorage
  useEffect(() => {
    if (gameState.roomCode) {
      const storageKey = `ROOM_DATA_${gameState.roomCode}`;
      
      const syncFromStorage = () => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          setRegisteredPlayers(data.players || []);
          
          // If the host starts the game, everyone else should see it
          if (data.status === GameStatus.PLAYING) {
            setGameState(prev => ({ 
              ...prev, 
              players: data.players, 
              status: GameStatus.PLAYING 
            }));
          }
        }
      };

      // Initial sync
      syncFromStorage();

      // Listen for changes from other tabs
      const handleStorage = (e: StorageEvent) => {
        if (e.key === storageKey) syncFromStorage();
      };
      window.addEventListener('storage', handleStorage);
      
      // Polling as a fallback for the same tab or missed events
      const interval = setInterval(syncFromStorage, 1000);

      return () => {
        window.removeEventListener('storage', handleStorage);
        clearInterval(interval);
      };
    }
  }, [gameState.roomCode, setGameState]);

  const updateRoomStorage = (players: Player[], status: GameStatus = GameStatus.CHARACTER_SELECT) => {
    if (gameState.roomCode) {
      localStorage.setItem(`ROOM_DATA_${gameState.roomCode}`, JSON.stringify({
        players,
        status,
        lastUpdate: Date.now()
      }));
    }
  };

  const handleCreate = () => {
    if (inputCode.length === 3 && /^\d+$/.test(inputCode)) {
      setGameState(prev => ({ ...prev, roomCode: inputCode, status: GameStatus.CHARACTER_SELECT }));
      updateRoomStorage([], GameStatus.CHARACTER_SELECT);
    } else {
      alert('請輸入三位數字代碼');
    }
  };

  const handleJoin = () => {
    if (inputCode.length === 3 && /^\d+$/.test(inputCode)) {
      setGameState(prev => ({ ...prev, roomCode: inputCode, status: GameStatus.CHARACTER_SELECT }));
    } else {
      alert('請輸入三位數字代碼');
    }
  };

  const addPlayer = () => {
    if (!playerName) {
      alert('請輸入玩家姓名');
      return;
    }
    if (!selectedColor) {
      alert('請選擇顏色');
      return;
    }
    if (registeredPlayers.length >= 6) {
      alert('最多只能 6 人參賽');
      return;
    }
    if (registeredPlayers.some(p => p.name === playerName)) {
      alert('此姓名已被使用');
      return;
    }

    const newPlayer: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: playerName,
      color: selectedColor,
      score: 0,
      position: 0,
      isHost: registeredPlayers.length === 0
    };

    const updated = [...registeredPlayers, newPlayer];
    setRegisteredPlayers(updated);
    updateRoomStorage(updated);
    setPlayerName('');
    setSelectedColor(null);
  };

  const startGame = () => {
    if (registeredPlayers.length < 2) {
      alert('至少需要 2 位玩家才能開始遊戲');
      return;
    }

    updateRoomStorage(registeredPlayers, GameStatus.PLAYING);
    setGameState(prev => ({
      ...prev,
      players: registeredPlayers,
      status: GameStatus.PLAYING
    }));
  };

  const goHome = () => {
    setGameState(prev => ({ ...prev, status: GameStatus.LOBBY, roomCode: '' }));
    setInputCode('');
  };

  if (gameState.status === GameStatus.LOBBY) {
    return (
      <div className="flex flex-col items-center gap-8 mt-20 animate-fade-in">
        <h1 className="text-7xl font-serif text-yellow-500 drop-shadow-2xl text-center mb-4">新春家庭大富翁</h1>
        <div className="flex flex-col sm:flex-row gap-6 mt-10">
          <button 
            onClick={() => setGameState(prev => ({ ...prev, status: GameStatus.CREATE_ROOM }))}
            className="px-12 py-6 bg-yellow-600 hover:bg-yellow-500 text-white rounded-3xl text-3xl font-bold shadow-2xl transition transform hover:scale-105 border-b-8 border-yellow-800"
          >
            創建代碼
          </button>
          <button 
            onClick={() => setGameState(prev => ({ ...prev, status: GameStatus.JOIN_ROOM }))}
            className="px-12 py-6 bg-red-700 hover:bg-red-600 border-4 border-yellow-500 text-white rounded-3xl text-3xl font-bold shadow-2xl transition transform hover:scale-105 border-b-8 border-red-900"
          >
            代碼連線
          </button>
        </div>
      </div>
    );
  }

  if (gameState.status === GameStatus.CREATE_ROOM || gameState.status === GameStatus.JOIN_ROOM) {
    return (
      <div className="flex flex-col items-center gap-8 mt-20 p-10 bg-red-800 rounded-[3rem] border-8 border-yellow-600 shadow-2xl max-w-md w-full">
        <h2 className="text-4xl font-serif text-yellow-400">
          {gameState.status === GameStatus.CREATE_ROOM ? '創建遊戲代碼' : '輸入遊戲代碼'}
        </h2>
        <input 
          type="text" 
          maxLength={3}
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="三位數字 (如 168)"
          className="w-full text-center text-5xl p-6 bg-red-900 border-b-4 border-yellow-500 text-yellow-100 outline-none rounded-xl"
        />
        <div className="flex flex-col w-full gap-4">
          <button 
            onClick={gameState.status === GameStatus.CREATE_ROOM ? handleCreate : handleJoin}
            className="w-full py-5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-2xl text-3xl font-bold transition shadow-lg"
          >
            下一步
          </button>
          <button 
            onClick={goHome}
            className="w-full py-3 bg-red-900/50 hover:bg-red-900 text-yellow-500/80 rounded-xl text-xl font-bold transition"
          >
            回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-10 p-8 w-full max-w-3xl bg-red-800 rounded-[3rem] border-8 border-yellow-600 shadow-2xl">
      <div className="w-full flex justify-between items-center mb-2">
        <h2 className="text-4xl font-serif text-yellow-400">登錄玩家 ({registeredPlayers.length}/6)</h2>
        <span className="bg-red-900 text-yellow-500 px-4 py-2 rounded-full font-bold">代碼：{gameState.roomCode}</span>
      </div>
      
      <div className="w-full flex flex-col gap-4 bg-red-900/50 p-6 rounded-3xl">
        <div className="w-full">
          <label className="block text-xl mb-2 text-yellow-200">玩家姓名：</label>
          <input 
            type="text" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-4 rounded-xl bg-red-900 text-yellow-100 border-2 border-yellow-500 text-2xl focus:ring-2 ring-yellow-400 outline-none"
            placeholder="請輸入姓名..."
          />
        </div>
        <div className="w-full">
          <label className="block text-xl mb-2 text-yellow-200">選擇小馬代表色：</label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {HORSE_COLORS.map(c => {
              const isUsed = registeredPlayers.some(p => p.color === c.color);
              return (
                <button
                  key={c.color}
                  disabled={isUsed}
                  onClick={() => setSelectedColor(c.color)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 border-4 transition transform ${isUsed ? 'opacity-20 cursor-not-allowed grayscale' : 'hover:scale-110'} ${selectedColor === c.color ? 'border-white bg-yellow-700 shadow-lg' : 'border-transparent bg-red-950'}`}
                >
                  <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: c.color }} />
                  <span className="text-sm font-bold text-white">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <button 
          onClick={addPlayer}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-2xl font-bold transition shadow-md"
        >
          確認登錄
        </button>
      </div>

      <div className="w-full mt-4">
        <h3 className="text-2xl font-bold text-yellow-500 mb-3 text-center flex items-center justify-center gap-2">
          連線中的玩家 
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {registeredPlayers.length === 0 && <p className="text-red-300 italic opacity-60">正在等待玩家加入...</p>}
          {registeredPlayers.map((p, i) => (
            <div key={i} className="flex items-center gap-3 bg-red-700 px-6 py-3 rounded-2xl border-2 border-yellow-600 shadow-lg transform transition-all hover:scale-105">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-xl font-bold">{p.name} {p.isHost ? '👑' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-full gap-4 mt-4">
        {registeredPlayers.length >= 2 && (
          <button 
            onClick={startGame}
            className="w-full py-6 bg-yellow-600 hover:bg-yellow-500 text-white rounded-2xl text-4xl font-black shadow-2xl transition animate-pulse"
          >
            全體開始遊戲
          </button>
        )}
        <button 
          onClick={goHome}
          className="w-full py-3 bg-red-900/30 text-yellow-600 rounded-xl text-lg font-bold transition hover:bg-red-900/50"
        >
          回首頁
        </button>
      </div>
    </div>
  );
};

export default Lobby;
