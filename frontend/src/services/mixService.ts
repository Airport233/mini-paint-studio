import api from './api';
import type { MixResponse } from '../types/mix';

export async function postMix(r: number, g: number, b: number): Promise<MixResponse> {
  const { data } = await api.post<MixResponse>('/api/mix', { r, g, b });
  return data;
}
