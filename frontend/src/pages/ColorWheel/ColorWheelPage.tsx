import ColorWheelPanel from '../../components/ColorWheelPanel';
import { useColorStore } from '../../store/colorStore';

export default function ColorWheelPage() {
  const selectedColor = useColorStore((s) => s.selectedColor);

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
        色轮工具
      </h2>

      <p
        style={{
          color: 'var(--muted)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-6)',
          maxWidth: 560,
        }}
      >
        选择主色调，自动计算互补色、三等分色、邻近色和分裂互补色。选色后可直接传入 3D 预览染色或混色引擎计算。
      </p>

      <div style={{ maxWidth: 360 }}>
        <ColorWheelPanel sourcePage="color-wheel" />
      </div>

      {selectedColor && selectedColor.sourcePage === 'color-wheel' && (
        <div
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)', marginBottom: 'var(--space-2)' }}>
            当前选中颜色
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--fg)' }}>
            RGB({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
          </p>
        </div>
      )}
    </div>
  );
}
