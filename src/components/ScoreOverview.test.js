// src/components/ScoreOverview.test.js

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import ScoreOverview from "./ScoreOverview";

// Mock für axios
jest.mock("axios");

describe("ScoreOverview", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not fetch scores when shouldUpdate is false", () => {
    render(<ScoreOverview shouldUpdate={false} />);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("should fetch and display top 10 scores when shouldUpdate is true", async () => {
    // Simulierte Daten, die von der API zurückgegeben werden
    const mockedScores = [
      { playerName: "John", score: 100 },
      { playerName: "Doe", score: 90 },
      { playerName: "Alice", score: 85 },
    ];

    // Definiere, wie axios.get reagiert
    axios.get.mockResolvedValue({ data: mockedScores });

    // Rendere die Komponente mit shouldUpdate = true
    render(<ScoreOverview shouldUpdate={true} />);

    // Warte, bis die Daten in die UI geladen werden
    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("Doe")).toBeInTheDocument();
      expect(screen.getByText("90")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("85")).toBeInTheDocument();
    });

    // Überprüfe, ob axios.get aufgerufen wurde
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/scores/scores"
    );
  });

  it("should log an error if the API call fails", async () => {
    // Simulierte Fehlermeldung
    const mockedError = new Error("Network error");
    console.error = jest.fn(); // Mock für console.error

    // Simuliere einen fehlschlagenden API-Aufruf
    axios.get.mockRejectedValue(mockedError);

    // Rendere die Komponente mit shouldUpdate = true
    render(<ScoreOverview shouldUpdate={true} />);

    // Warte, bis der Fehler behandelt wurde
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Es gab ein Problem beim Abrufen der Scores:",
        mockedError
      );
    });

    // Überprüfe, ob axios.get aufgerufen wurde
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
