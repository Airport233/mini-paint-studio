import { useState, useEffect, useCallback } from 'react';
import { fetchPaints } from '../../services/paintService';
import type { Paint } from '../../types/paint';

export default function PaintListPage() {
  const [paints, setPaints] = useState<Paint[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setPaints(await fetchPaints({ brand: brandFilter || undefined })); } catch { setPaints([]); }
    finally { setLoading(false); }
  }, [brandFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page">
      <h1>漆料库</h1>
      <p className="subtitle">管理手头所有漆料，拍照取色录入真实颜色</p>
      <div className="toolbar">
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
          <option value="">全部品牌</option>
          <option value="GW">GW</option><option value="AV">AV</option><option value="AK">AK</option>
          <option value="GSW">GSW</option><option value="Scale75">Scale75</option>
          <option value="ArmyPainter">Army Painter</option><option value="Other">其他</option>
        </select>
      </div>
      {loading ? <div className="empty">加载中...</div> :
       paints.length === 0 ? <div className="empty">还没有录入漆料，点击添加第一瓶</div> :
       <div className="grid">
         {paints.map((p) => (
           <div key={p.id} className="card">
             <div className="paint-swatch" style={{ background: `rgb(${p.r},${p.g},${p.b})` }} />
             <div className="card-info">
               <div className="title">{p.name}</div>
               <div className="sub">{p.brand} · {p.code}</div>
             </div>
           </div>
         ))}
       </div>}
    </div>
  );
}
