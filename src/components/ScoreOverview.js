// src/components/ScoreOverview.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ScoreOverview.module.scss";
const apiUrl = process.env.REACT_APP_BACKEND_URL;

const ScoreOverview = ({ shouldUpdate }) => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    axios
      .get(apiUrl + "/scores/scores")
      .then((response) => {
        setScores(response.data);
      })
      .catch((error) => {
        console.error("Es gab ein Problem beim Abrufen der Scores:", error);
      });
  }, []);

  useEffect(() => {
    if (!shouldUpdate) return;

    axios
      .get(apiUrl + "/scores/scores")
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
