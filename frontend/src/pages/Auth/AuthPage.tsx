import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { register, login, forgotPassword } from '../../services/authService';
import type { AxiosError } from 'axios';

type Tab = 'login' | 'register' | 'forgot';

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMsg, setServerMsg] = useState<{ type: 'err' | 'ok'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const authLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = '请输入邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = '邮箱格式不正确';
    if (tab !== 'forgot') {
      if (!password) e.password = '请输入密码';
      else if (password.length < 8) e.password = '密码长度不足 8 位';
    }
    if (tab === 'register' && password !== confirmPassword) e.confirmPassword = '两次输入的密码不一致';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerMsg(null);
    if (!validate()) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await login(email, password);
        authLogin(res.token, res.email);
        navigate('/');
      } else if (tab === 'register') {
        const res = await register(email, password);
        authLogin(res.token, res.email);
        navigate('/');
      } else {
        await forgotPassword(email);
        setServerMsg({ type: 'ok', text: '如果该邮箱已注册，重置链接已发送' });
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setServerMsg({ type: 'err', text: axiosErr.response?.data?.message || '操作失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'login', label: '登录' },
    { key: 'register', label: '注册' },
    { key: 'forgot', label: '忘记密码' },
  ];

  return (
    <div className="auth-center">
      <div className="auth-card">
        <div className="brand"><span>Hobby</span>Mix</div>

        <div className="auth-tabs">
          {tabs.map((t) => (
            <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => { setTab(t.key); setErrors({}); setServerMsg(null); }}>
              {t.label}
            </button>
          ))}
        </div>

        {serverMsg && <div className={`auth-msg ${serverMsg.type}`}>{serverMsg.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>邮箱</label>
            <input type="email" placeholder="请输入邮箱" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? 'error' : ''} />
            {errors.email && <div className="field-err">{errors.email}</div>}
          </div>

          {tab !== 'forgot' && (
            <div className="auth-field">
              <label>密码</label>
              <input type="password" placeholder="至少 8 位字母或数字" value={password} onChange={(e) => setPassword(e.target.value)} className={errors.password ? 'error' : ''} />
              {errors.password && <div className="field-err">{errors.password}</div>}
            </div>
          )}

          {tab === 'register' && (
            <div className="auth-field">
              <label>确认密码</label>
              <input type="password" placeholder="请再次输入密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={errors.confirmPassword ? 'error' : ''} />
              {errors.confirmPassword && <div className="field-err">{errors.confirmPassword}</div>}
            </div>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? '处理中...' : tabs.find((t) => t.key === tab)!.label}
          </button>
        </form>
      </div>
    </div>
  );
}
