import { Link } from 'react-router-dom';
import type { LightingPreset } from '../../types/lighting';

interface PresetCardProps {
  preset: LightingPreset;
  onDelete: () => void;
}

export default function PresetCard({ preset, onDelete }: PresetCardProps) {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-soft)',
      }}
    >
      {preset.coverImagePath ? (
        <img
          src={preset.coverImagePath}
          alt={preset.name}
          style={{
            width: '100%',
            height: 140,
            objectFit: 'cover',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-3)',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 140,
            background: 'var(--surface-warm)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--meta)',
            fontSize: 'var(--text-xs)',
          }}
        >
          无封面
        </div>
      )}

      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-2)', marginBottom: 4 }}>
        {preset.name}
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--meta)', marginBottom: 'var(--space-3)' }}>
        {preset.geometryType} · {new Date(preset.createdAt).toLocaleDateString('zh-CN')}
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Link
          to={`/preview?preset=${preset.id}`}
          style={{
            padding: '4px 12px',
            background: 'var(--accent)',
            color: 'var(--accent-on)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          应用
        </Link>
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
    </div>
  );
}
