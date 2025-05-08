// game.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDq9OSvLB2KJBB-Mg5yTTdng3zJmI5XmXA",
  authDomain: "gomoku-58c73.firebaseapp.com",
  projectId: "gomoku-58c73",
  storageBucket: "gomoku-58c73.appspot.com",
  messagingSenderId: "468039195363",
  appId: "1:468039195363:web:9e1957dd49eb27e1e003d6",
  measurementId: "G-8EB69LG6JQ",
  databaseURL: "https://gomoku-58c73-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const boardRef = ref(db, 'gomoku/board');
const currentTurnRef = ref(db, 'gomoku/currentTurn');
const winnerRef = ref(db, 'gomoku/winner');

const size = 15;
let board = [];
let currentPlayer = Math.random() < 0.5 ? "black" : "white";
let isMyTurn = false;

const statusEl = document.getElementById("status");
const boardEl = document.getElementById("board");
const restartBtn = document.getElementById("restart");

statusEl.textContent = `你是 ${currentPlayer === "black" ? "黑棋" : "白棋"}`;

function renderBoard() {
  boardEl.innerHTML = "";
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      const div = document.createElement("div");
      div.className = "cell";
      if (cell) div.classList.add(cell);
      div.addEventListener("click", () => handleMove(r, c));
      boardEl.appendChild(div);
    });
  });
}

function handleMove(r, c) {
  if (!isMyTurn || board[r][c] || checkWinner(board)) return;
  board[r][c] = currentPlayer;
  set(boardRef, board);
  set(currentTurnRef, currentPlayer === "black" ? "white" : "black");
  const win = checkWinner(board);
  if (win) set(winnerRef, currentPlayer);
}

function checkWinner(bd) {
  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const player = bd[r][c];
      if (!player) continue;
      for (let [dr, dc] of directions) {
        let count = 1;
        for (let i = 1; i < 5; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size || bd[nr][nc] !== player) break;
          count++;
        }
        if (count >= 5) return player;
      }
    }
  }
  return null;
}

// 初始化棋盤資料
onValue(boardRef, (snapshot) => {
  const data = snapshot.val();
  if (Array.isArray(data)) {
    board = data;
  } else {
    board = Array.from({ length: size }, () => Array(size).fill(null));
    set(boardRef, board);
  }
  renderBoard();
});

// 監聽目前輪到誰
onValue(currentTurnRef, (snapshot) => {
  const turn = snapshot.val();
  isMyTurn = (turn === currentPlayer);
  const winner = checkWinner(board);
  if (winner) {
    statusEl.textContent = `${winner === currentPlayer ? "你贏了！" : "你輸了！"}`;
  } else {
    statusEl.textContent = `你是 ${currentPlayer === "black" ? "黑棋" : "白棋"}${isMyTurn ? "，輪到你" : "，等待對手"}`;
  }
});

// 監聽勝利狀態
onValue(winnerRef, (snapshot) => {
  const win = snapshot.val();
  if (win) statusEl.textContent = `${win === currentPlayer ? "你贏了！" : "你輸了！"}`;
});

// 重新開始按鈕
restartBtn.addEventListener("click", () => {
  const emptyBoard = Array.from({ length: size }, () => Array(size).fill(null));
  set(boardRef, emptyBoard);
  set(currentTurnRef, "black");
  set(winnerRef, null);
});
