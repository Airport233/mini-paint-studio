import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchRecipe } from '../../services/recipeService';
import type { Recipe } from '../../types/recipe';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchRecipe(id)
      .then(setRecipe)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: 'var(--muted)' }}>加载中...</p>;
  if (!recipe) return <p style={{ color: 'var(--danger)' }}>配方未找到</p>;

  return (
    <div>
      <Link
        to="/recipes"
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--muted)',
          marginBottom: 'var(--space-4)',
          display: 'inline-block',
        }}
      >
        ← 返回配方列表
      </Link>

      <h2
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--fg-2)',
          fontFamily: 'var(--font-display)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {recipe.name}
      </h2>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-soft)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-sm)',
            background: `rgb(${recipe.targetR},${recipe.targetG},${recipe.targetB})`,
            border: '2px solid var(--border-soft)',
          }}
        />
        <div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>目标色</p>
          <p style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>
            RGB({recipe.targetR}, {recipe.targetG}, {recipe.targetB})
          </p>
        </div>
      </div>

      {recipe.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-4)' }}>
          {recipe.tags.map((t) => (
            <span
              key={t}
              style={{
                padding: '2px 10px',
                background: 'rgba(88, 101, 242, 0.15)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-xs)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {recipe.notes && (
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'var(--surface-warm)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg)' }}>{recipe.notes}</p>
        </div>
      )}

      <Link
        to={`/preview?r=${recipe.targetR}&g=${recipe.targetG}&b=${recipe.targetB}`}
        style={{
          display: 'inline-block',
          padding: 'var(--space-2) var(--space-6)',
          background: 'var(--accent)',
          color: 'var(--accent-on)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        在 3D 中预览
      </Link>
    </div>
  );
}
