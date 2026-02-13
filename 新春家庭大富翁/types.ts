
export type TaskType = 'A' | 'B' | 'C' | 'D' | 'START' | 'BOMB';

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  position: number;
  isHost: boolean;
}

export interface GameSquare {
  id: number;
  type: TaskType;
  title: string;
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  answer: string;
}

export enum GameStatus {
  LOBBY = 'LOBBY',
  JOIN_ROOM = 'JOIN_ROOM',
  CREATE_ROOM = 'CREATE_ROOM',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  PLAYING = 'PLAYING',
  TASK_MODAL = 'TASK_MODAL',
  GAME_OVER = 'GAME_OVER'
}

export interface GameState {
  roomCode: string;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  board: GameSquare[];
  activeTask: {
    type: TaskType;
    data?: any;
  } | null;
  winner: Player | null;
  usedTriviaIndices: number[];
  usedIdioms: string[];
}
