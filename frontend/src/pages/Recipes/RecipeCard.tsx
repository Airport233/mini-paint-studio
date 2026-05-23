import { Link } from 'react-router-dom';
import type { Recipe } from '../../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: () => void;
}

export default function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      style={{
        display: 'block',
        padding: 'var(--space-4)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-soft)',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            background: `rgb(${recipe.targetR},${recipe.targetG},${recipe.targetB})`,
            border: '2px solid var(--border)',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {recipe.name}
          </p>
        </div>
      </div>
      {recipe.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 'var(--space-2)' }}>
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '1px 8px',
                background: 'rgba(88, 101, 242, 0.15)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-xs)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--meta)' }}>
        {new Date(recipe.createdAt).toLocaleDateString('zh-CN')}
      </p>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        style={{
          marginTop: 'var(--space-2)',
          padding: '2px 8px',
          background: 'transparent',
          color: 'var(--danger)',
          border: 'none',
          fontSize: 'var(--text-xs)',
          cursor: 'pointer',
        }}
      >
        删除
      </button>
    </Link>
  );
}
