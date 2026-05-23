export interface MixRequest {
  r: number;
  g: number;
  b: number;
}

export interface PaintPart {
  paintId: string | null;
  brand: string;
  code: string;
  name: string;
  parts: number;
  trace: boolean;
}

export interface MixCandidate {
  paints: PaintPart[];
  mixedR: number;
  mixedG: number;
  mixedB: number;
  deviation: number;
}

export interface MixResponse {
  candidates: MixCandidate[];
  cmyRef: PaintPart[];
  message: string | null;
}
