import React, { useState } from "react";
import { useTimerStore } from "../store/timerStore";
import Icon from "./Icon";
import TimeInput from "./TimeInput";

interface PomodoroTimerProps {
  projectSlug: string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ projectSlug }) => {
  const { startTimer, stopTimer, resetTimer, getTimerState, setCustomTime } =
    useTimerStore();
  const { time, initialTime, timerStopped, partialTimeCommited } =
    getTimerState(projectSlug);

  // Format time with leading zeros
  const twoDigits = (num: number): string => {
    return ("0" + num).slice(-2);
  };

  const prettyTime = `${twoDigits(Math.floor(time / 60))}:${twoDigits(
    time % 60,
  )}`;

  // No need to check if timer reached zero anymore as it's handled in the store

  // Timer control functions
  const handleStartTimer = () => {
    if (timerStopped === false) return;
    startTimer(projectSlug);
    setCustomTimeConfig(null);
  };

  const handleStopTimer = () => {
    if (timerStopped) return;
    stopTimer(projectSlug);
  };

  const handleResetTimer = (askConfirmation = true) => {
    if (
      askConfirmation &&
      !confirm("Are you sure you want to reset the timer?")
    ) {
      return;
    }
    resetTimer(projectSlug);
  };

  // Commit functions
  const commitPartialTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (partialTimeCommited !== false) {
      useTimerStore.getState().commitTime(projectSlug, partialTimeCommited);
      resetTimer(projectSlug);
    }
  };

  // custom time config
  const [customTimeConfig, setCustomTimeConfig] = useState<number | null>(null);
  const toggleCustomTimeConfig = () => {
    if (customTimeConfig !== null) {
      setCustomTimeConfig(null);
    } else {
      // default value
      setCustomTimeConfig(25);
    }
  };

  const saveCustomTime = () => {
    if (customTimeConfig !== null) {
      // Use the store method to set custom time
      setCustomTime(projectSlug, customTimeConfig);

      // Close the custom time form
      setCustomTimeConfig(null);
    }
  };

  return (
    <section
      className="my-3 border border-grey-light bg-1 rounded-lg"
      style={{
        transition: "max-height 0.15s ease",
        height:
          partialTimeCommited !== false || customTimeConfig !== null
            ? "auto"
            : "72px",
      }}
    >
      <div className="flex p-4">
        <div className="mb-0 px-4 text-3xl text-1 font-mono mr-auto">
          {prettyTime}

          {timerStopped &&
            !partialTimeCommited &&
            customTimeConfig === null && (
              <button
                type="button"
                className="btn btn-default btn-icon ml-2 align-top text-sm"
                onClick={toggleCustomTimeConfig}
                aria-label="Configure timer"
                data-testid="configure-timer"
              >
                <Icon name="edit-3" className="w-4 h-4" />
              </button>
            )}
        </div>

        <button
          type="button"
          className="btn btn-primary align-top"
          onClick={timerStopped ? handleStartTimer : handleStopTimer}
        >
          <Icon
            name={timerStopped ? "play-circle" : "pause-circle"}
            className="w-5 h-5"
          />
          {timerStopped ? " Start" : " Pause"}
        </button>

        {(!timerStopped || time !== initialTime) && (
          <button
            type="button"
            className="btn btn-danger align-top"
            onClick={() => handleResetTimer()}
          >
            <Icon name="x-circle" className="w-5 h-5" />
            {" Reset"}
          </button>
        )}
      </div>

      {partialTimeCommited !== false && (
        <form
          className="flex items-center p-4 show-ltr"
          onSubmit={commitPartialTime}
        >
          <div className="text-left px-4">
            Commit{" "}
            <span className="font-bold">
              {partialTimeCommited} minute
              {partialTimeCommited > 1 ? "s" : ""}
            </span>{" "}
            and reset timer?
          </div>
          <button type="submit" className="ml-auto btn btn-primary">
            Commit
          </button>
        </form>
      )}

      {customTimeConfig !== null && !partialTimeCommited && (
        <form
          className="flex items-center p-4 show-ltr"
          onSubmit={(e) => {
            e.preventDefault();
            saveCustomTime();
          }}
        >
          <TimeInput
            value={customTimeConfig}
            onChange={(value) => setCustomTimeConfig(value)}
          />
          <button
            type="button"
            className="btn btn-default ml-auto"
            onClick={() => setCustomTimeConfig(null)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary ml-auto">
            <Icon name="save" className="w-4 h-4 mr-1" />
            Save
          </button>
        </form>
      )}
    </section>
  );
};

export default PomodoroTimer;
