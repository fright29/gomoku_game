const db = firebase.database();
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const BOARD_SIZE = 15;
let board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
let isMyTurn = false;
let myColor = null;

const gameRef = db.ref("games/default");

// 建立棋盤
function createBoard() {
  boardEl.innerHTML = "";
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      boardEl.appendChild(cell);
    }
  }
}

// 處理點擊
boardEl.addEventListener("click", (e) => {
  if (!isMyTurn || !e.target.classList.contains("cell")) return;

  const x = +e.target.dataset.x;
  const y = +e.target.dataset.y;

  if (board[y][x]) return;

  gameRef.child("moves").push({ x, y, color: myColor });
  isMyTurn = false;
  updateStatus();
});

// 勝利檢查
function checkWin(x, y, color) {
  function count(dx, dy) {
    let count = 0;
    let i = 1;
    while (true) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE || board[ny][nx] !== color) break;
      count++; i++;
    }
    return count;
  }

  const directions = [
    [1, 0], [0, 1], [1, 1], [1, -1]
  ];

  for (let [dx, dy] of directions) {
    const total = 1 + count(dx, dy) + count(-dx, -dy);
    if (total >= 5) return true;
  }
  return false;
}

// 更新畫面
function updateBoard() {
  document.querySelectorAll(".cell").forEach(cell => {
    const x = +cell.dataset.x;
    const y = +cell.dataset.y;
    cell.classList.remove("black", "white");
    if (board[y][x]) {
      cell.classList.add(board[y][x]);
    }
  });
}

// 狀態顯示
function updateStatus() {
  if (myColor === null) {
    statusEl.textContent = "等待對手加入...";
  } else {
    statusEl.textContent = isMyTurn ? "輪到你下棋" : "等待對手...";
  }
}

// 初始化
gameRef.once("value", snapshot => {
  const data = snapshot.val();
  const players = data?.players || {};

  if (!players.white) {
    myColor = "white";
    gameRef.child("players/white").set(true);
    isMyTurn = true;
  } else if (!players.black) {
    myColor = "black";
    gameRef.child("players/black").set(true);
    isMyTurn = false;
  } else {
    alert("房間已滿，請稍後再試！");
    return;
  }

  createBoard();
  updateBoard();
  updateStatus();
});

// 監聽對手下棋
gameRef.child("moves").on("child_added", (snapshot) => {
  const { x, y, color } = snapshot.val();
  board[y][x] = color;
  updateBoard();

  if (checkWin(x, y, color)) {
    statusEl.textContent = color === myColor ? "你輸了！" : "你贏了！";
    isMyTurn = false;
  } else {
    isMyTurn = (color !== myColor);
    updateStatus();
  }
});

// 重新開始
restartBtn.addEventListener("click", () => {
  if (confirm("確定要重新開始嗎？")) {
    gameRef.remove().then(() => location.reload());
  }
});
