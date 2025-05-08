import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ 初始化 Firebase
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
const db = getDatabase(app);
const boardRef = ref(db, "gomoku/board");
const turnRef = ref(db, "gomoku/turn");
const winnerRef = ref(db, "gomoku/winner");

const size = 15;
let board = Array.from({ length: size }, () => Array(size).fill(null));
let myColor = null;

const statusEl = document.getElementById("status");
const boardEl = document.getElementById("board");
const restartBtn = document.getElementById("restart");

// ✅ 建立棋盤
function renderBoard() {
  boardEl.innerHTML = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (board[y][x]) cell.classList.add(board[y][x]);
      cell.dataset.x = x;
      cell.dataset.y = y;
      boardEl.appendChild(cell);
    }
  }
}

function checkWinner(x, y, color) {
  const directions = [
    [1, 0], [0, 1],
    [1, 1], [1, -1]
  ];

  for (let [dx, dy] of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      if (board[y + dy * i]?.[x + dx * i] === color) count++;
      else break;
    }
    for (let i = 1; i < 5; i++) {
      if (board[y - dy * i]?.[x - dx * i] === color) count++;
      else break;
    }
    if (count >= 5) return true;
  }
  return false;
}

boardEl.addEventListener("click", (e) => {
  if (!myColor) return;
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const x = +cell.dataset.x;
  const y = +cell.dataset.y;
  if (board[y][x]) return;

  // 判斷輪到誰
  onValue(turnRef, (snapshot) => {
    const turn = snapshot.val();
    if (turn !== myColor) return;

    board[y][x] = myColor;
    set(boardRef, board);
    const win = checkWinner(x, y, myColor);
    if (win) set(winnerRef, myColor);
    else set(turnRef, myColor === "black" ? "white" : "black");
  }, { onlyOnce: true });
});

restartBtn.addEventListener("click", () => {
  board = Array.from({ length: size }, () => Array(size).fill(null));
  set(boardRef, board);
  set(turnRef, "black");
  set(winnerRef, null);
});

// ✅ Firebase 監聽
onValue(boardRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    board = data;
    renderBoard();
  }
});

onValue(turnRef, (snapshot) => {
  const turn = snapshot.val();
  if (!myColor) {
    myColor = turn;
    statusEl.textContent = `你是 ${myColor === "black" ? "黑棋" : "白棋"}`;
  } else {
    statusEl.textContent = `輪到 ${turn === myColor ? "你" : "對手"} 下`;
  }
});

onValue(winnerRef, (snapshot) => {
  const winner = snapshot.val();
  if (winner) {
    statusEl.textContent = `遊戲結束！${winner === myColor ? "你贏了！" : "你輸了！"}`;
  }
});
