import { create } from 'zustand';

interface TerminalStore {
  isOpen: boolean;
  open:   () => void;
  close:  () => void;
  toggle: () => void;
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  isOpen: false,
  open:   () => set({ isOpen: true }),
  close:  () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
