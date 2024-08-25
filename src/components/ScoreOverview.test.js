import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import ScoreOverview from "./ScoreOverview";

// Mock for axios
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
    // Simulated data returned by the API
    const mockedScores = [
      { playerName: "John", score: 100 },
      { playerName: "Doe", score: 90 },
      { playerName: "Alice", score: 85 },
    ];

    // Define how axios.get should behave
    axios.get.mockResolvedValue({ data: mockedScores });

    // Render the component with shouldUpdate = true
    render(<ScoreOverview shouldUpdate={true} />);

    // Wait until the data is loaded into the UI
    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("Doe")).toBeInTheDocument();
      expect(screen.getByText("90")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("85")).toBeInTheDocument();
    });

    // Check that axios.get was called
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/scores/scores"
    );
  });

  it("should log an error if the API call fails", async () => {
    // Simulated error message
    const mockedError = new Error("Network error");
    console.error = jest.fn(); // Mock for console.error

    // Simulate a failed API call
    axios.get.mockRejectedValue(mockedError);

    // Render the component with shouldUpdate = true
    render(<ScoreOverview shouldUpdate={true} />);

    // Wait until the error is handled
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "There was a problem fetching the scores:",
        mockedError
      );
    });

    // Check that axios.get was called
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
