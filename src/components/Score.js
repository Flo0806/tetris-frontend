import React from "react";
import styles from "./Score.module.scss"; // Styling importieren

const Score = ({ level, score }) => {
  return (
    <div className={styles["score-container"]}>
      <h1 className="title">Tetris</h1>
      <div className="score-box">
        <div className="score-section">
          <h2>Level</h2>
          <p>{level}</p>
        </div>
        <div className="score-section">
          <h2>Score</h2>
          <p>{score}</p>
        </div>
      </div>
    </div>
  );
};

export default Score;
