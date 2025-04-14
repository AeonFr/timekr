import { create } from "zustand";
import useStore from "../store";

interface TimerState {
  timers: Record<
    string,
    {
      time: number;
      initialTime: number;
      timerStopped: boolean;
      lastUpdated: number;
      intervalId?: number;
    }
  >;
  startTimer: (projectSlug: string) => void;
  stopTimer: (projectSlug: string) => void;
  resetTimer: (projectSlug: string) => void;
  getTimerState: (projectSlug: string) => {
    time: number;
    initialTime: number;
    timerStopped: boolean;
    partialTimeCommited: number | false;
  };
  cleanupTimers: () => void;
  setCustomTime: (projectSlug: string, minutes: number) => void;
  commitTime: (projectSlug: string, amount: number | string) => void;
}

export const useTimerStore = create<TimerState>()((set, get) => ({
  timers: {},

  startTimer: (projectSlug: string) => {
    const timers = get().timers;
    const currentTimer = timers[projectSlug] || {
      time: 1500,
      initialTime: 1500,
      timerStopped: true,
      lastUpdated: Date.now(),
    };

    // If timer is at 0, reset it
    if (currentTimer.time === 0) {
      currentTimer.time = 1500;
    }

    // Clear any existing interval
    if (currentTimer.intervalId) {
      window.clearInterval(currentTimer.intervalId);
    }

    // Create a new interval
    const intervalId = window.setInterval(() => {
      const store = get();
      const timers = store.timers;
      const timer = timers[projectSlug];

      if (timer && !timer.timerStopped && timer.time > 0) {
        // Decrement the timer
        set({
          timers: {
            ...timers,
            [projectSlug]: {
              ...timer,
              time: timer.time - 1,
              lastUpdated: Date.now(),
            },
          },
        });
        
        // Check if timer reached zero after decrementing
        if (timer.time - 1 === 0) {
          // Timer reached zero, commit the time
          const minutesToCommit = Math.round(timer.initialTime / 60);
          store.commitTime(projectSlug, minutesToCommit);
          
          // Stop the timer
          store.stopTimer(projectSlug);
        }
      }
    }, 1000);

    set({
      timers: {
        ...timers,
        [projectSlug]: {
          ...currentTimer,
          timerStopped: false,
          lastUpdated: Date.now(),
          intervalId: intervalId,
        },
      },
    });
  },

  stopTimer: (projectSlug: string) => {
    const timers = get().timers;
    const currentTimer = timers[projectSlug];

    if (currentTimer) {
      // Clear the interval
      if (currentTimer.intervalId) {
        window.clearInterval(currentTimer.intervalId);
      }

      set({
        timers: {
          ...timers,
          [projectSlug]: {
            ...currentTimer,
            timerStopped: true,
            lastUpdated: Date.now(),
            intervalId: undefined,
          },
        },
      });
    }
  },

  resetTimer: (projectSlug: string) => {
    const timers = get().timers;
    const currentTimer = timers[projectSlug];

    if (currentTimer) {
      // Clear the interval
      if (currentTimer.intervalId) {
        window.clearInterval(currentTimer.intervalId);
      }

      set({
        timers: {
          ...timers,
          [projectSlug]: {
            ...currentTimer,
            time: 1500,
            initialTime: 1500,
            timerStopped: true,
            lastUpdated: Date.now(),
            intervalId: undefined,
          },
        },
      });
    }
  },

  getTimerState: (projectSlug: string) => {
    const timers = get().timers;
    const currentTimer = timers[projectSlug] || {
      time: 1500,
      initialTime: 1500,
      timerStopped: true,
      lastUpdated: Date.now(),
    };

    // Calculate partial time committed (minutes spent)
    const partialTimeCommited =
      currentTimer.timerStopped && currentTimer.time < currentTimer.initialTime
        ? Math.max(
            1,
            Math.round((currentTimer.initialTime - currentTimer.time) / 60),
          )
        : false;

    return {
      time: currentTimer.time,
      initialTime: currentTimer.initialTime,
      timerStopped: currentTimer.timerStopped,
      partialTimeCommited,
    };
  },

  cleanupTimers: () => {
    const timers = get().timers;

    // Clear all intervals
    Object.values(timers).forEach((timer) => {
      if (timer.intervalId) {
        window.clearInterval(timer.intervalId);
      }
    });
  },

  setCustomTime: (projectSlug: string, minutes: number) => {
    const timers = get().timers;
    const currentTimer = timers[projectSlug] || {
      time: 1500,
      initialTime: 1500,
      timerStopped: true,
      lastUpdated: Date.now(),
    };

    // Convert minutes to seconds
    const timeInSeconds = minutes * 60;

    set({
      timers: {
        ...timers,
        [projectSlug]: {
          ...currentTimer,
          time: timeInSeconds,
          initialTime: timeInSeconds,
          timerStopped: true,
          lastUpdated: Date.now(),
        },
      },
    });
  },
  
  commitTime: (projectSlug: string, amount: number | string) => {
    // Get the commitTime function from the main store
    const mainStore = useStore.getState();
    
    // Commit the time to the project
    mainStore.commitTime(projectSlug, amount);
    
    // Play sound effect (this will only work if the page is active)
    if (typeof window !== "undefined") {
      try {
        const beep = () => {
          const context = new (window.AudioContext || 
            (window as any).webkitAudioContext)();
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

        // Play beep sound pattern
        beep();
        const interval = 800;
        setTimeout(() => {
          beep();
          setTimeout(() => {
            beep();
            setTimeout(beep, interval);
          }, interval);
        }, interval);
      } catch (e) {
        console.error("Failed to play sound:", e);
      }
    }
  },
}));

// Setup cleanup and confirmation on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", (event) => {
    const state = useTimerStore.getState();
    const timers = state.timers;

    // Check if any timer is running
    const anyTimerRunning = Object.values(timers).some(
      (timer) => !timer.timerStopped && timer.time > 0,
    );

    // If any timer is running, show confirmation dialog
    if (anyTimerRunning) {
      // Standard way to show confirmation dialog
      const message =
        "You have timers running. Are you sure you want to leave?";
      event.preventDefault();
      event.returnValue = message; // For older browsers
      return message;
    }

    // Always clean up timers
    state.cleanupTimers();
  });
}
