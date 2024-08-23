// src/components/TetrisBlock.js
import React from "react";
import "./TetrisBlock.module.scss";
// src/components/TetrisBlock.js

const TetrisBlock = ({ color }) => {
  const backgroundColor = color === 0 ? "#d3d3d3" : color; // Setze leere Zellen auf hellgrau

  return (
    <div
      style={{
        width: "32px",
        height: "32px",
        backgroundColor: backgroundColor,
        border: "1px solid #ccc",
      }}
    ></div>
  );
};

export default TetrisBlock;
