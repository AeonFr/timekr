import React, { useState, useEffect, useCallback, useRef } from "react";
import Icon from "./Icon";

interface PomodoroTimerProps {
  onCommitTime: (data: { amount: number | string }) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onCommitTime }) => {
  const [time, setTime] = useState(1500);
  const [timerStopped, setTimerStopped] = useState(true);
  const [partialTimeCommiter, setPartialTimeCommiter] = useState<
    number | false
  >(false);
  const timerRef = useRef<number | null>(null);

  // Load saved timer on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem("currentTimer");
    if (savedTimer) {
      setTime(Number(savedTimer));
      localStorage.removeItem("currentTimer");
    }
  }, []);

  // Save timer on unmount
  useEffect(() => {
    return () => {
      if (time > 0 && time < 1500) {
        localStorage.setItem("currentTimer", time.toString());
        setTimerStopped(true);
      }
    };
  }, []);

  // Format time with leading zeros
  const twoDigits = (num: number): string => {
    return ("0" + num).slice(-2);
  };

  const prettyTime = `${twoDigits(Math.floor(time / 60))}:${twoDigits(
    time % 60,
  )}`;

  // Timer tick function
  const tick = useCallback(() => {
    setTime((prevTime) => {
      if (prevTime > 0) {
        document.title = `(${twoDigits(
          Math.floor((prevTime - 1) / 60),
        )}:${twoDigits((prevTime - 1) % 60)}) Timekr`;
        return prevTime - 1;
      }
      return prevTime;
    });
  }, []);

  // Check if timer reached zero
  useEffect(() => {
    if (time === 0 && !timerStopped) {
      commitOnePomodoro();
      document.title = "Timekr";
      setTimerStopped(true);
    }
  }, [time, timerStopped]);

  // Timer interval
  useEffect(() => {
    if (!timerStopped && time > 0) {
      timerRef.current = window.setInterval(tick, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerStopped, tick]);

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
  const startTimer = () => {
    if (timerStopped === false) return;
    if (time === 0) setTime(1500);
    setTimerStopped(false);
    setPartialTimeCommiter(false);
  };

  const stopTimer = () => {
    if (timerStopped) return;
    setTimerStopped(true);
    if (time <= 1500) {
      setPartialTimeCommiter(Math.max(1, Math.round((1500 - time) / 60)));
    }
  };

  const resetTimer = (askConfirmation = true) => {
    if (
      askConfirmation &&
      !confirm("Are you sure you want to reset the timer?")
    ) {
      return;
    }
    setTimerStopped(true);
    setTime(1500);
    setPartialTimeCommiter(false);
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
    if (partialTimeCommiter !== false) {
      onCommitTime({ amount: partialTimeCommiter });
      resetTimer(false);
      setPartialTimeCommiter(false);
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
          onClick={timerStopped ? startTimer : stopTimer}
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
          onClick={resetTimer}
        >
          <Icon name="x-circle" className="w-5 h-5" />
          {" Reset"}
        </button>
      </div>

      {partialTimeCommiter !== false && (
        <form
          className="m:flex items-center p-4 show-ltr"
          onSubmit={commitPartialTime}
        >
          <div className="text-left px-4">
            Commit{" "}
            <span className="font-bold">
              {partialTimeCommiter} minute
              {partialTimeCommiter > 1 ? "s" : ""}
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
