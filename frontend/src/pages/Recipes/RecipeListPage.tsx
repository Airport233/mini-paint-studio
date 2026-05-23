import { useState, useEffect, useCallback } from 'react';
// import { Link } from 'react-router-dom';
import { fetchRecipes, deleteRecipe } from '../../services/recipeService';
import type { Recipe } from '../../types/recipe';
import RecipeCard from './RecipeCard';
import EmptyState from '../../components/EmptyState';

export default function RecipeListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const allTags = [...new Set(recipes.flatMap((r) => r.tags))];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecipes({
        search: search || undefined,
        tag: tagFilter || undefined,
      });
      setRecipes(data);
    } catch {
      // API not ready
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除此配方？')) return;
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // handle error
    }
  };

  return (
    <div>
      <h2
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--fg-2)',
          fontFamily: 'var(--font-display)',
          marginBottom: 'var(--space-6)',
        }}
      >
        配方库
      </h2>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <input
          type="text"
          placeholder="搜索配方名称..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'var(--surface-warm)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--fg)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
          }}
        />
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            background: 'var(--surface-warm)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--fg)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <option value="">所有标签</option>
          {allTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>加载中...</p>
      ) : recipes.length === 0 ? (
        <EmptyState message="还没有保存配方，去混色引擎试试" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onDelete={() => handleDelete(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
