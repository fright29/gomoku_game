import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  runTransaction,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ⚙️ 改這裡控制棋盤大小
const BOARD_SIZE = 30;
document.documentElement.style.setProperty('--board-size', BOARD_SIZE);

// Firebase 初始化
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

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function writeGameState(board, currentPlayer, players, winner = null) {
  set(gameStateRef, { board, currentPlayer, players, winner });
}

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

// 狀態變數
let currentPlayer = 1;
let board = createEmptyBoard();
let assignedPlayer = null;
let gameEnded = false;
let players = {};
let lastWinner = null;

// 玩家唯一 ID
let playerId = localStorage.getItem("playerId");
if (!playerId) {
  playerId = crypto.randomUUID();
  localStorage.setItem("playerId", playerId);
}

// 勝利判斷
function checkWin(board, x, y, player) {
  const directions = [
    [1, 0],   // →
    [0, 1],   // ↓
    [1, 1],   // ↘
    [1, -1]   // ↗
  ];

  for (const [dx, dy] of directions) {
    let count = 1;

    for (let i = 1; i < 5; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) break;
      if (board[nx][ny] === player) count++;
      else break;
    }

    for (let i = 1; i < 5; i++) {
      const nx = x - dx * i;
      const ny = y - dy * i;
      if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) break;
      if (board[nx][ny] === player) count++;
      else break;
    }

    if (count >= 5) return true;
  }

  return false;
}

// 點擊處理
function handleCellClick(i, j) {
  if (gameEnded || board[i][j] !== 0 || assignedPlayer !== currentPlayer) return;

  board[i][j] = currentPlayer;

  if (checkWin(board, i, j, currentPlayer)) {
    gameEnded = true;
    writeGameState(board, currentPlayer, players, currentPlayer);

    if (assignedPlayer === currentPlayer) {
      alert("你獲勝了！");
    } else {
      alert("你輸了！");
    }
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  writeGameState(board, currentPlayer, players, null);
}

// Firebase 監聽
onValue(gameStateRef, (snapshot) => {
  const data = snapshot.val();

  if (!data || !Array.isArray(data.board) || data.board.length !== BOARD_SIZE) {
    board = createEmptyBoard();
    currentPlayer = 1;
    players = {};
    lastWinner = null;
    writeGameState(board, currentPlayer, players, null);
    return;
  }

  board = data.board;
  currentPlayer = data.currentPlayer;
  players = data.players || {};
  const winner = data.winner || null;

  // 玩家身份註冊
  if (!assignedPlayer) {
    runTransaction(gameStateRef, (gameState) => {
      if (!gameState) return gameState;
      const currentPlayers = gameState.players || {};

      if (currentPlayers[1] === playerId || currentPlayers[2] === playerId) {
        return gameState;
      }

      if (!currentPlayers[1]) {
        currentPlayers[1] = playerId;
        assignedPlayer = 1;
      } else if (!currentPlayers[2]) {
        currentPlayers[2] = playerId;
        assignedPlayer = 2;
      } else {
        assignedPlayer = null;
      }

      gameState.players = currentPlayers;
      return gameState;
    }).then(() => {
      if (assignedPlayer !== null) {
        const playerSlotRef = ref(database, `gameState/players/${assignedPlayer}`);
        onDisconnect(playerSlotRef).remove();
      }
    });
  }

  // 如果已經指派過
  if (players[1] === playerId) assignedPlayer = 1;
  else if (players[2] === playerId) assignedPlayer = 2;

  renderBoard(board);
  updateStatusText();

  // 顯示勝負通知
  if (winner && !gameEnded && winner !== lastWinner) {
    gameEnded = true;
    lastWinner = winner;
    if (assignedPlayer === winner) {
      alert("你獲勝了！");
    } else if (assignedPlayer === 1 || assignedPlayer === 2) {
      alert("你輸了！");
    } else {
      alert(`玩家 ${winner} 獲勝！`);
    }
  }
});

// 狀態更新文字
function updateStatusText() {
  const statusDiv = document.getElementById("status");

  const bothPlayersReady = players[1] && players[2];

  if (assignedPlayer === 1 || assignedPlayer === 2) {
    if (!bothPlayersReady) {
      statusDiv.innerText = `你是玩家 ${assignedPlayer}，等待另一位玩家加入...`;
    } else {
      statusDiv.innerText = currentPlayer === assignedPlayer
        ? `你是玩家 ${assignedPlayer}，輪到你下棋`
        : `你是玩家 ${assignedPlayer}，等待對手...`;
    }
  } else {
    statusDiv.innerText = "觀戰模式";
  }
}

// 重置按鈕
document.getElementById("resetBtn").addEventListener("click", () => {
  board = createEmptyBoard();
  currentPlayer = 1;
  gameEnded = false;
  players = {};
  lastWinner = null;
  writeGameState(board, currentPlayer, players, null);
});

// 提供手動重設函數（例如透過 console 呼叫）
window.resetBoardSize = () => {
  const emptyBoard = createEmptyBoard();
  set(gameStateRef, {
    board: emptyBoard,
    currentPlayer: 1,
    players: {},
    winner: null
  });
};
