// src/components/ScoreOverview.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ScoreOverview.module.scss";

const ScoreOverview = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/scores/scores")
      .then((response) => {
        console.log(response.data);
        setScores(response.data);
      })
      .catch((error) => {
        console.error("Es gab ein Problem beim Abrufen der Scores:", error);
      });
  }, []);

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
