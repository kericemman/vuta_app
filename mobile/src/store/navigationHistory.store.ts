import { create } from "zustand";

const maxHistoryEntries = 40;

type NavigationHistoryState = {
  entries: string[];
  popBackTarget: () => string | null;
  record: (href: string) => void;
  reset: () => void;
};

export const useNavigationHistoryStore = create<NavigationHistoryState>(
  (set, get) => ({
    entries: [],

    popBackTarget: () => {
      const { entries } = get();

      if (entries.length < 2) {
        return null;
      }

      const nextEntries = entries.slice(0, -1);
      const target = nextEntries[nextEntries.length - 1] || null;

      set({ entries: nextEntries });

      return target;
    },

    record: (href) => {
      if (!href) {
        return;
      }

      set((state) => {
        const current = state.entries[state.entries.length - 1];

        if (current === href) {
          return state;
        }

        return {
          entries: [...state.entries, href].slice(-maxHistoryEntries),
        };
      });
    },

    reset: () => set({ entries: [] }),
  })
);
