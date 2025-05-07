const boardSize = 15;
let currentPlayer = 'black';
let board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));

function createBoard() {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';

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

  updateStatus();
}

function handleClick(e) {
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);

  if (board[row][col] !== null) return; // 已經有棋子

  board[row][col] = currentPlayer;
  e.target.classList.add(currentPlayer);

  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
  updateStatus();
}

function updateStatus() {
  const status = document.getElementById('status');
  status.textContent = `目前輪到 ${currentPlayer === 'black' ? '黑棋' : '白棋'} 下`;
}

createBoard();
