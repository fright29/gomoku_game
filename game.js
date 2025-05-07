// Firebase 配置
const firebaseConfig = {
  apiKey: "你的Firebase API Key",
  authDomain: "你的Firebase Auth Domain",
  projectId: "你的Firebase Project ID",
  storageBucket: "你的Firebase Storage Bucket",
  messagingSenderId: "你的Firebase Sender ID",
  appId: "你的Firebase App ID",
  measurementId: "你的Firebase Measurement ID"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

const boardSize = 15;
let currentPlayer = 'black'; // 初始玩家是黑棋

const board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

function createBoard() {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';
  
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener('click', handleClick);
      boardElement.appendChild(cell);
    }
  }
}

function handleClick(event) {
  const row = event.target.dataset.row;
  const col = event.target.dataset.col;

  if (board[row][col] === null) {
    board[row][col] = currentPlayer;
    updateBoard();
    checkWin(row, col);
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    document.getElementById('status').textContent = `${currentPlayer === 'black' ? '黑' : '白'}的回合`;

    // 更新 Firebase 資料庫
    db.collection('games').doc('game1').set({ board });
  }
}

function updateBoard() {
  const boardElement = document.getElementById('board');
  let index = 0;
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = boardElement.children[index++];
      if (board[i][j]) {
        cell.classList.add(board[i][j]);
      } else {
        cell.classList.remove('black', 'white');
      }
    }
  }
}

function checkWin(row, col) {
  // 簡單的勝利檢查，檢查水平方向、垂直方向和兩條對角線
  const directions = [
    [[1, 0], [-1, 0]], // 水平方向
    [[0, 1], [0, -1]], // 垂直方向
    [[1, 1], [-1, -1]], // 斜對角方向
    [[1, -1], [-1, 1]], // 反斜對角方向
  ];

  for (const [[dx1, dy1], [dx2, dy2]] of directions) {
    let count = 1;

    // 檢查第一個方向
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx1 * i;
      const newCol = col + dy1 * i;
      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && board[newRow][newCol] === currentPlayer) {
        count++;
      } else {
        break;
      }
    }

    // 檢查第二個方向
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx2 * i;
      const newCol = col + dy2 * i;
      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && board[newRow][newCol] === currentPlayer) {
        count++;
      } else {
        break;
      }
    }

    if (count >= 5) {
      alert(`${currentPlayer === 'black' ? '黑' : '白'}贏了！`);
      resetGame();
      return;
    }
  }
}

function resetGame() {
  // 重設遊戲
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      board[i][j] = null;
    }
  }
  createBoard();
}

function initGame() {
  createBoard();

  // 監聽 Firebase 資料庫變化
  db.collection('games').doc('game1').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      if (data.board) {
        board.length = 0;
        data.board.forEach(row => board.push([...row]));
        updateBoard();
      }
    }
  });
}

initGame();
