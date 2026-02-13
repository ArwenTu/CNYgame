
import { TriviaQuestion, TaskType } from './types';

export const HORSE_COLORS = [
  { name: '金', color: '#FFD700', text: 'text-yellow-400' },
  { name: '銀', color: '#C0C0C0', text: 'text-gray-300' },
  { name: '藍', color: '#1E90FF', text: 'text-blue-500' },
  { name: '粉', color: '#FF69B4', text: 'text-pink-400' },
  { name: '綠', color: '#32CD32', text: 'text-green-500' },
  { name: '橘', color: '#FFA500', text: 'text-orange-500' },
  { name: '紫', color: '#8A2BE2', text: 'text-purple-500' }
];

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  { question: "2026 年是什麼生肖年？", options: ["龍", "蛇", "馬", "羊"], answer: "馬" },
  { question: "紅包的起源朝代為何？", options: ["清朝", "漢朝", "明朝", "唐朝"], answer: "漢朝" },
  { question: "大樂透最多可以選到幾號？", options: ["50", "39", "49", "59"], answer: "49" },
  { question: "大樂透一注可以選幾個號碼？", options: ["6", "5", "8", "7"], answer: "6" },
  { question: "高鐵沒有哪一站？", options: ["左營", "新竹", "雲林", "屏東"], answer: "屏東" },
  { question: "12生肖中排第8個是哪個？", options: ["馬", "龍", "羊", "兔"], answer: "羊" },
  { question: "2026年除夕是哪一天？", options: ["2月14日", "2月15日", "2月16日", "2月17日"], answer: "2月15日" },
  { question: "紅包中的紙鈔正確擺放方式為？", options: ["人頭朝底部", "人頭朝上", "對折再放入", "方向不用統一"], answer: "人頭朝底部" }
];

export const FORTUNE_STICKS = [
  { text: "恭喜領到大紅包 +200", score: 200 },
  { text: "買年貨支出 -100", score: -100 },
  { text: "恭喜領到小紅包 +100", score: 100 },
  { text: "財神送財 +300", score: 300 },
  { text: "買年節點心 -100", score: -100 },
  { text: "刮刮樂中獎 +200", score: 200 },
  { text: "大樂透中獎 +300", score: 300 }
];

// Total 36 squares:
// 1 START
// 8 A (Mutual Choice)
// 8 B (Fortune)
// 12 C (Idiom)
// 4 D (Trivia)
// 3 BOMB (Backward 2 steps)
export const TASK_DISTRIBUTION: TaskType[] = [
  'START', 'A', 'C', 'B', 'BOMB', 'C', 'D', 'A', 'C',
  'B', 'C', 'A', 'BOMB', 'C', 'B', 'D', 'C', 'A',
  'B', 'C', 'A', 'BOMB', 'C', 'B', 'D', 'A', 'C',
  'B', 'C', 'A', 'B', 'D', 'C', 'B', 'A', 'C'
];
