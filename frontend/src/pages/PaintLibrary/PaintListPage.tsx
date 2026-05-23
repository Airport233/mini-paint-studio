import { useState, useEffect, useCallback } from 'react';
import { fetchPaints, createPaint, deletePaint } from '../../services/paintService';
import type { Paint, Brand } from '../../types/paint';
import { Trash2 } from 'lucide-react';

const BRANDS: Brand[] = ['GW', 'AV', 'AK', 'GSW', 'Scale75', 'ArmyPainter', 'Other'];

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

export default function PaintListPage() {
  const [paints, setPaints] = useState<Paint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [addBrand, setAddBrand] = useState<Brand>('GW');
  const [addCode, setAddCode] = useState('');
  const [addName, setAddName] = useState('');
  const [addR, setAddR] = useState(128); const [addG, setAddG] = useState(128); const [addB, setAddB] = useState(128);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [addSaving, setAddSaving] = useState(false);

  const [delPaint, setDelPaint] = useState<Paint | null>(null);
  const [delSaving, setDelSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPaints(await fetchPaints({ brand: filter === 'all' ? undefined : filter })); }
    catch { setPaints([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = paints.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = Math.min(img.width, 1920);
      const ratio = w / img.width;
      canvas.width = w; canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.style.cursor = 'crosshair';
      canvas.onclick = (ce: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const sx = Math.round((ce.offsetX / rect.width) * canvas.width);
        const sy = Math.round((ce.offsetY / rect.height) * canvas.height);
        const px = canvas.getContext('2d')!.getImageData(sx, sy, 1, 1).data;
        setAddR(px[0]); setAddG(px[1]); setAddB(px[2]);
        setPickedColor(rgbToHex(px[0], px[1], px[2]));
      };
      const container = document.getElementById('picker-container');
      if (container) { container.innerHTML = ''; container.appendChild(canvas); }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleAdd = async () => {
    if (!addCode.trim() || !addName.trim()) return;
    setAddSaving(true);
    try {
      await createPaint({ brand: addBrand, code: addCode, name: addName, r: addR, g: addG, b: addB });
      setShowAdd(false); setPickedColor(null); setAddCode(''); setAddName('');
      load();
    } catch { /* ignore */ }
    finally { setAddSaving(false); }
  };

  const handleDelete = async () => {
    if (!delPaint) return;
    setDelSaving(true);
    try { await deletePaint(delPaint.id); setDelPaint(null); load(); }
    catch { /* ignore */ }
    finally { setDelSaving(false); }
  };

  return (
    <div>
      <h1>漆料库</h1>
      <p className="subtitle">管理你手头所有漆料 — 拍照取色，录入真实颜色</p>

      <div className="toolbar">
        <div className="chip-scroll">
          <span className={`chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>全部</span>
          {BRANDS.map((b) => (
            <span key={b} className={`chip${filter === b ? ' active' : ''}`} onClick={() => setFilter(b)}>{b}</span>
          ))}
        </div>
        <input type="text" placeholder="搜索..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border-solid)', borderRadius: 'var(--radius-sm)', color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 160 }} />
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ 添加漆料</button>
      </div>

      {loading ? (
        <div className="empty"><p>加载中...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p className="hint">上传漆料照片，点击取色即可录入真实颜色</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((p) => (
            <div key={p.id} className="card">
              <button className="del-btn" onClick={(e) => { e.stopPropagation(); setDelPaint(p); }}><Trash2 size={14} /></button>
              <div className="swatch" style={{ background: rgbToHex(p.r, p.g, p.b) }}>
                <span className="brand-tag">{p.brand}</span>
              </div>
              <div className="info">
                <div className="name">{p.name}</div>
                <div className="meta-row">
                  <span className="hex">{rgbToHex(p.r, p.g, p.b)}</span>
                  <span>{p.code}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>添加漆料</h2>
            <div className="field-row">
              <div className="field">
                <label>品牌</label>
                <select value={addBrand} onChange={(e) => setAddBrand(e.target.value as Brand)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--surface-warm)', border: '1px solid var(--border-solid)', borderRadius: 'var(--radius-sm)', color: 'var(--fg)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                  {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="field">
                <label>色号</label>
                <input type="text" placeholder="如 70.950" value={addCode} onChange={(e) => setAddCode(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>名称</label>
              <input type="text" placeholder="自定义名称" value={addName} onChange={(e) => setAddName(e.target.value)} />
            </div>
            <div className="field">
              <label>拍照取色</label>
              <div className="drop-zone">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImagePick} style={{ display: 'none' }} id="paint-image-input" />
                <label htmlFor="paint-image-input" style={{ cursor: 'pointer' }}>
                  <p>点击上传漆料照片，然后在图片上取色</p>
                </label>
              </div>
              <div id="picker-container" style={{ maxWidth: '100%', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }} />
            </div>
            {pickedColor && (
              <div className="sample-result">
                <span className="label-text">取色结果</span>
                <div className="cp-swatch" style={{ background: pickedColor }} />
                <div className="cp-rgb">
                  <div className="cp-field"><label>R</label><input type="number" min={0} max={255} value={addR} onChange={(e) => { setAddR(+e.target.value); setPickedColor(rgbToHex(+e.target.value, addG, addB)); }} /></div>
                  <div className="cp-field"><label>G</label><input type="number" min={0} max={255} value={addG} onChange={(e) => { setAddG(+e.target.value); setPickedColor(rgbToHex(addR, +e.target.value, addB)); }} /></div>
                  <div className="cp-field"><label>B</label><input type="number" min={0} max={255} value={addB} onChange={(e) => { setAddB(+e.target.value); setPickedColor(rgbToHex(addR, addG, +e.target.value)); }} /></div>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={addSaving}>{addSaving ? '添加中...' : '添加'}</button>
            </div>
          </div>
        </div>
      )}

      {delPaint && (
        <div className="overlay" onClick={() => setDelPaint(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 420 }}>
            <h2>确认删除</h2>
            <div className="confirm-body">
              <div className="paint-swatch-confirm" style={{ background: rgbToHex(delPaint.r, delPaint.g, delPaint.b) }} />
              <div className="paint-name">{delPaint.name}</div>
              <div className="paint-meta">{delPaint.brand} · {delPaint.code}</div>
              <p className="warn">此操作不可撤销，删除后无法恢复</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDelPaint(null)}>取消</button>
              <button className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={handleDelete} disabled={delSaving}>{delSaving ? '删除中...' : '确认删除'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
