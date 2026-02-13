
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, GameState, Player, GameSquare, TaskType } from './types';
import { TASK_DISTRIBUTION, HORSE_COLORS, TRIVIA_QUESTIONS } from './constants';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import TaskModal from './components/TaskModal';
import Leaderboard from './components/Leaderboard';

const INITIAL_BOARD: GameSquare[] = TASK_DISTRIBUTION.map((type, i) => ({
  id: i,
  type,
  title: type === 'START' ? '起點' : type === 'BOMB' ? '炸彈！' : `${type} 類任務`
}));

const Fireworks = () => (
  <div className="fixed inset-0 pointer-events-none z-[100]">
    <div className="firework" style={{ left: '15%', top: '30%', color: '#ffd700' }}></div>
    <div className="firework" style={{ left: '85%', top: '20%', animationDelay: '-0.4s', color: '#ff4d4d' }}></div>
    <div className="firework" style={{ left: '50%', top: '40%', animationDelay: '-1.2s', color: '#4dff4d' }}></div>
    <div className="firework" style={{ left: '30%', top: '70%', animationDelay: '-0.8s', color: '#4d4dff' }}></div>
    <div className="firework" style={{ left: '70%', top: '80%', animationDelay: '-1.6s', color: '#ffffff' }}></div>
  </div>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    roomCode: '',
    status: GameStatus.LOBBY,
    players: [],
    currentPlayerIndex: 0,
    board: INITIAL_BOARD,
    activeTask: null,
    winner: null,
    usedTriviaIndices: [],
    usedIdioms: []
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [bombMessage, setBombMessage] = useState<string | null>(null);

  const handleMove = async (steps: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const playerIndex = gameState.currentPlayerIndex;
    let currentPos = gameState.players[playerIndex].position;
    
    // Step 1: Forward step-by-step move
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      currentPos = (currentPos + 1);
      
      setGameState(prev => {
        const players = [...prev.players];
        const actualPos = currentPos >= 36 ? 0 : currentPos;
        players[playerIndex] = { ...players[playerIndex], position: actualPos };
        return { ...prev, players };
      });

      if (currentPos >= 36) break;
    }

    // Step 2: Stop and check destination
    const finalLandingPos = currentPos >= 36 ? 0 : currentPos;
    const landingSquare = gameState.board[finalLandingPos];

    // Wait at destination before showing task or moving back
    await new Promise(resolve => setTimeout(resolve, 800));

    if (landingSquare.type === 'BOMB') {
      // Step 3: Handle Bomb backward move
      setBombMessage("遇到炸彈了！倒退 2 步！");
      await new Promise(resolve => setTimeout(resolve, 1200));
      setBombMessage(null);

      for (let i = 0; i < 2; i++) {
        await new Promise(resolve => setTimeout(resolve, 350));
        currentPos = currentPos - 1;
        // Wrap around backward if needed
        const backwardPos = currentPos < 0 ? 36 + currentPos : currentPos;
        
        setGameState(prev => {
          const players = [...prev.players];
          players[playerIndex] = { ...players[playerIndex], position: backwardPos };
          return { ...prev, players };
        });
      }
      
      // Stop again at the new destination after bomb
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Final check for the square we ended up on
    setGameState(prev => {
      const players = [...prev.players];
      const player = players[playerIndex];
      const finalPos = player.position;
      
      let isGameOver = false;
      let winner = prev.winner;

      // Note: Win condition is landing on or passing START forward. 
      // Bomb movement backward doesn't trigger a win normally.
      if (currentPos >= 36) {
        isGameOver = true;
        winner = player;
      }

      const square = prev.board[finalPos];
      // Trigger task if it's not start, not game over, and we landed on a task type square
      const shouldTriggerTask = !isGameOver && (['A', 'B', 'C', 'D'].includes(square.type));

      return {
        ...prev,
        status: isGameOver ? GameStatus.GAME_OVER : (shouldTriggerTask ? GameStatus.TASK_MODAL : prev.status),
        activeTask: isGameOver ? null : (shouldTriggerTask ? { type: square.type as TaskType } : null),
        winner
      };
    });

    setIsAnimating(false);
    
    // If no task triggered and not game over, move to next turn
    setGameState(prev => {
      if (prev.status === GameStatus.PLAYING) {
        return {
          ...prev,
          currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
        };
      }
      return prev;
    });
  };

  const handleTaskComplete = (scoreChange: number, completedIdiom?: string) => {
    setGameState(prev => {
      const players = [...prev.players];
      players[prev.currentPlayerIndex].score += scoreChange;
      const updatedIdioms = completedIdiom ? [...prev.usedIdioms, completedIdiom] : prev.usedIdioms;
      return {
        ...prev,
        players,
        status: GameStatus.PLAYING,
        activeTask: null,
        usedIdioms: updatedIdioms,
        currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
      };
    });
  };

  return (
    <div className="min-h-screen text-yellow-100 flex flex-col items-center p-4">
      {bombMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-red-900 text-4xl font-black px-12 py-6 rounded-3xl z-[150] shadow-2xl border-8 border-red-800 animate-pulse">
          {bombMessage}
        </div>
      )}
      
      {gameState.status === GameStatus.LOBBY || 
       gameState.status === GameStatus.JOIN_ROOM || 
       gameState.status === GameStatus.CREATE_ROOM || 
       gameState.status === GameStatus.CHARACTER_SELECT ? (
        <Lobby 
          gameState={gameState} 
          setGameState={setGameState} 
        />
      ) : (
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-9 flex flex-col items-center order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl font-serif text-yellow-500 mb-4 drop-shadow-2xl">
              新春家庭大富翁
            </h1>
            
            <GameBoard 
              gameState={gameState} 
              onMove={handleMove}
              isAnimating={isAnimating}
            />

            {gameState.status === GameStatus.GAME_OVER && (
              <>
                <Fireworks />
                <div className="mt-8 bg-red-900/90 p-8 rounded-[3rem] text-center shadow-[0_0_50px_rgba(234,179,8,0.5)] border-8 border-yellow-500 max-w-md relative z-[110] animate-bounce">
                  <h2 className="text-5xl font-black text-yellow-400 mb-4 drop-shadow-lg font-serif">恭喜發財！</h2>
                  <p className="text-3xl text-white mb-6 font-bold">
                    大贏家是：<br/>
                    <span className="text-4xl text-yellow-300">{gameState.winner?.name}</span>
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-12 py-4 bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-red-950 rounded-full text-2xl font-black transition-all shadow-[0_8px_0_#92400e] active:translate-y-2 active:shadow-none"
                  >
                    重新開始遊戲
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <Leaderboard players={gameState.players} currentPlayerIndex={gameState.currentPlayerIndex} />
          </div>
        </div>
      )}

      {gameState.activeTask && (
        <TaskModal 
          task={gameState.activeTask} 
          gameState={gameState}
          onComplete={handleTaskComplete}
          onClose={() => setGameState(prev => ({ 
            ...prev, 
            status: GameStatus.PLAYING, 
            activeTask: null,
            currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
          }))}
        />
      )}
    </div>
  );
};

export default App;
