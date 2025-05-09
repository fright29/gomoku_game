import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  runTransaction,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ⚙️ 棋盤大小
const BOARD_SIZE = 30;
document.documentElement.style.setProperty('--board-size', BOARD_SIZE);

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

function writeGameState(board, currentPlayer, players) {
  set(gameStateRef, { board, currentPlayer, players });
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

let currentPlayer = 1;
let board = createEmptyBoard();
let assignedPlayer = null;
let gameEnded = false;
let players = {};

// 產生唯一 playerId
let playerId = localStorage.getItem("playerId");
if (!playerId) {
  playerId = crypto.randomUUID();
  localStorage.setItem("playerId", playerId);
}

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

function handleCellClick(i, j) {
  if (gameEnded || board[i][j] !== 0 || assignedPlayer !== currentPlayer) return;

  board[i][j] = currentPlayer;
  if (checkWin(board, i, j, currentPlayer)) {
    alert(`玩家 ${currentPlayer} 勝利！`);
    gameEnded = true;
    writeGameState(board, currentPlayer, players);
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  writeGameState(board, currentPlayer, players);
}

// 🔄 嘗試指派玩家位置（新進或遞補）
function tryAssignPlayer(players) {
  if (assignedPlayer) return;

  runTransaction(gameStateRef, (gameState) => {
    if (!gameState) return gameState;

    const currentPlayers = gameState.players || {};

    if (currentPlayers[1] === playerId || currentPlayers[2] === playerId) {
      // 已有位置
      return gameState;
    }

    if (!currentPlayers[1]) {
      currentPlayers[1] = playerId;
      assignedPlayer = 1;
    } else if (!currentPlayers[2]) {
      currentPlayers[2] = playerId;
      assignedPlayer = 2;
    }

    gameState.players = currentPlayers;
    return gameState;
  }).then(() => {
    if (assignedPlayer) {
      const playerSlotRef = ref(database, `gameState/players/${assignedPlayer}`);
      onDisconnect(playerSlotRef).remove();
    }
  });
}

// 🔁 Firebase 監聽
onValue(gameStateRef, (snapshot) => {
  const data = snapshot.val();
  if (!data || !Array.isArray(data.board) || data.board.length !== BOARD_SIZE) {
    board = createEmptyBoard();
    currentPlayer = 1;
    players = {};
    writeGameState(board, currentPlayer, players);
    return;
  }

  board = data.board;
  currentPlayer = data.currentPlayer;
  players = data.players || {};

  // 若未分配，嘗試分配或遞補
  if (!assignedPlayer) {
    if (players[1] === playerId) assignedPlayer = 1;
    else if (players[2] === playerId) assignedPlayer = 2;
    else tryAssignPlayer(players);
  }

  renderBoard(board);
  updateStatusText();
});

function updateStatusText() {
  const statusDiv = document.getElementById("status");
  if (assignedPlayer === 1 || assignedPlayer === 2) {
    statusDiv.innerText = currentPlayer === assignedPlayer
      ? `你是玩家 ${assignedPlayer}，輪到你下棋`
      : `你是玩家 ${assignedPlayer}，等待對手...`;
  } else {
    statusDiv.innerText = "觀戰模式";
  }
}

document.getElementById("resetBtn").addEventListener("click", () => {
  board = createEmptyBoard();
  currentPlayer = 1;
  gameEnded = false;
  players = {};
  writeGameState(board, currentPlayer, players);
});

// ✅ 手動清空棋盤
window.resetBoardSize = () => {
  const emptyBoard = createEmptyBoard();
  set(gameStateRef, {
    board: emptyBoard,
    currentPlayer: 1,
    players: {}
  });
};
