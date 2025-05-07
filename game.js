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

// Firebase 初始化
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 遊戲初始化
const boardSize = 15;
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

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

// 監聽玩家操作並更新 Firebase
boardEl.addEventListener("click", (event) => {
  const x = event.target.dataset.x;
  const y = event.target.dataset.y;

  if (x && y) {
    // 確認是輪到這個玩家下棋
    const turnRef = ref(database, 'turn');
    onValue(turnRef, (snapshot) => {
      const turn = snapshot.val();

      // 目前輪到哪個玩家，如果是 "black" 才可以下棋
      if (turn === "black") {
        const moveData = {
          x: parseInt(x),
          y: parseInt(y),
          color: "black", // 當輪到黑棋時
        };
        set(ref(database, 'moves/' + Date.now()), moveData);
        set(ref(database, 'turn'), "white"); // 換白棋
      } else if (turn === "white") {
        const moveData = {
          x: parseInt(x),
          y: parseInt(y),
          color: "white", // 當輪到白棋時
        };
        set(ref(database, 'moves/' + Date.now()), moveData);
        set(ref(database, 'turn'), "black"); // 換黑棋
      }
    });
  }
});

// 監聽 Firebase 中的棋步更新
const movesRef = ref(database, 'moves');
onValue(movesRef, (snapshot) => {
  const moves = snapshot.val();
  if (moves) {
    Object.values(moves).forEach((move) => {
      const cell = document.querySelector(`[data-x="${move.x}"][data-y="${move.y}"]`);
      if (cell) {
        cell.classList.add(move.color); // 更新格子顏色
      }
    });
  }
});

// 監聽 Firebase 中的輪流變更
const turnRef = ref(database, 'turn');
onValue(turnRef, (snapshot) => {
  const turn = snapshot.val();
  statusEl.textContent = turn === "black" ? "黑棋回合" : "白棋回合";
});

// 重設遊戲狀態
function resetGame() {
  // 清空 Firebase 中的棋步資料
  set(ref(database, 'moves'), null);
  
  // 重設棋盤顯示
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => {
    cell.classList.remove("black", "white");
  });
  
  // 重設輪到的玩家為黑棋
  set(ref(database, 'turn'), "black");

  statusEl.textContent = "遊戲重新開始！";
}

// 初始化時將輪到的玩家設為黑棋
set(ref(database, 'turn'), "black");
