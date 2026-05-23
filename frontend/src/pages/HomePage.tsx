import { Link } from 'react-router-dom';
import { Palette, FlaskConical, Box, ClipboardList, Lightbulb } from 'lucide-react';

const features = [
  { to: '/paints', icon: Palette, title: '漆料库', desc: '拍照取色录入真实颜色，管理手头所有漆料库存', tag: '已实现' },
  { to: '/mix', icon: FlaskConical, title: '调色引擎', desc: '目标色 → 整数份数配方，从库存匹配最佳混合方案', tag: '已实现' },
  { to: '/color-wheel', icon: Palette, title: '色彩工具', desc: '互补色、三角色、类似色 — 弥补色彩理论短板', tag: '已实现' },
  { to: '/preview', icon: Box, title: '3D 预览', desc: '几何体 + STL 模型上预览材质和光照效果', tag: '开发中' },
  { to: '/recipes', icon: ClipboardList, title: '配方库', desc: '标签筛选 + 搜索，随手回看已保存的混色方案', tag: '开发中' },
  { to: '/lighting-presets', icon: Lightbulb, title: '灯光预设', desc: '保存并回放 3D 场景的多光源配置方案', tag: '开发中' },
];

export default function HomePage() {
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 0 48px' }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--fg-2)', marginBottom: 8 }}>
          <span style={{ color: 'var(--accent)' }}>Hobby</span>Mix
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
          微缩模型涂装玩家的配色工作站 — 录入漆料、计算配方、3D 预览、保存方案
        </p>
      </div>
      <div className="grid" style={{ maxWidth: 900, margin: '0 auto' }}>
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="card" style={{ flexDirection: 'column', gap: 10 }}>
            <f.icon size={32} />
            <div className="title" style={{ fontSize: 16, color: 'var(--fg-2)' }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{f.desc}</div>
            <span className="tag" style={f.tag === '开发中' ? { background: '#4e5058' } : undefined}>{f.tag}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
