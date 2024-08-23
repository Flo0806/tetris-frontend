import React from "react";
import "./TetrisBlock.module.scss";

import red from "../assets/red.png";
import blue from "../assets/blue.png";
import green from "../assets/green.png";
import yellow from "../assets/yellow.png";
import lightblue from "../assets/lightblue.png";
import orange from "../assets/orange.png";
import violet from "../assets/violet.png";

const blockImages = {
  red,
  blue,
  green,
  yellow,
  lightblue,
  orange,
  violet,
};

const TetrisBlock = ({ color }) => {
  const backgroundColor = color === 0 ? "#d3d3d3" : "#d3d3d3"; // Setze leere Zellen auf hellgrau

  const backgroundImage = color !== 0 ? `url(${blockImages[color]})` : "none"; // Verwende das Bild, wenn color nicht 0 ist

  return (
    <div
      role="presentation" // Hinzugefügt für bessere Testbarkeit
      style={{
        width: "32px",
        height: "32px",
        backgroundColor: backgroundColor,
        border:
          color === 0 || color === "white"
            ? "1px solid #ccc"
            : "0px solid #00000000",
        backgroundImage: backgroundImage,
        backgroundSize: "cover", // Skaliert das Bild, um den gesamten Block zu füllen
        backgroundPosition: "center", // Zentriert das Bild
      }}
    ></div>
  );
};

export default TetrisBlock;
