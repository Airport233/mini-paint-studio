type GeometryType = 'sphere' | 'cube' | 'cylinder';

interface GeometrySelectorProps {
  value: GeometryType;
  onChange: (g: GeometryType) => void;
}

const GEOMETRIES: { key: GeometryType; label: string }[] = [
  { key: 'sphere', label: '球体' },
  { key: 'cube', label: '立方体' },
  { key: 'cylinder', label: '圆柱体' },
];

export default function GeometrySelector({ value, onChange }: GeometrySelectorProps) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      {GEOMETRIES.map((g) => (
        <button
          key={g.key}
          onClick={() => onChange(g.key)}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: value === g.key ? 'var(--accent)' : 'var(--surface-warm)',
            color: value === g.key ? 'var(--accent-on)' : 'var(--fg)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
