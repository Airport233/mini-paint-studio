import api from './api';

export interface ColorScheme {
  r: number;
  g: number;
  b: number;
  label: string;
}

export async function getComplementary(
  r: number, g: number, b: number,
): Promise<ColorScheme[]> {
  const { data } = await api.get<ColorScheme[]>(
    '/api/color-wheel/complementary',
    { params: { r, g, b } },
  );
  return data;
}

export async function getTriadic(
  r: number, g: number, b: number,
): Promise<ColorScheme[]> {
  const { data } = await api.get<ColorScheme[]>(
    '/api/color-wheel/triadic',
    { params: { r, g, b } },
  );
  return data;
}

export async function getAnalogous(
  r: number, g: number, b: number,
): Promise<ColorScheme[]> {
  const { data } = await api.get<ColorScheme[]>(
    '/api/color-wheel/analogous',
    { params: { r, g, b } },
  );
  return data;
}

export async function getSplitComplementary(
  r: number, g: number, b: number,
): Promise<ColorScheme[]> {
  const { data } = await api.get<ColorScheme[]>(
    '/api/color-wheel/split-complementary',
    { params: { r, g, b } },
  );
  return data;
}
