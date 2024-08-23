import React, { useReducer, useEffect } from "react";
import TetrisBlock from "./TetrisBlock";
import { TETROMINOS, randomTetromino } from "../utils/tetrominos";

// Initialer Zustand des Spiels
const initialState = {
  board: Array.from({ length: 20 }, () => Array(10).fill(0)),
  currentTetromino: randomTetromino(),
  position: { x: 3, y: 0 },
  gameOver: false,
};

// Funktion zur Rotation eines Tetrominos
const rotateTetromino = (shape) => {
  return shape[0]
    .map((_, colIndex) => shape.map((row) => row[colIndex]))
    .reverse();
};

// Kollisionserkennung
const checkCollision = (
  state,
  moveX,
  moveY,
  shape = state.currentTetromino.shape
) => {
  const { board, position } = state;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const newY = position.y + y + moveY;
        const newX = position.x + x + moveX;

        // Verhindere Kollision mit Spielfeldrändern oder fixierten Blöcken
        if (
          newY >= 20 || // Unterer Rand
          newX < 0 || // Linker Rand
          newX >= 10 || // Rechter Rand
          (newY >= 0 && board[newY][newX] !== 0) // Kollision mit fixierten Blöcken
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

// Fixiert das aktuelle Tetromino auf dem Spielfeld
const fixTetromino = (state) => {
  const { board, currentTetromino, position } = state;
  const newBoard = board.map((row) => [...row]);
  currentTetromino.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        newBoard[position.y + y][position.x + x] = currentTetromino.color;
      }
    });
  });
  return newBoard;
};

const checkForFullRows = (board) => {
  const newBoard = board.filter((row) => row.some((cell) => cell === 0)); // Behalte nur unvollständige Reihen
  const fullRowsCount = 20 - newBoard.length; // Anzahl der vollständigen Reihen

  // Füge leere Reihen oben hinzu, damit das Spielfeld die gleiche Größe behält
  const emptyRows = Array.from({ length: fullRowsCount }, () =>
    Array(10).fill(0)
  );
  return [...emptyRows, ...newBoard];
};

// Reducer-Funktion für das Spiel
const reducer = (state, action) => {
  switch (action.type) {
    case "MOVE_LEFT":
      if (!checkCollision(state, -1, 0)) {
        return {
          ...state,
          position: { ...state.position, x: state.position.x - 1 },
        };
      }
      return state;

    case "MOVE_RIGHT":
      if (!checkCollision(state, 1, 0)) {
        return {
          ...state,
          position: { ...state.position, x: state.position.x + 1 },
        };
      }
      return state;

    case "ROTATE":
      const rotatedShape = rotateTetromino(state.currentTetromino.shape);
      if (!checkCollision(state, 0, 0, rotatedShape)) {
        return {
          ...state,
          currentTetromino: { ...state.currentTetromino, shape: rotatedShape },
        };
      }
      return state;

    case "DROP":
      if (!checkCollision(state, 0, 1)) {
        // Der Stein kann weiter fallen
        return {
          ...state,
          position: { ...state.position, y: state.position.y + 1 },
        };
      } else {
        // Kollision erkannt -> Tetromino fixieren und neues generieren
        const newBoard = fixTetromino(state);

        // Check for full rows
        const clearedBoard = checkForFullRows(newBoard);

        const newTetromino = randomTetromino();
        const newPosition = { x: 3, y: 0 };

        // Prüfen, ob das neue Tetromino sofort blockiert ist -> Game Over
        if (
          checkCollision(
            {
              board: clearedBoard,
              position: newPosition,
              currentTetromino: newTetromino,
            },
            0,
            0
          )
        ) {
          return { ...state, board: clearedBoard, newBoard, gameOver: true };
        }

        // Neues Tetromino korrekt einsetzen
        return {
          ...state,
          board: clearedBoard,
          currentTetromino: newTetromino,
          position: newPosition,
        };
      }

    case "RESET":
      return initialState;

    default:
      return state;
  }
};

// Hauptkomponente für das Spielbrett
const GameBoard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { board, currentTetromino, position, gameOver } = state;

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") {
        dispatch({ type: "MOVE_LEFT" });
      } else if (e.key === "ArrowRight") {
        dispatch({ type: "MOVE_RIGHT" });
      } else if (e.key === "ArrowDown") {
        dispatch({ type: "DROP" });
      } else if (e.key === "ArrowUp") {
        dispatch({ type: "ROTATE" });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(() => {
        dispatch({ type: "DROP" });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameOver]);

  const renderBoard = () => {
    // Kopiere das Board
    const tempBoard = board.map((row) => [...row]);

    // Füge das aktuelle Tetromino zum temporären Board hinzu
    currentTetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = position.y + y;
          const boardX = position.x + x;

          // Stelle sicher, dass wir nur in den Bereich des Boards schreiben
          if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
            tempBoard[boardY][boardX] = currentTetromino.color;
          }
        }
      });
    });

    return tempBoard;
  };

  return (
    <React.Fragment>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(10, 32px)` }}>
        {renderBoard()
          .flat()
          .map((color, index) => (
            <TetrisBlock key={index} color={color} />
          ))}
      </div>
      {state.gameOver && <div>GAME OVER</div>}
    </React.Fragment>
  );
};

export default GameBoard;
