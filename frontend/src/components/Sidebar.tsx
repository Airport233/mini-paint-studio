import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Palette, FlaskConical, Box, ClipboardList, Lightbulb, CircleUser } from 'lucide-react';

const links = [
  { to: '/', label: '首页', icon: Palette },
  { to: '/paints', label: '漆料库', icon: Palette },
  { to: '/mix', label: '调色引擎', icon: FlaskConical },
  { to: '/color-wheel', label: '色彩工具', icon: Palette },
  { to: '/preview', label: '3D 预览', icon: Box },
  { to: '/recipes', label: '配方库', icon: ClipboardList },
  { to: '/lighting-presets', label: '灯光预设', icon: Lightbulb },
];

export default function Sidebar() {
  const { email, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="sidebar">
      <div className="brand">
        <span>Hobby</span>Mix
      </div>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
          <link.icon size={18} /> {link.label}
        </NavLink>
      ))}
      <div className="user-row">
        <CircleUser size={18} /> <span>{email || '未登录'}</span>
        <span className="logout" onClick={handleLogout}>退出</span>
      </div>
    </nav>
  );
}
