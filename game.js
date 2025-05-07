// game.js
export function setupGame(db) {
  import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

  const size = 15;
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");

  let board = Array.from({ length: size }, () => Array(size).fill(null));
  let currentPlayer = "black";
  let gameOver = false;

  // 建立棋盤 UI
  function createBoard() {
    boardEl.innerHTML = "";
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = x;
        cell.dataset.y = y;
        boardEl.appendChild(cell);
      }
    }
  }

  // 勝利判斷
  function checkWin(x, y, color) {
    const directions = [
      [1, 0], [0, 1], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      for (let dir of [1, -1]) {
        let step = 1;
        while (true) {
          const nx = x + dx * step * dir;
          const ny = y + dy * step * dir;
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) break;
          if (board[ny][nx] !== color) break;
          count++;
          step++;
        }
      }
      if (count >= 5) return true;
    }
    return false;
  }

  // 設定 Firebase listener
  const movesRef = ref(db, "moves");
  onValue(movesRef, (snapshot) => {
    const data = snapshot.val();
    board = Array.from({ length: size }, () => Array(size).fill(null));
    createBoard();
    if (!data) return;
    Object.entries(data).forEach(([pos, color]) => {
      const [x, y] = pos.split(",").map(Number);
      const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (cell) cell.classList.add(color);
      board[y][x] = color;
    });
    statusEl.textContent = `輪到 ${currentPlayer === "black" ? "黑棋" : "白棋"}`;
    gameOver = false;
  });

  // 點擊事件
  boardEl.addEventListener("click", async (e) => {
    if (gameOver) return;

    const cell = e.target;
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    if (isNaN(x) || isNaN(y)) return;
    if (board[y][x]) return;

    const moveKey = `${x},${y}`;
    board[y][x] = currentPlayer;

    // 更新資料庫
    await set(ref(db, `moves/${moveKey}`), currentPlayer);

    // 檢查勝利
    if (checkWin(x, y, currentPlayer)) {
      statusEl.textContent = `${currentPlayer === "black" ? "黑棋" : "白棋"} 獲勝！`;
      gameOver = true;
      return;
    }

    // 換手
    currentPlayer = currentPlayer === "black" ? "white" : "black";
  });

  createBoard();
  statusEl.textContent = "遊戲開始，黑棋先手";
}
