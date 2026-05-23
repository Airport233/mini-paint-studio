export interface Recipe {
  id: string;
  userId: string;
  name: string;
  tags: string[];
  targetR: number;
  targetG: number;
  targetB: number;
  mixSnapshots: unknown;
  cmyRef: unknown;
  notes: string;
  sourceImagePath: string | null;
  createdAt: string;
  updatedAt: string;
}
