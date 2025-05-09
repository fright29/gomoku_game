// 初始化 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ⚙️ 改這裡控制棋盤大小
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

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function writeGameState(board, currentPlayer) {
  set(ref(database, "gameState"), { board, currentPlayer });
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

function handleCellClick(i, j) {
  if (board[i][j] !== 0) return;
  board[i][j] = currentPlayer;

  if (checkWin(board, i, j, currentPlayer)) {
    alert(`玩家 ${currentPlayer} 勝利！`);
    board = createEmptyBoard();
    currentPlayer = 1;
    writeGameState(board, currentPlayer);
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  writeGameState(board, currentPlayer);
}

onValue(ref(database, "gameState"), (snapshot) => {
  const data = snapshot.val();
  if (!data || !Array.isArray(data.board) || data.board.length !== BOARD_SIZE) {
    console.warn("初始化或不符，重建棋盤");
    board = createEmptyBoard();
    currentPlayer = 1;
    writeGameState(board, currentPlayer);
  } else {
    board = data.board;
    currentPlayer = data.currentPlayer;
    renderBoard(board);
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  board = createEmptyBoard();
  currentPlayer = 1;
  writeGameState(board, currentPlayer);
});

// ✅ 開發者工具用：手動重設 Firebase 裡的棋盤尺寸
window.resetBoardSize = () => {
  const emptyBoard = createEmptyBoard();
  set(ref(database, "gameState"), {
    board: emptyBoard,
    currentPlayer: 1
  });
};
