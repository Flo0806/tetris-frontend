import React, { useReducer, useEffect } from "react";
import TetrisBlock from "./TetrisBlock";
import { TETROMINOS, randomTetromino } from "../utils/tetrominos";

// Initialer Zustand des Spiels
const initialState = {
  board: Array.from({ length: 20 }, () => Array(10).fill(0)),
  currentTetromino: randomTetromino(),
  position: { x: 3, y: 0 },
  gameOver: false,
  fullRows: [],
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
  shape = state.currentTetromino?.shape
) => {
  // Stelle sicher, dass shape definiert ist
  if (!shape) return false;

  const { board, position } = state;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const newY = position.y + y + moveY;
        const newX = position.x + x + moveX;

        // Überprüfe auf Kollision mit dem Spielfeld oder fixierten Blöcken
        if (
          newY >= 20 || // Unten
          newX < 0 || // Links
          newX >= 10 || // Rechts
          (newY >= 0 && board[newY][newX] !== 0) // Fixierte Blöcke
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
        return {
          ...state,
          position: { ...state.position, y: state.position.y + 1 },
        };
      } else {
        // Fixiere das Tetromino und entferne es aus dem Zustand
        const newBoard = fixTetromino(state);
        return {
          ...state,
          board: newBoard,
          currentTetromino: null, // Tetromino leeren
          animationStage: "checking_rows",
        };
      }

    case "CHECK_ROWS":
      // Überprüfen auf vollständige Reihen
      const fullRows = state.board.reduce(
        (acc, row, rowIndex) =>
          row.every((cell) => cell !== 0) ? [...acc, rowIndex] : acc,
        []
      );

      if (fullRows.length > 0) {
        return {
          ...state,
          fullRows,
          animationStage: "blinking",
        };
      }

      // Wenn keine Reihen zu entfernen sind, generiere ein neues Tetromino
      const newTetromino = randomTetromino();
      const newPosition = { x: 3, y: 0 };

      if (
        checkCollision(
          {
            board: state.board,
            position: newPosition,
            currentTetromino: newTetromino,
          },
          0,
          0
        )
      ) {
        return { ...state, gameOver: true };
      }

      return {
        ...state,
        currentTetromino: newTetromino,
        position: newPosition,
        animationStage: "none",
      };

    case "CLEAR_ROWS":
      // Entferne die vollständigen Reihen nach der Animation
      const clearedBoard = state.board.filter(
        (_, rowIndex) => !state.fullRows.includes(rowIndex)
      );
      const emptyRows = Array(state.fullRows.length).fill(Array(10).fill(0));

      // Nach dem Entfernen der Reihen wird ein neues Tetromino generiert
      const nextTetromino = randomTetromino();
      const nextPosition = { x: 3, y: 0 };

      if (
        checkCollision(
          {
            board: [...emptyRows, ...clearedBoard],
            position: nextPosition,
            currentTetromino: nextTetromino,
          },
          0,
          0
        )
      ) {
        return {
          ...state,
          board: [...emptyRows, ...clearedBoard],
          gameOver: true,
        };
      }

      return {
        ...state,
        board: [...emptyRows, ...clearedBoard],
        currentTetromino: nextTetromino,
        position: nextPosition,
        fullRows: [],
        animationStage: "none",
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
};

// Hauptkomponente für das Spielbrett
const GameBoard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    board,
    currentTetromino,
    position,
    gameOver,
    fullRows,
    animationStage,
  } = state;
  const [blinkingRows, setBlinkingRows] = React.useState([]);

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

  useEffect(() => {
    if (animationStage === "checking_rows") {
      // Starte die Überprüfung auf vollständige Reihen
      dispatch({ type: "CHECK_ROWS" });
    }
  }, [animationStage]);

  useEffect(() => {
    if (animationStage === "blinking" && fullRows.length > 0) {
      // Starte die Blinkanimation
      setBlinkingRows(fullRows);
      setTimeout(() => {
        setBlinkingRows([]);
        dispatch({ type: "CLEAR_ROWS" });
      }, 500); // Blinkzeit 500ms
    }
  }, [animationStage, fullRows]);

  const renderBoard = () => {
    const tempBoard = board.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (blinkingRows.includes(rowIndex)) {
          return "white"; // Blinke die volle Reihe in Weiß
        }
        return cell;
      })
    );

    // Zeichne das aktuelle Tetromino, wenn es vorhanden ist
    if (currentTetromino) {
      currentTetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = position.y + y;
            const boardX = position.x + x;

            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              tempBoard[boardY][boardX] = currentTetromino.color;
            }
          }
        });
      });
    }

    return tempBoard;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(10, 32px)` }}>
      {gameOver ? (
        <div>GAME OVER</div>
      ) : (
        renderBoard()
          .flat()
          .map((color, index) => <TetrisBlock key={index} color={color} />)
      )}
    </div>
  );
};

export default GameBoard;
