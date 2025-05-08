// 導入 Firebase 9 的模組化 SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDq9OSvLB2KJBB-Mg5yTTdng3zJmI5XmXA",
  authDomain: "gomoku-58c73.firebaseapp.com",
  projectId: "gomoku-58c73",
  storageBucket: "gomoku-58c73.firebasestorage.app",
  messagingSenderId: "468039195363",
  appId: "1:468039195363:web:9e1957dd49eb27e1e003d6",
  measurementId: "G-8EB69LG6JQ",
  databaseURL: "https://gomoku-58c73-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const boardRef = ref(db, 'board');
const gameRef = ref(db, 'game');

let currentPlayer = 'black'; // 黑方先
let gameState = Array(15).fill(null).map(() => Array(15).fill(null)); // 15x15棋盤

// 創建棋盤
const createBoard = () => {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleCellClick);
      boardElement.appendChild(cell);
    }
  }
};

// 處理棋格點擊事件
const handleCellClick = (e) => {
  const row = e.target.dataset.row;
  const col = e.target.dataset.col;

  // 如果該位置已經有棋子，則不進行操作
  if (gameState[row][col]) return;

  // 更新棋盤狀態
  gameState[row][col] = currentPlayer;
  e.target.classList.add(currentPlayer);

  // 儲存到 Firebase
  set(boardRef, gameState);
  
  // 切換玩家
  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
  update(gameRef, { currentPlayer });
};

// 重新開始遊戲
const resetGame = () => {
  gameState = Array(15).fill(null).map(() => Array(15).fill(null));
  set(boardRef, gameState);
  createBoard();
  currentPlayer = 'black'; // 黑方先
  update(gameRef, { currentPlayer });
};

// 監聽 Firebase 上的遊戲狀態
onValue(gameRef, (snapshot) => {
  const gameData = snapshot.val();
  if (gameData && gameData.currentPlayer) {
    currentPlayer = gameData.currentPlayer;
  }
});

// 監聽 Firebase 上的棋盤狀態
onValue(boardRef, (snapshot) => {
  const newGameState = snapshot.val();
  if (newGameState) {
    gameState = newGameState;
    renderBoard();
  }
});

// 更新棋盤顯示
const renderBoard = () => {
  const boardElement = document.getElementById('board');
  const cells = boardElement.getElementsByClassName('cell');
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      const cell = cells[row * 15 + col];
      cell.classList.remove('black', 'white');
      if (gameState[row][col]) {
        cell.classList.add(gameState[row][col]);
      }
    }
  }
};

// 監聽重新開始按鈕
document.getElementById('resetButton').addEventListener('click', resetGame);

// 初始化棋盤
createBoard();
