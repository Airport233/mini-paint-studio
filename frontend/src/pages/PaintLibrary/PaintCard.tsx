import type { Paint } from '../../types/paint';

interface PaintCardProps {
  paint: Paint;
  onDelete: () => void;
}

export default function PaintCard({ paint, onDelete }: PaintCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-soft)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-sm)',
          background: `rgb(${paint.r},${paint.g},${paint.b})`,
          border: '2px solid var(--border)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--fg-2)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {paint.name || paint.code}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          {paint.brand} {paint.code}
        </p>
      </div>
      <button
        onClick={onDelete}
        style={{
          padding: '4px 8px',
          background: 'transparent',
          color: 'var(--danger)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          cursor: 'pointer',
        }}
      >
        删除
      </button>
    </div>
  );
}
