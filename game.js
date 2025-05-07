document.addEventListener('DOMContentLoaded', function() {
  const board = document.getElementById('board');
  const rows = 15;
  const cols = 15;

  // 動態生成 15x15 的格子
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      board.appendChild(cell);
    }
  }
});
