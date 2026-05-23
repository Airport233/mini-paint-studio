import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const NAV_ITEMS = [
  { to: '/paints', label: '漆料库', icon: '🎨' },
  { to: '/mix', label: '混色引擎', icon: '⚗' },
  { to: '/preview', label: '3D 预览', icon: '🔮' },
  { to: '/recipes', label: '配方库', icon: '📋' },
  { to: '/lighting-presets', label: '打光方案', icon: '💡' },
  { to: '/color-wheel', label: '色轮', icon: '🌈' },
];

const linkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--meta)',
  textDecoration: 'none',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  transition: 'background var(--motion-fast) var(--ease-standard), color var(--motion-fast) var(--ease-standard)',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  background: 'rgba(88, 101, 242, 0.15)',
  color: 'var(--fg-2)',
};

export default function Sidebar() {
  const { email, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: '100%',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          padding: 'var(--space-4) var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--border)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--fg-2)',
            fontFamily: 'var(--font-display)',
          }}
        >
          涂装工作站
        </h1>
        {email && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>
            {email}
          </p>
        )}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 'auto',
          padding: 'var(--space-2) var(--space-4)',
          background: 'transparent',
          color: 'var(--muted)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-sm)',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        退出登录
      </button>
    </aside>
  );
}
