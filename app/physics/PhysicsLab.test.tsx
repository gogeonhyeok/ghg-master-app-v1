import "@testing-library/jest-dom/jest-globals";
import { expect, test } from "@jest/globals";
import { fireEvent, render, screen, within } from "@testing-library/react";
import PhysicsLab from "./PhysicsLab";

function section(name: string) { return within(screen.getByRole("region", { name })); }

test("provides all five named topics, charts and model assumptions", () => {
  render(<PhysicsLab />);
  for (const name of ["Classical mechanics", "Electromagnetism", "Special relativity", "General relativity", "Thermal & statistical physics"]) {
    const topic = section(name);
    expect(topic.getByRole("img")).toBeInTheDocument();
    expect(topic.getByText("Model & assumptions")).toBeInTheDocument();
  }
  expect(screen.getByRole("navigation", { name: "Physics topics" }).querySelectorAll("a")).toHaveLength(5);
});

test("updates moving-clock time and contracted length from the speed control", () => {
  render(<PhysicsLab />);
  const topic = section("Special relativity");
  fireEvent.change(topic.getByRole("slider", { name: /Relative speed/ }), { target: { value: ".8" } });
  expect(topic.getByText("6.00 s")).toBeInTheDocument();
  expect(topic.getByText("60.00 m")).toBeInTheDocument();
  expect(topic.getByText("1.67 ×")).toBeInTheDocument();
});

test("updates electric attraction, repulsion and neutral cases", () => {
  render(<PhysicsLab />);
  const topic = section("Electromagnetism");
  expect(topic.getByText("Attraction")).toBeInTheDocument();
  const charge = topic.getByRole("slider", { name: /Charge q₂/ });
  fireEvent.change(charge, { target: { value: "2" } });
  expect(topic.getByText("Repulsion")).toBeInTheDocument();
  fireEvent.change(charge, { target: { value: "0" } });
  expect(topic.getByText("No mutual force")).toBeInTheDocument();
  expect(topic.getByText("0.0000 N")).toBeInTheDocument();
});

test("changes the gravitational clock rate with radius", () => {
  render(<PhysicsLab />);
  const topic = section("General relativity");
  fireEvent.change(topic.getByRole("slider", { name: /Radius from centre/ }), { target: { value: "4" } });
  expect(topic.getByText("86.60 %")).toBeInTheDocument();
  expect(topic.getByText("8.66 s")).toBeInTheDocument();
});

test("changes gas speeds with temperature and species", () => {
  render(<PhysicsLab />);
  const topic = section("Thermal & statistical physics");
  const first = topic.getAllByText(/m\/s$/, { selector: "dd" })[0].textContent;
  fireEvent.change(topic.getByRole("slider", { name: /Temperature/ }), { target: { value: "1000" } });
  expect(topic.getAllByText(/m\/s$/, { selector: "dd" })[0].textContent).not.toBe(first);
  fireEvent.change(topic.getByRole("combobox", { name: "Gas species" }), { target: { value: "1" } });
  expect(topic.getByText("4.003 g/mol")).toBeInTheDocument();
});

test("scrubs and resets projectile flight without automatic playback", () => {
  render(<PhysicsLab />);
  const topic = section("Classical mechanics");
  const slider = topic.getByRole("slider", { name: /Flight position/ });
  fireEvent.change(slider, { target: { value: "100" } });
  expect(topic.getByRole("button", { name: "Replay launch" })).toBeInTheDocument();
  fireEvent.click(topic.getByRole("button", { name: "Reset flight" }));
  expect(slider).toHaveValue("0");
  expect(topic.getByRole("button", { name: "Play launch" })).toBeInTheDocument();
});
