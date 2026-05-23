import api from './api';
import type { LightingPreset, LightingPresetRequest } from '../types/lighting';

export async function fetchPresets(): Promise<LightingPreset[]> {
  const { data } = await api.get<LightingPreset[]>('/api/lighting-presets');
  return data;
}

export async function createPreset(
  body: LightingPresetRequest,
): Promise<LightingPreset> {
  const { data } = await api.post<LightingPreset>('/api/lighting-presets', body);
  return data;
}

export async function updatePreset(
  id: string,
  body: Partial<LightingPresetRequest>,
): Promise<LightingPreset> {
  const { data } = await api.put<LightingPreset>(
    `/api/lighting-presets/${id}`,
    body,
  );
  return data;
}

export async function deletePreset(id: string): Promise<void> {
  await api.delete(`/api/lighting-presets/${id}`);
}
