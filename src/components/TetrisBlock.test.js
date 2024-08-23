import React from "react";
import { render, screen } from "@testing-library/react";
import TetrisBlock from "./TetrisBlock";

describe("TetrisBlock component", () => {
  it("renders a grey block when color is 0", () => {
    render(<TetrisBlock color={0} />);
    const blockElement = screen.getByRole("presentation");
    expect(blockElement).toHaveStyle({
      backgroundColor: "#d3d3d3",
      backgroundImage: "none",
    });
  });

  it("renders a block with a background image when color is not 0", () => {
    render(<TetrisBlock color="red" />);
    const blockElement = screen.getByRole("presentation");
    expect(blockElement).toHaveStyle({
      backgroundImage: expect.stringContaining("red.png"),
    });
  });

  it("renders a block with background size and position correctly", () => {
    render(<TetrisBlock color="blue" />);
    const blockElement = screen.getByRole("presentation");
    expect(blockElement).toHaveStyle({
      backgroundSize: "cover",
      backgroundPosition: "center",
    });
  });
});
