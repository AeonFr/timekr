import React, { useEffect, useRef } from "react";
import Icon from "./Icon";
import { useTimerStore } from "../store/timerStore";

interface PomodoroTimerProps {
  onCommitTime: (data: { amount: number | string }) => void;
  projectSlug: string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onCommitTime, projectSlug }) => {
  const timerRef = useRef<number | null>(null);
  const { startTimer, stopTimer, resetTimer, tick, getTimerState } = useTimerStore();
  const { time, timerStopped, partialTimeCommited } = getTimerState(projectSlug);

  // Format time with leading zeros
  const twoDigits = (num: number): string => {
    return ("0" + num).slice(-2);
  };

  const prettyTime = `${twoDigits(Math.floor(time / 60))}:${twoDigits(
    time % 60,
  )}`;

  // Check if timer reached zero
  useEffect(() => {
    if (time === 0 && !timerStopped) {
      commitOnePomodoro();
      document.title = "Timekr";
      stopTimer(projectSlug);
    }
  }, [time, timerStopped, projectSlug, stopTimer]);

  // Timer interval
  useEffect(() => {
    if (!timerStopped && time > 0) {
      timerRef.current = window.setInterval(() => {
        tick(projectSlug);
        
        // Update document title
        const updatedState = getTimerState(projectSlug);
        if (!updatedState.timerStopped && updatedState.time > 0) {
          document.title = `(${twoDigits(
            Math.floor(updatedState.time / 60),
          )}:${twoDigits(updatedState.time % 60)}) Timekr`;
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerStopped, projectSlug, tick, getTimerState]);

  // Audio beep function
  const beep = () => {
    const context = new (window.AudioContext ||
      (window as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const oscillator = context.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.value = 830.6;
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(0);

    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(
        0.00001,
        context.currentTime + 0.04,
      );
    }, 500);
  };

  // Timer control functions
  const handleStartTimer = () => {
    if (timerStopped === false) return;
    startTimer(projectSlug);
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
  const commitOnePomodoro = () => {
    onCommitTime({ amount: 25 });

    // Audio Effect
    beep();
    const interval = 800;
    setTimeout(() => {
      beep();
      setTimeout(() => {
        beep();
        setTimeout(beep, interval);
      }, interval);
    }, interval);
  };

  const commitPartialTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (partialTimeCommited !== false) {
      onCommitTime({ amount: partialTimeCommited });
      resetTimer(projectSlug);
    }
  };

  return (
    <section
      className="my-3 shadow-md bg-1 rounded-lg"
      style={{
        transition: "height 0.15s ease",
        height: partialTimeCommiter ? "auto" : "70px",
      }}
    >
      <div className="flex p-4">
        <div className="m:inline-block mb-4 m:mb-0 px-4 text-3xl text-1 font-mono mr-auto">
          {prettyTime}
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

        <button
          type="button"
          className="btn btn-danger align-top"
          onClick={() => handleResetTimer()}
        >
          <Icon name="x-circle" className="w-5 h-5" />
          {" Reset"}
        </button>
      </div>

      {partialTimeCommited !== false && (
        <form
          className="m:flex items-center p-4 show-ltr"
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
    </section>
  );
};

export default PomodoroTimer;
