const boardSize = 15;
let currentPlayer = 'black';
let board = [];
let gameOver = false;

function createBoard() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';
  gameOver = false;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleClick);
      boardElement.appendChild(cell);
    }
  }

  currentPlayer = 'black';
  updateStatus();
}

function handleClick(e) {
  if (gameOver) return;

  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);

  if (board[row][col] !== null) return;

  board[row][col] = currentPlayer;
  e.target.classList.add(currentPlayer);

  if (checkWin(row, col, currentPlayer)) {
    document.getElementById('status').textContent = `${currentPlayer === 'black' ? '黑棋' : '白棋'} 勝利！`;
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
  updateStatus();
}

function updateStatus() {
  const status = document.getElementById('status');
  status.textContent = `目前輪到 ${currentPlayer === 'black' ? '黑棋' : '白棋'} 下`;
}

function checkWin(row, col, player) {
  return (
    countConsecutive(row, col, 0, 1, player) + countConsecutive(row, col, 0, -1, player) >= 4 || // 橫
    countConsecutive(row, col, 1, 0, player) + countConsecutive(row, col, -1, 0, player) >= 4 || // 直
    countConsecutive(row, col, 1, 1, player) + countConsecutive(row, col, -1, -1, player) >= 4 || // 斜右下
    countConsecutive(row, col, 1, -1, player) + countConsecutive(row, col, -1, 1, player) >= 4    // 斜左下
  );
}

function countConsecutive(row, col, deltaRow, deltaCol, player) {
  let count = 0;
  let r = row + deltaRow;
  let c = col + deltaCol;

  while (
    r >= 0 && r < boardSize &&
    c >= 0 && c < boardSize &&
    board[r][c] === player
  ) {
    count++;
    r += deltaRow;
    c += deltaCol;
  }

  return count;
}

function restartGame() {
  createBoard();
}

createBoard();
