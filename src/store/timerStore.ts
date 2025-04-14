import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  timers: Record<string, {
    time: number;
    timerStopped: boolean;
    lastUpdated: number;
  }>;
  startTimer: (projectSlug: string) => void;
  stopTimer: (projectSlug: string) => void;
  resetTimer: (projectSlug: string) => void;
  tick: (projectSlug: string) => void;
  getTimerState: (projectSlug: string) => {
    time: number;
    timerStopped: boolean;
    partialTimeCommited: number | false;
  };
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timers: {},
      
      startTimer: (projectSlug: string) => {
        const timers = get().timers;
        const currentTimer = timers[projectSlug] || { time: 1500, timerStopped: true, lastUpdated: Date.now() };
        
        // If timer is at 0, reset it
        if (currentTimer.time === 0) {
          currentTimer.time = 1500;
        }
        
        set({
          timers: {
            ...timers,
            [projectSlug]: {
              ...currentTimer,
              timerStopped: false,
              lastUpdated: Date.now(),
            }
          }
        });
      },
      
      stopTimer: (projectSlug: string) => {
        const timers = get().timers;
        const currentTimer = timers[projectSlug];
        
        if (currentTimer) {
          set({
            timers: {
              ...timers,
              [projectSlug]: {
                ...currentTimer,
                timerStopped: true,
                lastUpdated: Date.now(),
              }
            }
          });
        }
      },
      
      resetTimer: (projectSlug: string) => {
        const timers = get().timers;
        const currentTimer = timers[projectSlug];
        
        if (currentTimer) {
          set({
            timers: {
              ...timers,
              [projectSlug]: {
                ...currentTimer,
                time: 1500,
                timerStopped: true,
                lastUpdated: Date.now(),
              }
            }
          });
        }
      },
      
      tick: (projectSlug: string) => {
        const timers = get().timers;
        const currentTimer = timers[projectSlug];
        
        if (currentTimer && !currentTimer.timerStopped && currentTimer.time > 0) {
          set({
            timers: {
              ...timers,
              [projectSlug]: {
                ...currentTimer,
                time: currentTimer.time - 1,
                lastUpdated: Date.now(),
              }
            }
          });
        }
      },
      
      getTimerState: (projectSlug: string) => {
        const timers = get().timers;
        const currentTimer = timers[projectSlug] || { time: 1500, timerStopped: true, lastUpdated: Date.now() };
        
        // Calculate partial time committed (minutes spent)
        const partialTimeCommited = currentTimer.timerStopped && currentTimer.time < 1500 
          ? Math.max(1, Math.round((1500 - currentTimer.time) / 60))
          : false;
        
        return {
          time: currentTimer.time,
          timerStopped: currentTimer.timerStopped,
          partialTimeCommited
        };
      }
    }),
    {
      name: 'timekr-timer-storage',
    }
  )
);
