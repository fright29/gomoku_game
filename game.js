// game.js

// 引入 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDq9OSvLB2KJBB-Mg5yTTdng3zJmI5XmXA",
  authDomain: "gomoku-58c73.firebaseapp.com",
  projectId: "gomoku-58c73",
  storageBucket: "gomoku-58c73.firebasestorage.app",
  messagingSenderId: "468039195363",
  appId: "1:468039195363:web:9e1957dd49eb27e1e003d6",
  measurementId: "G-8EB69LG6JQ"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 遊戲邏輯函式，處理 Firebase 資料操作和同步
export function setupGame() {
  const boardSize = 15;
  const boardEl = document.getElementById("board");

  // 建立棋盤格
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      boardEl.appendChild(cell);
    }
  }

  // 監聽玩家操作並更新資料庫
  boardEl.addEventListener("click", (event) => {
    const x = event.target.dataset.x;
    const y = event.target.dataset.y;

    if (x && y) {
      const moveData = {
        x: parseInt(x),
        y: parseInt(y),
        color: "black" // 這裡是示範黑棋，實際遊戲可以更改
      };

      // 儲存棋步到 Firebase
      set(ref(database, 'moves/' + Date.now()), moveData);
    }
  });

  // 監聽 Firebase 中的棋步更新
  const movesRef = ref(database, 'moves');
  onValue(movesRef, (snapshot) => {
    const moves = snapshot.val();
    if (moves) {
      // 更新棋盤，顯示對應顏色的棋子
      Object.values(moves).forEach(move => {
        const cell = document.querySelector(`[data-x="${move.x}"][data-y="${move.y}"]`);
        if (cell) {
          cell.classList.add(move.color); // 添加黑棋或白棋的 CSS 類別
        }
      });
    }
  });
}
