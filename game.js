import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  get,
  update
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ⚙️ 控制棋盤大小
const BOARD_SIZE = 30;
document.documentElement.style.setProperty('--board-size', BOARD_SIZE);

// 🔐 Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyDq9OSvLB2KJBB-Mg5yTTdng3zJmI5XmXA",
  authDomain: "gomoku-58c73.firebaseapp.com",
  projectId: "gomoku-58c73",
  storageBucket: "gomoku-58c73.appspot.com",
  messagingSenderId: "468039195363",
  appId: "1:468039195363:web:9e1957dd49eb27e1e003d6",
  measurementId: "G-8EB69LG6JQ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app, "https://gomoku-58c73-default-rtdb.firebaseio.com/");
const gameStateRef = ref(database, "gameState");

// 🎮 玩家 ID（存在 localStorage 中，跨頁刷新仍保留）
let playerId = localStorage.getItem("gomoku-player-id");
if (!playerId) {
  playerId = crypto.randomUUID();
  localStorage.setItem("gomoku-player-id", playerId);
}

let currentPlayer = 1;
let board = [];
let gameOver = false;
let assignedPlayer = null;

// 建立空白棋盤
function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

// 寫入狀態
function writeGameState(board, currentPlayer, players, gameOver) {
  set(gameStateRef, { board, currentPlayer, players, gameOver });
}

// 渲染棋盤
function renderBoard(board) {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (board[i][j] === 1) cell.classList.add("black");
      else if (board[i][j] === 2) cell.classList.add("white");

      cell.addEventListener("click", () => handleCellClick(i, j));
      boardDiv.appendChild(cell);
    }
  }
}

// 檢查五子連線
function checkWin(board, x, y, player) {
  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const nx = x + dx * i, ny = y + dy * i;
      if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) break;
      if (board[nx][ny] === player) count++;
      else break;
    }
    for (let i = 1; i < 5; i++) {
      const nx = x - dx * i, ny = y - dy * i;
      if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) break;
      if (board[nx][ny] === player) count++;
      else break;
    }
    if (count >= 5) return true;
  }
  return false;
}

// 處理點擊
function handleCellClick(i, j) {
  if (gameOver) return;
  if (!assignedPlayer || assignedPlayer !== currentPlayer) return;
  if (board[i][j] !== 0) return;

  board[i][j] = currentPlayer;

  const win = checkWin(board, i, j, currentPlayer);
  const nextPlayer = currentPlayer === 1 ? 2 : 1;

  update(gameStateRef, {
    board,
    currentPlayer: win ? currentPlayer : nextPlayer,
    gameOver: win
  });

  if (win) {
    alert(`玩家 ${currentPlayer} 勝利！`);
  }
}

// 監聽 Firebase 資料
onValue(gameStateRef, (snapshot) => {
  const data = snapshot.val();

  if (!data || !data.board || data.board.length !== BOARD_SIZE) {
    const newBoard = createEmptyBoard();
    const players = {
      1: playerId,
      2: null
    };
    writeGameState(newBoard, 1, players, false);
    return;
  }

  board = data.board;
  currentPlayer = data.currentPlayer;
  gameOver = data.gameOver;
  const players = data.players || {};

  // 自動分配玩家編號
  if (players[1] === playerId) assignedPlayer = 1;
  else if (players[2] === playerId) assignedPlayer = 2;
  else if (!players[2]) {
    players[2] = playerId;
    assignedPlayer = 2;
    update(gameStateRef, { players });
  } else {
    assignedPlayer = null;
  }

  renderBoard(board);
  updateStatusText();
});

// 更新玩家狀態顯示
function updateStatusText() {
  const status = document.getElementById("status");
  if (!assignedPlayer) {
    status.textContent = "🔒 觀戰模式中（無法下棋）";
  } else if (gameOver) {
    status.textContent = "🎉 遊戲已結束";
  } else if (assignedPlayer === currentPlayer) {
    status.textContent = `✅ 輪到你下棋（玩家 ${assignedPlayer}）`;
  } else {
    status.textContent = `⏳ 等待對手（你是玩家 ${assignedPlayer}）`;
  }
}

// 重新開始按鈕
document.getElementById("resetBtn").addEventListener("click", () => {
  const newBoard = createEmptyBoard();
  const players = {
    1: playerId,
    2: null
  };
  writeGameState(newBoard, 1, players, false);
});

// 額外：開發者用手動 reset 函數
window.resetBoardSize = () => {
  const emptyBoard = createEmptyBoard();
  set(gameStateRef, {
    board: emptyBoard,
    currentPlayer: 1,
    players: {
      1: playerId,
      2: null
    },
    gameOver: false
  });
};
