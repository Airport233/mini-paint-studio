import { create } from 'zustand';

export interface SelectedColor {
  r: number;
  g: number;
  b: number;
  sourcePage: string;
}

interface ColorState {
  selectedColor: SelectedColor | null;
  setSelectedColor: (r: number, g: number, b: number, sourcePage: string) => void;
  clearSelectedColor: () => void;
}

export const useColorStore = create<ColorState>((set) => ({
  selectedColor: null,
  setSelectedColor: (r, g, b, sourcePage) =>
    set({ selectedColor: { r, g, b, sourcePage } }),
  clearSelectedColor: () => set({ selectedColor: null }),
}));
