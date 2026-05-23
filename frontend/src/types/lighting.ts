export interface LightSnapshot {
  type: 'directional' | 'point';
  position: { x: number; y: number; z: number };
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
  name: string;
  geometryType: 'sphere' | 'cube' | 'cylinder' | 'stl';
  geometryRefId: string | null;
  materialSnapshot: MaterialSnapshot;
  lightsSnapshot: LightSnapshot[];
  coverImagePath: string;
  createdAt: string;
}
