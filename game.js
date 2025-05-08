// 初始化 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

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

// ⚠️ 使用正確區域的 Database URL
const database = getDatabase(app, "https://gomoku-58c73-default-rtdb.asia-southeast1.firebasedatabase.app");

// 建立初始 15x15 棋盤
function createEmptyBoard() {
  return Array.from({ length: 15 }, () => Array(15).fill(0));
}

// 寫入資料
function writeGameState(board, currentPlayer) {
  set(ref(database, "gameState"), { board, currentPlayer });
}

// 畫棋盤
function renderBoard(board) {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  for (let i = 0; i < 15; i++) {
    const row = document.createElement("div");
    row.className = "row";

    for (let j = 0; j < 15; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (board[i][j] === 1) cell.classList.add("black");
      else if (board[i][j] === 2) cell.classList.add("white");

      cell.addEventListener("click", () => handleCellClick(i, j));
      row.appendChild(cell);
    }
    boardDiv.appendChild(row);
  }
}

let currentPlayer = 1;
let board = createEmptyBoard();

function handleCellClick(i, j) {
  if (board[i][j] !== 0) return;
  board[i][j] = currentPlayer;
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  writeGameState(board, currentPlayer);
}

// 從 Firebase 同步資料
onValue(ref(database, "gameState"), (snapshot) => {
  const data = snapshot.val();
  if (!data || !Array.isArray(data.board)) {
    console.warn("Game state is invalid: ", data);
    return;
  }
  board = data.board;
  currentPlayer = data.currentPlayer;
  renderBoard(board);
});

// 按鈕重設
document.getElementById("resetBtn").addEventListener("click", () => {
  board = createEmptyBoard();
  currentPlayer = 1;
  writeGameState(board, currentPlayer);
});
