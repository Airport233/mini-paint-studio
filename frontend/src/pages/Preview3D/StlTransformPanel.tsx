interface StlTransformPanelProps {
  rotation: { x: number; y: number; z: number };
  heightOffset: number;
  onRotationChange: (axis: 'x' | 'y' | 'z', value: number) => void;
  onHeightChange: (value: number) => void;
}

export default function StlTransformPanel({
  rotation,
  heightOffset,
  onRotationChange,
  onHeightChange,
}: StlTransformPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)' }}>STL 变换</h4>
      {(['x', 'y', 'z'] as const).map((axis) => (
        <label key={axis} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: 36 }}>
            旋转 {axis.toUpperCase()}
          </span>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={rotation[axis]}
            onChange={(e) => onRotationChange(axis, Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--muted)', width: 36, textAlign: 'right' }}>
            {rotation[axis]}°
          </span>
        </label>
      ))}
      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: 36 }}>高度</span>
        <input
          type="range"
          min={-3}
          max={3}
          step={0.1}
          value={heightOffset}
          onChange={(e) => onHeightChange(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--muted)', width: 36, textAlign: 'right' }}>
          {heightOffset.toFixed(1)}
        </span>
      </label>
    </div>
  );
}
