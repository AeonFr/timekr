import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimerState {
  timers: Record<
    string,
    {
      time: number;
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
    timerStopped: boolean;
    partialTimeCommited: number | false;
  };
  cleanupTimers: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timers: {},

      startTimer: (projectSlug: string) => {
        const timers = get().timers;
        const currentTimer = timers[projectSlug] || {
          time: 1500,
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
          } else if (timer && !timer.timerStopped && timer.time === 0) {
            // Timer reached zero, update document title
            document.title = "Timekr";
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

          // Reset document title
          document.title = "Timekr";
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
                timerStopped: true,
                lastUpdated: Date.now(),
                intervalId: undefined,
              },
            },
          });

          // Reset document title
          document.title = "Timekr";
        }
      },

      getTimerState: (projectSlug: string) => {
        const timers = get().timers;
        const currentTimer = timers[projectSlug] || {
          time: 1500,
          timerStopped: true,
          lastUpdated: Date.now(),
        };

        // Calculate partial time committed (minutes spent)
        const partialTimeCommited =
          currentTimer.timerStopped && currentTimer.time < 1500
            ? Math.max(1, Math.round((1500 - currentTimer.time) / 60))
            : false;

        return {
          time: currentTimer.time,
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
    }),
    {
      name: "timekr-timer-storage",
      // Don't persist intervalId
      partialize: (state) => ({
        timers: Object.fromEntries(
          Object.entries(state.timers).map(([key, timer]) => [
            key,
            {
              time: timer.time,
              timerStopped: timer.timerStopped,
              lastUpdated: timer.lastUpdated,
            },
          ]),
        ),
      }),
    },
  ),
);

// Setup cleanup on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    useTimerStore.getState().cleanupTimers();
  });
}
