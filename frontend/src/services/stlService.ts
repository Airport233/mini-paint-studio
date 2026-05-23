import api from './api';
import type { StlFile } from '../types/stl';

export async function fetchStls(): Promise<StlFile[]> {
  const { data } = await api.get<StlFile[]>('/api/stl');
  return data;
}

export async function uploadStl(file: File): Promise<StlFile> {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post<StlFile>('/api/stl/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateStl(
  id: string,
  body: Partial<StlFile>,
): Promise<StlFile> {
  const { data } = await api.put<StlFile>(`/api/stl/${id}`, body);
  return data;
}

export async function deleteStl(id: string): Promise<void> {
  await api.delete(`/api/stl/${id}`);
}
