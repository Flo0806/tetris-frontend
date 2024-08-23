// src/components/ScoreOverview.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ScoreOverview.module.scss";

const ScoreOverview = ({ shouldUpdate }) => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (!shouldUpdate) return;

    axios
      .get("http://localhost:8080/api/scores/scores")
      .then((response) => {
        setScores(response.data);
      })
      .catch((error) => {
        console.error("Es gab ein Problem beim Abrufen der Scores:", error);
      });
  }, [shouldUpdate]);

  return (
    <div className={styles["score-overview"]}>
      <h2>Top 10 Scores</h2>
      <ul>
        {scores.slice(0, 10).map((score, index) => (
          <li key={index}>
            <span className={styles.name}>{score.playerName}</span>
            <span className={styles.score}>{score.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScoreOverview;
