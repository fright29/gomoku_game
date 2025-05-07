// 初始化 Pusher（注意：trigger 需要 server 端，這裡用 client 模擬僅接收動作）
const pusher = new Pusher('280e499348b08c81b7a0', {
  cluster: 'ap3',
  encrypted: true
});

// 訂閱頻道
const channel = pusher.subscribe('gomoku-game');

// 遊戲狀態
let board = Array(15).fill().map(() => Array(15).fill(null));
let currentPlayer = 'black';
let isMyTurn = true;  // 暫時假設一個視窗一個人，不做登入判斷
let gameEnded = false;

// 建立棋盤
const boardElement = document.getElementById('board');
const statusText = document.getElementById('status');

function renderBoard() {
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleClick);
      boardElement.appendChild(cell);
    }
  }
}

function handleClick(e) {
  if (!isMyTurn || gameEnded) return;
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  if (board[row][col]) return;

  makeMove(row, col, currentPlayer);
  channel.trigger('client-move-made', { row, col, color: currentPlayer });

  checkWin(row, col, currentPlayer);

  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
  isMyTurn = false;
  statusText.textContent = "等待對方下棋...";
}

// 接收對方棋步
channel.bind('client-move-made', function (data) {
  if (gameEnded) return;
  const { row, col, color } = data;
  board[row][col] = color;
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  cell.classList.add(color);

  checkWin(row, col, color);

  currentPlayer = color === 'black' ? 'white' : 'black';
  isMyTurn = true;
  statusText.textContent = "輪到你下棋";
});

function makeMove(row, col, color) {
  board[row][col] = color;
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  cell.classList.add(color);
}

// 勝利判斷
function checkWin(row, col, color) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    count += countConsecutive(row, col, dx, dy, color);
    count += countConsecutive(row, col, -dx, -dy, color);

    if (count >= 5) {
      statusText.textContent = (color === 'black' ? '黑棋' : '白棋') + " 獲勝！";
      gameEnded = true;
      return;
    }
  }
}

function countConsecutive(row, col, dx, dy, color) {
  let r = row + dx;
  let c = col + dy;
  let count = 0;

  while (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === color) {
    count++;
    r += dx;
    c += dy;
  }

  return count;
}

renderBoard();
statusText.textContent = "輪到你下棋";
