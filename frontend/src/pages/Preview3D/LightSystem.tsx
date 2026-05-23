import { useState } from 'react';
import type { LightDef } from './Scene';

interface LightSystemProps {
  lights: LightDef[];
  onChange: (lights: LightDef[]) => void;
}

export default function LightSystem({ lights, onChange }: LightSystemProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const addLight = () => {
    if (lights.length >= 6) return;
    const idx = Math.max(...lights.map((l) => l.index), 0) + 1;
    onChange([
      ...lights,
      {
        index: idx,
        type: 'directional',
        position: [2, 3, 2],
        color: '#ffffff',
        intensity: 1.0,
        enabled: true,
      },
    ]);
  };

  const removeLight = (index: number) => {
    if (lights.length <= 1) return;
    onChange(lights.filter((l) => l.index !== index));
    if (selectedIndex === index) setSelectedIndex(null);
  };

  const updateLight = (index: number, patch: Partial<LightDef>) => {
    onChange(lights.map((l) => (l.index === index ? { ...l, ...patch } : l)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)' }}>
          光源 ({lights.length})
        </h4>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={addLight}
            disabled={lights.length >= 6}
            style={{
              padding: '2px 10px',
              background: lights.length >= 6 ? 'var(--surface-warm)' : 'var(--accent)',
              color: lights.length >= 6 ? 'var(--muted)' : 'var(--accent-on)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              cursor: lights.length >= 6 ? 'default' : 'pointer',
            }}
          >
            + 添加
          </button>
        </div>
      </div>

      {lights.map((light) => (
        <div
          key={light.index}
          onClick={() => setSelectedIndex(light.index)}
          style={{
            padding: 'var(--space-3)',
            background: selectedIndex === light.index ? 'var(--surface)' : 'var(--surface-warm)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${selectedIndex === light.index ? 'var(--accent)' : 'var(--border-soft)'}`,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-2)' }}>
              光源 {light.index}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateLight(light.index, { enabled: !light.enabled });
                }}
                style={{
                  padding: '1px 8px',
                  background: light.enabled ? 'var(--success)' : 'var(--surface-warm)',
                  color: light.enabled ? 'var(--accent-on)' : 'var(--muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                }}
              >
                {light.enabled ? '开' : '关'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLight(light.index);
                }}
                disabled={lights.length <= 1}
                style={{
                  padding: '1px 8px',
                  background: 'transparent',
                  color: lights.length <= 1 ? 'var(--muted)' : 'var(--danger)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  cursor: lights.length <= 1 ? 'default' : 'pointer',
                }}
              >
                删除
              </button>
            </div>
          </div>

          {selectedIndex === light.index && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {(['x', 'y', 'z'] as const).map((axis, i) => (
                <label key={axis} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: 12 }}>
                    {axis.toUpperCase()}
                  </span>
                  <input
                    type="range"
                    min={-5}
                    max={5}
                    step={0.1}
                    value={light.position[i]}
                    onChange={(e) => {
                      const pos = [...light.position] as [number, number, number];
                      pos[i] = Number(e.target.value);
                      updateLight(light.index, { position: pos });
                    }}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--muted)', width: 30, textAlign: 'right' }}>
                    {light.position[i].toFixed(1)}
                  </span>
                </label>
              ))}

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: 36 }}>强度</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={light.intensity}
                  onChange={(e) => updateLight(light.index, { intensity: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--muted)', width: 30, textAlign: 'right' }}>
                  {light.intensity.toFixed(1)}
                </span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', width: 36 }}>颜色</label>
                <input
                  type="color"
                  value={light.color}
                  onChange={(e) => updateLight(light.index, { color: e.target.value })}
                  style={{ width: 28, height: 24, border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                />
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>色温</span>
                  <input
                    type="range"
                    min={2000}
                    max={10000}
                    step={100}
                    value={5500}
                    onChange={() => {}}
                    style={{ flex: 1 }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
