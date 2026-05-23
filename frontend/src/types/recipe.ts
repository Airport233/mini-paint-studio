import type { MixCandidate, PaintPart } from './mix';

export interface Recipe {
  id: string;
  name: string;
  tags: string[];
  targetR: number;
  targetG: number;
  targetB: number;
  mixSnapshots: MixCandidate[];
  cmyRef: PaintPart[];
  notes: string;
  createdAt: string;
}
