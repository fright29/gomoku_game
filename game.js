import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDq9OSvLB2KJBB-Mg5yTTdng3zJmI5XmXA",
  authDomain: "gomoku-58c73.firebaseapp.com",
  projectId: "gomoku-58c73",
  storageBucket: "gomoku-58c73.appspot.com",
  messagingSenderId: "468039195363",
  appId: "1:468039195363:web:9e1957dd49eb27e1e003d6",
  measurementId: "G-8EB69LG6JQ",
  databaseURL: "https://gomoku-58c73-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const boardRef = ref(database, "gomoku/board");
const turnRef = ref(database, "gomoku/turn");

const boardElement = document.getElementById("board");
const restartButton = document.getElementById("restart");

let gameState = Array.from({ length: 15 }, () => Array(15).fill(null));
let currentTurn = "black";

function renderBoard() {
  boardElement.innerHTML = "";
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (gameState[y][x] === "black") cell.classList.add("black");
      if (gameState[y][x] === "white") cell.classList.add("white");
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener("click", handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

function handleCellClick(e) {
  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);

  if (!gameState[y]) gameState[y] = Array(15).fill(null); // 防止 undefined
  if (gameState[y][x]) return;

  gameState[y][x] = currentTurn;
  currentTurn = currentTurn === "black" ? "white" : "black";

  set(boardRef, gameState);
  set(turnRef, currentTurn);
}

restartButton.addEventListener("click", () => {
  const emptyBoard = Array.from({ length: 15 }, () => Array(15).fill(null));
  set(boardRef, emptyBoard);
  set(turnRef, "black");
});

onValue(boardRef, (snapshot) => {
  const newGameState = snapshot.val();
  if (newGameState) {
    try {
      // 修正：將物件轉為二維陣列
      gameState = Object.values(newGameState).map(row =>
        Array.isArray(row) ? row : Object.values(row)
      );
      renderBoard();
    } catch (err) {
      console.error("Game state is invalid:", newGameState);
    }
  }
});

onValue(turnRef, (snapshot) => {
  const newTurn = snapshot.val();
  if (newTurn) {
    currentTurn = newTurn;
  }
});
