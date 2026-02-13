
import React, { useState, useEffect } from 'react';
import { TaskType, GameState, Player, TriviaQuestion } from '../types';
import { TRIVIA_QUESTIONS, FORTUNE_STICKS } from '../constants';
import { getRandomIdiom } from '../geminiService';

interface TaskModalProps {
  task: { type: TaskType; data?: any };
  gameState: GameState;
  onComplete: (scoreChange: number, completedIdiom?: string) => void;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, gameState, onComplete }) => {
  const [step, setStep] = useState<'intro' | 'play' | 'result'>('intro');
  const [resultMsg, setResultMsg] = useState('');
  const [scoreDelta, setScoreDelta] = useState(0);

  // Task A States
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  
  // Task B States
  const [fortuneStick, setFortuneStick] = useState<any>(null);

  // Task C States
  const [idiom, setIdiom] = useState({ word: '', meaning: '' });
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);

  // Task D States
  const [trivia, setTrivia] = useState<TriviaQuestion | null>(null);
  const [triviaSelected, setTriviaSelected] = useState<string | null>(null);

  useEffect(() => {
    if (task.type === 'C') {
      getRandomIdiom(gameState.usedIdioms).then(res => {
        setIdiom({ word: res.idiom, meaning: res.meaning });
        setScrambled(res.idiom.split('').sort(() => Math.random() - 0.5));
      });
    } else if (task.type === 'D') {
      const q = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
      setTrivia(q);
    }
  }, [task.type, gameState.usedIdioms]);

  const handleComplete = () => {
    const completedIdiom = task.type === 'C' ? idiom.word : undefined;
    onComplete(scoreDelta, completedIdiom);
  };

  // --- Renderers ---

  const renderTaskA = () => (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-3xl font-bold text-yellow-400">默契四選一</h2>
      <p className="text-2xl text-center">請從以下 1-9 的數字中點擊一個數字：</p>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button 
            key={n}
            onClick={() => setSelectedNum(n)}
            className={`w-20 h-20 text-4xl font-bold rounded-2xl transition ${selectedNum === n ? 'bg-yellow-500 text-red-900 scale-110 shadow-xl' : 'bg-red-800 text-yellow-100 hover:bg-red-700'}`}
          >
            {n}
          </button>
        ))}
      </div>
      <button 
        disabled={selectedNum === null}
        onClick={() => {
          const otherChoices = gameState.players.filter(p => p.id !== gameState.players[gameState.currentPlayerIndex].id).map(() => Math.floor(Math.random() * 9) + 1);
          const matches = otherChoices.filter(c => c === selectedNum).length;
          const points = matches * 100;
          setScoreDelta(points);
          setResultMsg(`您選擇了 ${selectedNum}，其他玩家中有 ${matches} 位與您相同！獲得 ${points} 分。`);
          setStep('result');
        }}
        className="mt-4 px-10 py-4 bg-yellow-600 rounded-full text-2xl font-bold disabled:opacity-50"
      >
        確認選擇
      </button>
    </div>
  );

  const renderTaskB = () => (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-3xl font-bold text-yellow-400">紅包運勢</h2>
      {step === 'intro' ? (
        <div className="text-center">
          <div className="w-48 h-64 bg-red-700 border-4 border-yellow-500 rounded-t-full relative mb-8 mx-auto flex items-end justify-center overflow-hidden">
             <div className="w-full h-1/2 bg-yellow-600 opacity-20 absolute top-0" />
             <div className="w-8 h-40 bg-yellow-700 rounded-full animate-bounce mb-4 border-2 border-yellow-400" />
          </div>
          <button 
            onClick={() => {
              const stick = FORTUNE_STICKS[Math.floor(Math.random() * FORTUNE_STICKS.length)];
              setFortuneStick(stick);
              setScoreDelta(stick.score);
              setStep('result');
            }}
            className="px-10 py-4 bg-yellow-600 rounded-full text-2xl font-bold shadow-xl"
          >
            抽一支籤
          </button>
        </div>
      ) : null}
    </div>
  );

  const renderTaskC = () => (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-3xl font-bold text-yellow-400">成語大挑戰</h2>
      <p className="text-xl text-yellow-200">解釋：{idiom.meaning}</p>
      
      <div className="flex gap-4 mb-4 min-h-[80px] w-full justify-center border-b-2 border-yellow-800 pb-4">
        {userInput.map((char, i) => (
          <button 
            key={i}
            onClick={() => {
              setScrambled([...scrambled, char]);
              setUserInput(userInput.filter((_, idx) => idx !== i));
            }}
            className="w-16 h-16 bg-yellow-500 text-red-900 text-3xl font-bold rounded-xl flex items-center justify-center shadow-lg"
          >
            {char}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        {scrambled.map((char, i) => (
          <button 
            key={i}
            onClick={() => {
              if (userInput.length < 4) {
                setUserInput([...userInput, char]);
                setScrambled(scrambled.filter((_, idx) => idx !== i));
              }
            }}
            className="w-16 h-16 bg-red-800 text-yellow-100 text-3xl font-bold rounded-xl flex items-center justify-center border-2 border-yellow-600 hover:bg-red-700 transition"
          >
            {char}
          </button>
        ))}
      </div>

      <button 
        disabled={userInput.length < 4}
        onClick={() => {
          const isCorrect = userInput.join('') === idiom.word;
          setScoreDelta(isCorrect ? 100 : 0);
          setResultMsg(isCorrect ? "答對了！恭喜獲得 100 分！" : `可惜了，正確答案是「${idiom.word}」。`);
          setStep('result');
        }}
        className="mt-6 px-10 py-4 bg-yellow-600 rounded-full text-2xl font-bold disabled:opacity-50"
      >
        提交答案
      </button>
    </div>
  );

  const renderTaskD = () => (
    <div className="flex flex-col items-center gap-6 w-full">
      <h2 className="text-3xl font-bold text-yellow-400">智慧四選一</h2>
      {trivia && (
        <>
          <p className="text-3xl text-center font-bold mb-4">{trivia.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4">
            {trivia.options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => setTriviaSelected(opt)}
                className={`p-6 text-2xl font-bold rounded-2xl border-4 transition ${triviaSelected === opt ? 'bg-yellow-500 border-white text-red-900' : 'bg-red-800 border-yellow-600 text-yellow-100'}`}
              >
                ({String.fromCharCode(65+i)}) {opt}
              </button>
            ))}
          </div>
          <button 
            disabled={!triviaSelected}
            onClick={() => {
              const isCorrect = triviaSelected === trivia.answer;
              setScoreDelta(isCorrect ? 100 : 0);
              setResultMsg(isCorrect ? "太聰明了！獲得 100 分。" : `哎呀，正確答案是「${trivia.answer}」。`);
              setStep('result');
            }}
            className="mt-6 px-10 py-4 bg-yellow-600 rounded-full text-2xl font-bold disabled:opacity-50"
          >
            確認答案
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-red-900 border-8 border-yellow-600 rounded-[3rem] p-8 md:p-12 shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col items-center">
        
        {step === 'result' ? (
          <div className="flex flex-col items-center text-center gap-8 py-10">
            <h3 className="text-5xl font-serif text-yellow-500 mb-4 animate-bounce">結果揭曉</h3>
            {task.type === 'B' && fortuneStick && (
              <div className="text-4xl text-white font-bold mb-4 bg-red-700 px-8 py-4 rounded-xl border-4 border-yellow-400">
                {fortuneStick.text}
              </div>
            )}
            <p className="text-3xl leading-relaxed">{resultMsg}</p>
            <button 
              onClick={handleComplete}
              className="mt-8 px-16 py-5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-full text-3xl font-bold shadow-2xl transition"
            >
              繼續遊戲
            </button>
          </div>
        ) : (
          <>
            {task.type === 'A' && renderTaskA()}
            {task.type === 'B' && renderTaskB()}
            {task.type === 'C' && renderTaskC()}
            {task.type === 'D' && renderTaskD()}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskModal;
