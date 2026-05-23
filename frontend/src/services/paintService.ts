import api from './api';
import type { Paint, PaintCreateRequest } from '../types/paint';

export async function fetchPaints(params?: {
  brand?: string;
  sort?: string;
  page?: number;
}): Promise<Paint[]> {
  const { data } = await api.get<Paint[]>('/api/paints', { params });
  return data;
}

export async function createPaint(body: PaintCreateRequest): Promise<Paint> {
  const { data } = await api.post<Paint>('/api/paints', body);
  return data;
}

export async function updatePaint(id: string, body: PaintCreateRequest): Promise<Paint> {
  const { data } = await api.put<Paint>(`/api/paints/${id}`, body);
  return data;
}

export async function deletePaint(id: string): Promise<{ recipeRefs?: number }> {
  const { data } = await api.delete(`/api/paints/${id}`);
  return data;
}
