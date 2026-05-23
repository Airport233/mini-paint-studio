export type Brand = 'GW' | 'AV' | 'AK' | 'GSW' | 'Scale75' | 'ArmyPainter' | 'Other';

export interface Paint {
  id: string;
  brand: Brand;
  code: string;
  name: string;
  r: number;
  g: number;
  b: number;
  createdAt: string;
}

export interface PaintCreateRequest {
  brand: Brand;
  code: string;
  name: string;
  r: number;
  g: number;
  b: number;
}
