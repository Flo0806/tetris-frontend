import React, { useReducer, useEffect, useState } from "react";
import TetrisBlock from "./TetrisBlock";
import { randomTetromino } from "../utils/tetrominos";
import Score from "./Score";
import styles from "./GameBoard.module.scss";
import ScoreOverview from "./ScoreOverview";
import Modal from "./Modal";

// Initialer Zustand des Spiels
const initialState = {
  board: Array.from({ length: 20 }, () => Array(10).fill(0)),
  currentTetromino: randomTetromino(),
  position: { x: 3, y: 0 },
  gameOver: false,
  fullRows: [],
  score: 0,
  level: 1,
  totalRowsCleared: 0,
  totalPoints: 0,
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
      const clearedBoard = state.board.filter(
        (_, rowIndex) => !state.fullRows.includes(rowIndex)
      );
      const emptyRows = Array(state.fullRows.length).fill(Array(10).fill(0));
      const newBoard = [...emptyRows, ...clearedBoard];

      // Berechne die Punkte basierend auf der Anzahl der entfernten Reihen
      const rowsCleared = state.fullRows.length;
      let points = 0;
      switch (rowsCleared) {
        case 1:
          points = 100 * state.level;
          break;
        case 2:
          points = 300 * state.level;
          break;
        case 3:
          points = 500 * state.level;
          break;
        case 4:
          points = 800 * state.level;
          break;
        default:
          points = 0;
      }

      // Addiere die Punkte
      const totalPoints = state.score + points;

      // Aktualisiere die Anzahl der Reihen, die insgesamt entfernt wurden
      const totalRowsCleared = state.totalRowsCleared + rowsCleared;

      // Prüfe, ob ein Levelaufstieg erfolgt (z.B. nach 10 entfernten Reihen)
      const newLevel = Math.floor(totalRowsCleared / 10) + 1; // Alle 10 Reihen steigt das Level

      // Füge das neue Tetromino hinzu
      const nextTetromino = randomTetromino();
      const nextPosition = { x: 3, y: 0 };

      // Prüfe, ob das Spiel vorbei ist
      if (
        checkCollision(
          {
            board: newBoard,
            position: nextPosition,
            currentTetromino: nextTetromino,
          },
          0,
          0
        )
      ) {
        return { ...state, board: newBoard, gameOver: true };
      }

      return {
        ...state,
        board: newBoard,
        currentTetromino: nextTetromino,
        position: nextPosition,
        fullRows: [],
        score: totalPoints,
        level: newLevel,
        totalRowsCleared: totalRowsCleared,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    board,
    currentTetromino,
    position,
    gameOver,
    fullRows,
    animationStage,
    score,
    level,
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
      const speed = 1000 - (state.level - 1) * 100; // Das Intervall verkürzt sich mit jedem Level
      const interval = setInterval(() => {
        dispatch({ type: "DROP" });
      }, Math.max(speed, 100)); // Maximalgeschwindigkeit: 100ms Intervall
      return () => clearInterval(interval);
    }
  }, [gameOver, state.level]);

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

  const closeModal = () => {
    setIsModalOpen(false);
    resetGame();
  };

  const resetGame = () => {
    dispatch({ type: "RESET" }); // Setze das Spiel zurück
  };

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
    <div className={styles["game-container"]}>
      <div style={{ position: "relative" }}>
        <div className={styles["tetris-grid"]}>
          {renderBoard()
            .flat()
            .map((color, index) => (
              <TetrisBlock key={index} color={color} />
            ))}
        </div>
        {gameOver && (
          <div className={styles["game-over"]}>
            GAME OVER
            <button
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              SCORE
            </button>
          </div>
        )}
      </div>
      <div>
        <Score level={level} score={score} /> <ScoreOverview></ScoreOverview>
      </div>
      <Modal show={isModalOpen} onClose={closeModal} score={score} />
    </div>
  );
};

export default GameBoard;
