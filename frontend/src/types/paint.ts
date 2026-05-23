export enum Brand {
  GW = 'GW',
  AV = 'AV',
  AK = 'AK',
  GSW = 'GSW',
  Scale75 = 'Scale75',
  ArmyPainter = 'ArmyPainter',
  Other = 'Other',
}

export interface Paint {
  id: string;
  userId: string;
  brand: Brand;
  code: string;
  name: string;
  r: number;
  g: number;
  b: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaintCreateRequest {
  brand: Brand;
  code: string;
  name: string;
  r: number;
  g: number;
  b: number;
}
