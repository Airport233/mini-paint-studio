import { useState, useEffect, useCallback } from 'react';
import { fetchPresets, deletePreset } from '../../services/lightingPresetService';
import type { LightingPreset } from '../../types/lighting';
import PresetCard from './PresetCard';
import EmptyState from '../../components/EmptyState';

export default function PresetListPage() {
  const [presets, setPresets] = useState<LightingPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPresets();
      setPresets(data);
    } catch {
      // API not ready
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除此打光方案？')) return;
    try {
      await deletePreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
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
        打光方案
      </h2>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>加载中...</p>
      ) : presets.length === 0 ? (
        <EmptyState message="还没有保存打光方案，去 3D 预览中保存" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {presets.map((p) => (
            <PresetCard key={p.id} preset={p} onDelete={() => handleDelete(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
