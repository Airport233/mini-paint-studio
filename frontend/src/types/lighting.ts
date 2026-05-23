export interface LightSnapshot {
  type: 'directional' | 'point';
  pos: { x: number; y: number; z: number };
  hex: string;
  colorTemp: number | null;
  intensity: number;
  enabled: boolean;
}

export interface MaterialSnapshot {
  r: number;
  g: number;
  b: number;
  roughness: number;
  metalness: number;
}

export interface LightingPreset {
  id: string;
  userId: string;
  name: string;
  geometryType: 'sphere' | 'cube' | 'cylinder' | 'stl';
  geometryRefId: string | null;
  materialSnapshot: MaterialSnapshot;
  lightsSnapshot: LightSnapshot[];
  coverImagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LightingPresetRequest {
  name: string;
  geometryType: string;
  geometryRefId: string | null;
  materialSnapshot: MaterialSnapshot;
  lightsSnapshot: LightSnapshot[];
  coverBase64: string | null;
}
