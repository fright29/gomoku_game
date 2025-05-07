const boardSize = 15;
let currentPlayer = 'black';
let board = [];
let gameOver = false;

function createBoard() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';  // 清空棋盤

  gameOver = false;  // 遊戲狀態重置

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

  currentPlayer = 'black';  // 重置回黑棋
  updateStatus();  // 更新狀態顯示
  document.getElementById('status').textContent = '目前輪到 黑棋 下';
}

function handleClick(e) {
  if (gameOver) return;  // 如果遊戲結束，點擊無效

  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);

  if (board[row][col] !== null) return;  // 如果這個位置已經有棋子，則不讓再點

  board[row][col] = currentPlayer;  // 在棋盤上標記當前玩家的棋子
  e.target.classList.add(currentPlayer);  // 更新格子顏色

  // 檢查是否獲勝
  if (checkWin(row, col, currentPlayer)) {
    document.getElementById('status').textContent = `${currentPlayer === 'black' ? '黑棋' : '白棋'} 勝利！`;
    gameOver = true;  // 遊戲結束
    return;
  }

  // 換下一位玩家
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

// 重置遊戲
function restartGame() {
  createBoard();
}

createBoard();
