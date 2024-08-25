import React, { useState } from "react";
import styles from "./Modal.module.scss";
import axios from "axios";
const apiUrl = process.env.REACT_APP_BACKEND_URL;

const Modal = ({ show, onClose, score }) => {
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = async () => {
    if (playerName.trim() === "") return;

    try {
      await axios.post(apiUrl + "/scores", {
        playerName,
        score,
        level: 1,
      });
      onClose();
    } catch (error) {
      console.error("Fehler beim Senden des Scores:", error);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <h2>Geben Sie Ihren Namen ein</h2>
        <input
          type="text"
          placeholder="Ihr Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={playerName.length < 3}>
          Score Senden
        </button>
        <button onClick={onClose}>Abbrechen</button>
      </div>
    </>
  );
};

export default Modal;
