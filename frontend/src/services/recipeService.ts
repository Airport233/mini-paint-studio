import api from './api';
import type { Recipe } from '../types/recipe';

export async function fetchRecipes(params?: {
  tag?: string;
  search?: string;
}): Promise<Recipe[]> {
  const { data } = await api.get<Recipe[]>('/api/recipes', { params });
  return data;
}

export async function fetchRecipe(id: string): Promise<Recipe> {
  const { data } = await api.get<Recipe>(`/api/recipes/${id}`);
  return data;
}

export async function saveRecipe(body: {
  name: string;
  tags: string[];
  notes: string;
  mixSnapshots: unknown;
  cmyRef: unknown;
}): Promise<Recipe> {
  const { data } = await api.post<Recipe>('/api/recipes', body);
  return data;
}

export async function updateRecipe(
  id: string,
  body: { name?: string; tags?: string[]; notes?: string },
): Promise<Recipe> {
  const { data } = await api.put<Recipe>(`/api/recipes/${id}`, body);
  return data;
}

export async function deleteRecipe(id: string): Promise<void> {
  await api.delete(`/api/recipes/${id}`);
}
