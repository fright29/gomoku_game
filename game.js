import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// === ✅ 棋盤大小，只改這行就好 ===
const BOARD_SIZE = 15;
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

function writeGameState(board, currentPlayer, winner = 0) {
  set(ref(database, "gameState"), { board, currentPlayer, winner });
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
let winner = 0;

function handleCellClick(i, j) {
  if (board[i][j] !== 0 || winner !== 0) return;
  board[i][j] = currentPlayer;

  if (checkWin(i, j, currentPlayer)) {
    winner = currentPlayer;
    alert(`玩家 ${currentPlayer} 勝利！`);
  } else {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }

  writeGameState(board, currentPlayer, winner);
}

// 檢查勝利條件（八方向任五連線）
function checkWin(x, y, player) {
  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    for (let dir = -1; dir <= 1; dir += 2) {
      let nx = x + dx * dir;
      let ny = y + dy * dir;
      while (
        nx >= 0 && ny >= 0 && nx < BOARD_SIZE && ny < BOARD_SIZE &&
        board[nx][ny] === player
      ) {
        count++;
        nx += dx * dir;
        ny += dy * dir;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}

// 從 Firebase 同步
onValue(ref(database, "gameState"), (snapshot) => {
  const data = snapshot.val();
  if (!data) {
    board = createEmptyBoard();
    currentPlayer = 1;
    winner = 0;
    writeGameState(board, currentPlayer, winner);
  } else if (!Array.isArray(data.board)) {
    console.warn("Game state is invalid:", data);
  } else {
    board = data.board;
    currentPlayer = data.currentPlayer;
    winner = data.winner || 0;
    renderBoard(board);
  }
});

// 重設按鈕
document.getElementById("resetBtn").addEventListener("click", () => {
  board = createEmptyBoard();
  currentPlayer = 1;
  winner = 0;
  writeGameState(board, currentPlayer, winner);
});
