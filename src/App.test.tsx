import React from "react";
import { expect, describe, it, vi, afterEach } from "vitest";
import { render } from "vitest-browser-react";
import Cookie from "js-cookie";
import App from "./App.js";

describe("Timekr", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem("projects");
    localStorage.removeItem("timekr-timer-storage");
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

  it("supports timer functionality with multiple timers, custom duration, and time tracking", async () => {
    // Mock the AudioContext and beep function to avoid actual sounds
    const mockAudioContext = {
      createOscillator: () => ({
        type: "",
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
      }),
      createGain: () => ({
        connect: vi.fn(),
        gain: { exponentialRampToValueAtTime: vi.fn() },
      }),
      currentTime: 0,
      destination: {},
    };

    vi.spyOn(window, "AudioContext").mockImplementation(
      () => mockAudioContext as unknown as AudioContext,
    );
    vi.spyOn(window, "confirm").mockReturnValue(true);

    // Mock setTimeout to execute immediately
    const originalSetTimeout = window.setTimeout;
    vi.spyOn(window, "setTimeout").mockImplementation((fn) => {
      fn();
      return 0 as unknown as number;
    });

    // Mock setInterval to capture callbacks but not execute them immediately
    const originalSetInterval = window.setInterval;
    let intervalCounter = 1;
    const intervalCallbacks: Record<number, () => void> = {};

    vi.spyOn(window, "setInterval").mockImplementation((fn, _ms) => {
      const id = intervalCounter++;
      intervalCallbacks[id] = fn as () => void;
      return id as unknown as number;
    });

    // Mock clearInterval to remove callbacks
    vi.spyOn(window, "clearInterval").mockImplementation((id: number) => {
      delete intervalCallbacks[id];
    });

    // Helper function to execute interval callbacks a specific number of times
    const advanceTimersByTime = (seconds: number) => {
      // Execute all active interval callbacks the specified number of times
      for (let i = 0; i < seconds; i++) {
        Object.values(intervalCallbacks).forEach((callback) => {
          callback();
        });
      }
    };

    const {
      getByText,
      getByPlaceholder,
      getByLabelText,
      getByTestId,
      getByRole,
    } = render(<App />);

    // Create two projects for testing multiple timers
    await getByPlaceholder("New project's name").fill("Timer Test Project 1");
    await getByText("Add").click();

    await getByPlaceholder("New project's name").fill("Timer Test Project 2");
    await getByText("Add").click();

    // 1. Test starting, pausing, and resetting a timer
    // Navigate to first project
    await getByText("Timer Test Project 1").click();

    // Verify initial timer state
    await expect.element(getByText("25:00")).toBeInTheDocument();

    // Start the timer
    await getByText("Start").click();

    // Advance time by 5 seconds
    advanceTimersByTime(5);

    // Verify timer is counting down
    await expect.element(getByText("24:55")).toBeInTheDocument();

    // Pause the timer
    await getByText("Pause").click();

    // Advance time more
    advanceTimersByTime(5);

    // Verify timer is paused (still shows the same time)
    await expect.element(getByText("24:55")).toBeInTheDocument();

    // Reset the timer
    await getByRole("button", { name: "Reset" }).click();

    // Verify timer is reset
    await expect.element(getByText("25:00")).toBeInTheDocument();

    // 2. Test custom timer duration
    // Click the edit button to configure timer
    await getByTestId("configure-timer").click();

    // Set custom time to 10 minutes
    await getByLabelText("Minutes:").fill("10");
    await getByText("Save").first().click();

    // Verify timer shows 10 minutes
    await expect.element(getByText("10:00")).toBeInTheDocument();

    // 3. Test partial time commit
    // Start the timer with custom duration
    await getByText("Start").click();

    // Advance time by 3 minutes (180 seconds)
    advanceTimersByTime(180);

    // Pause the timer
    await getByText("Pause").click();

    // Verify partial time commit option appears
    await expect
      .element(getByText("Commit 3 minutes and reset timer?"))
      .toBeInTheDocument();

    // Commit the partial time
    await getByRole("button", { name: "Commit" }).click();

    // 4. Test multiple timers running simultaneously
    // Navigate to second project
    await getByText("Timer Test Project 2").click();

    // Start timer on second project
    await getByText("Start").click();

    // Navigate back to first project
    await getByText("Timer Test Project 1").click();

    // Advance time by 2 minutes
    advanceTimersByTime(120);

    // Start timer on first project again
    await getByText("Start").click();

    // Advance time by 2 minutes
    advanceTimersByTime(120);

    // Verify both timers are running (check sidebar)
    await getByText("Timer Test Project 2").click();
    await expect.element(getByText("21:00")).toBeInTheDocument();

    await getByText("Timer Test Project 1").click();
    await expect.element(getByText("23:00")).toBeInTheDocument();

    // All done, reset project
    await getByRole("button", { name: "Reset" }).click();

    // 5. Test automatic time commit when timer reaches zero
    // Configure a short timer (1 minute) for quick testing
    await getByTestId("configure-timer").click();
    await getByLabelText("Minutes").fill("1");
    await getByText("Save").first().click();

    // Start the timer
    await getByText("Start").click();

    // Advance time by 1 minute to trigger auto-commit
    advanceTimersByTime(70);

    // Verify timer has reset after auto-commit
    await expect.element(getByText("00:00")).toBeInTheDocument();

    // 6. Check commit history
    await getByText("Commit history").click();

    // Verify our commits are in the history
    await expect.element(getByText(/3 minutes commited/)).toBeInTheDocument();
    await expect.element(getByText(/1 minute commited/)).toBeInTheDocument();

    // Restore original functions
    window.setTimeout = originalSetTimeout;
    window.setInterval = originalSetInterval;
  });
});
