import React from "react";
import { expect, describe, it, beforeEach, vi } from "vitest";
import { render } from "vitest-browser-react";
import Cookie from "js-cookie";
import App from "./App.js";

describe("Timekr", () => {
  beforeEach(() => {
    localStorage.removeItem("projects");
    Cookie.remove("projects");
  });

  it("Starts up with a sample project, that you can access and see sample commits", async () => {
    const { getByText } = render(<App />);
    await expect
      .element(getByText("Sample Project").first())
      .toBeInTheDocument();

    const button = getByText("Sample Project").first();

    await button.click();

    await expect.element(getByText("12:56")).toBeInTheDocument();
    await expect.element(getByText("Time commited")).toBeInTheDocument();
    await expect.element(getByText("39%")).toBeInTheDocument();
    await expect.element(getByText("Of the time budget")).toBeInTheDocument();

    // Explore commit history
    await getByText("Commit history").click();

    await expect
      .element(getByText("60 minutes commited at 11:45:00 AM"))
      .toBeInTheDocument();
    await expect.element(getByText("+02:45 hours")).toBeInTheDocument();
  });

  it("creates, reads, updates and deletes projects", async () => {
    const { getByPlaceholder, getByText } = render(<App />);

    await expect
      .element(getByPlaceholder("New project's name"))
      .toBeInTheDocument();

    await getByPlaceholder("New project's name").fill("Test project");
    await getByText("Add").click();

    await expect.element(getByText("Test project").first()).toBeInTheDocument();

    // Assert that creating a project also selects it, and that it's empty
    await expect.element(getByText("00:00")).toBeInTheDocument();
    await expect.element(getByText("Time commited")).toBeInTheDocument();

    // Rename project
    await getByText("Rename").click();
    await getByPlaceholder("New Name").fill("Test project (r)");
    await getByText("Update").click();

    await expect
      .element(getByText("Test project (r)").first())
      .toBeInTheDocument();

    // Delete project
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await getByText("Delete project").click();
    expect(confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete Test project (r)?",
    );

    await expect.element(getByText("Test project (r)")).not.toBeInTheDocument();
  });
});
