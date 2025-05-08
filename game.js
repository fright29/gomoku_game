// 初始化 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// 設置棋盤大小為 19 (可以改為其他數字)
const BOARD_SIZE = 19;

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
const database = getDatabase(app, "https://gomoku-58c73-default-rtdb.firebaseio.com/");

// 建立初始棋盤，根據 BOARD_SIZE 來設置棋盤大小
function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

// 寫入資料
function writeGameState(board, currentPlayer) {
  set(ref(database, "gameState"), { board, currentPlayer });
}

// 畫棋盤
function renderBoard(board) {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  for (let i = 0; i < BOARD_SIZE; i++) {
    const row = document.createElement("div");
    row.className = "row";

    for (let j = 0; j < BOARD_SIZE; j++) {
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

// 判斷勝利條件
function checkWin() {
  // 方向：水平、垂直、對角線
  const directions = [
    { x: 0, y: 1 },  // 水平
    { x: 1, y: 0 },  // 垂直
    { x: 1, y: 1 },  // 斜對角（左上到右下）
    { x: 1, y: -1 }, // 斜對角（右上到左下）
  ];

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const player = board[i][j];
      if (player === 0) continue;  // 如果該位置是空的，跳過

      // 檢查四個方向
      for (const { x, y } of directions) {
        let count = 1;

        // 往正方向檢查
        for (let k = 1; k < 5; k++) {
          const ni = i + x * k;
          const nj = j + y * k;
          if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj] === player) {
            count++;
          } else {
            break;
          }
        }

        // 往反方向檢查
        for (let k = 1; k < 5; k++) {
          const ni = i - x * k;
          const nj = j - y * k;
          if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj] === player) {
            count++;
          } else {
            break;
          }
        }

        // 如果連成五顆，則玩家獲勝
        if (count >= 5) {
          return player;
        }
      }
    }
  }
  return 0;  // 沒有獲勝者
}

// 處理棋盤格子點擊
function handleCellClick(i, j) {
  if (board[i][j] !== 0) return;
  board[i][j] = currentPlayer;
  const winner = checkWin();

  if (winner) {
    alert(winner === 1 ? "黑方獲勝！" : "白方獲勝！");
  } else {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }

  writeGameState(board, currentPlayer);
}

// 從 Firebase 同步資料
onValue(ref(database, "gameState"), (snapshot) => {
  const data = snapshot.val();
  
  // 如果資料為 null，初始化資料
  if (!data) {
    console.log("Game state is null, initializing...");
    board = createEmptyBoard();
    currentPlayer = 1;
    writeGameState(board, currentPlayer);
  } else if (!Array.isArray(data.board)) {
    console.warn("Game state is invalid: ", data);
  } else {
    // 如果資料有效，更新棋盤與玩家
    board = data.board;
    currentPlayer = data.currentPlayer;
    renderBoard(board);
  }
});

// 按鈕重設
document.getElementById("resetBtn").addEventListener("click", () => {
  board = createEmptyBoard();
  currentPlayer = 1;
  writeGameState(board, currentPlayer);
});
