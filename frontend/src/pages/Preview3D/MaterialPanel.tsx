interface MaterialPanelProps {
  color: string;
  onColorChange: (hex: string) => void;
  roughness: number;
  onRoughnessChange: (v: number) => void;
  metalness: number;
  onMetalnessChange: (v: number) => void;
}

export default function MaterialPanel({
  color,
  onColorChange,
  roughness,
  onRoughnessChange,
  metalness,
  onMetalnessChange,
}: MaterialPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)' }}>材质</h4>

      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', width: 60 }}>颜色</span>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          style={{
            width: 36,
            height: 28,
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          {color}
        </span>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', width: 60 }}>粗糙度</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={roughness}
          onChange={(e) => onRoughnessChange(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--muted)', width: 36, textAlign: 'right' }}>
          {roughness.toFixed(2)}
        </span>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', width: 60 }}>金属度</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={metalness}
          onChange={(e) => onMetalnessChange(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--muted)', width: 36, textAlign: 'right' }}>
          {metalness.toFixed(2)}
        </span>
      </label>
    </div>
  );
}
