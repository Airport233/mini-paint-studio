import { useState, useEffect, useCallback } from 'react';
import { fetchPaints, deletePaint } from '../../services/paintService';
import type { Paint } from '../../types/paint';
import PaintCard from './PaintCard';
import AddPaintDialog from './AddPaintDialog';
import EmptyState from '../../components/EmptyState';
import { Brand } from '../../types/paint';

export default function PaintListPage() {
  const [paints, setPaints] = useState<Paint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [sort, setSort] = useState<'newest' | 'hue'>('newest');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPaints({
        brand: brandFilter || undefined,
        sort,
      });
      setPaints(data);
    } catch {
      // API not ready yet — show empty
    } finally {
      setLoading(false);
    }
  }, [brandFilter, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    try {
      const result = await deletePaint(id);
      if (result.recipeRefs && result.recipeRefs > 0) {
        if (!window.confirm(`${result.recipeRefs} 个配方正在使用此漆，确定删除？`)) return;
      }
      setPaints((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // handle error silently
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--fg-2)',
            fontFamily: 'var(--font-display)',
          }}
        >
          漆料库
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: 'var(--space-2) var(--space-6)',
            background: 'var(--accent)',
            color: 'var(--accent-on)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          添加漆料
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--surface-warm)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--fg)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <option value="">所有品牌</option>
          {Object.values(Brand).map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'newest' | 'hue')}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--surface-warm)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--fg)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <option value="newest">按录入时间</option>
          <option value="hue">按色系</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>加载中...</p>
      ) : paints.length === 0 ? (
        <EmptyState
          message="还没有录入漆料，点击添加第一瓶"
          action={{ label: '添加漆料', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {paints.map((p) => (
            <PaintCard key={p.id} paint={p} onDelete={() => handleDelete(p.id)} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddPaintDialog
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}
