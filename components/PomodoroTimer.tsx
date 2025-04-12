import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from './Icon';
import './PomodoroTimer.css';

interface PomodoroTimerProps {
  onCommitTime: (data: { amount: number | string }) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onCommitTime }) => {
  const [time, setTime] = useState(1500);
  const [timerStopped, setTimerStopped] = useState(true);
  const [partialTimeCommiter, setPartialTimeCommiter] = useState<number | false>(false);
  const timerRef = useRef<number | null>(null);

  // Load saved timer on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem('currentTimer');
    if (savedTimer) {
      setTime(Number(savedTimer));
      localStorage.removeItem('currentTimer');
    }
  }, []);

  // Save timer on unmount
  useEffect(() => {
    return () => {
      if (time > 0 && time < 1500) {
        localStorage.setItem('currentTimer', time.toString());
        setTimerStopped(true);
      }
    };
  }, [time]);

  // Format time with leading zeros
  const twoDigits = (num: number): string => {
    return ("0" + num).slice(-2);
  };

  const prettyTime = `${twoDigits(Math.floor(time/60))}:${twoDigits(time % 60)}`;

  // Timer tick function
  const tick = useCallback(() => {
    setTime(prevTime => {
      if (prevTime > 0) {
        document.title = `(${twoDigits(Math.floor((prevTime-1)/60))}:${twoDigits((prevTime-1) % 60)}) Timekr`;
        return prevTime - 1;
      }
      return prevTime;
    });
  }, []);

  // Check if timer reached zero
  useEffect(() => {
    if (time === 0 && !timerStopped) {
      commitOnePomodoro();
      document.title = 'Timekr';
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
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.value = 830.6;
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(0);
    
    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(
        0.00001, context.currentTime + 0.04
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

  const resetTimer = () => {
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
      resetTimer();
      setPartialTimeCommiter(false);
    }
  };

  return (
    <section>
      <div className="block my-3 p-4 shadow-md bg-1 rounded-lg text-center">
        <div className="m:inline-block mb-4 m:mb-0 px-4 text-3xl text-1 font-mono">
          {prettyTime}
        </div>

        <button
          type="button"
          className="btn btn-primary align-top"
          onClick={startTimer}
        >
          <Icon name="play"/>
          Start
        </button>

        <button
          type="button"
          className="btn btn-default align-top"
          onClick={stopTimer}
        >
          <Icon name="pause"/>
          Stop
        </button>

        <button
          type="button"
          className="btn btn-danger align-top"
          onClick={resetTimer}
        >
          <Icon name="refresh-ccw"/>
          Reset
        </button>
      </div>
      
      {partialTimeCommiter !== false && (
        <form
          className="m:flex items-center p-2 bg-1 shadow-md my-2 rounded-lg show-ltr"
          onSubmit={commitPartialTime}
        >
          <div className="font-bold text-left m-2">
            Commit {partialTimeCommiter} minute{partialTimeCommiter > 1 ? 's' : ''}
            and reset?
          </div>
          <button
            type="submit"
            className="ml-auto btn btn-primary"
          >
            Commit
          </button>
          <button
            type="button"
            className="btn btn-default ml-1"
            onClick={() => setPartialTimeCommiter(false)}
          >
            Cancel
          </button>
        </form>
      )}
    </section>
  );
};

export default PomodoroTimer;
