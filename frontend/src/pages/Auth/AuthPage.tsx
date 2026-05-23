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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const authLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = '请输入邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = '邮箱格式不正确';
    if (tab !== 'forgot') {
      if (!password) errs.password = '请输入密码';
      else if (password.length < 8) errs.password = '密码长度不足 8 位';
    }
    if (tab === 'register' && password !== confirmPassword) errs.confirmPassword = '两次输入的密码不一致';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
        showToast('success', '如果该邮箱已注册，重置链接已发送');
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      showToast('error', axiosErr.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setFieldErrors({});
  };

  return (
    <div className="auth-center">
      <div className="auth-card">
        <div className="brand"><span>Hobby</span>Mix</div>

        {/* Login */}
        <div className={`view${tab === 'login' ? ' active' : ''}`}>
          <div className="view-title">登入账号</div>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>邮箱</label>
              <input type="email" placeholder="请输入邮箱地址" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldErrors.email ? 'error' : ''} />
              <span className={`field-error${fieldErrors.email ? ' visible' : ''}`}>{fieldErrors.email || ''}</span>
            </div>
            <div className="field">
              <label>密码</label>
              <input type="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldErrors.password ? 'error' : ''} />
              <span className={`field-error${fieldErrors.password ? ' visible' : ''}`}>{fieldErrors.password || ''}</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '处理中...' : '登入'}</button>
          </form>
          <div className="switch-links">
            <a onClick={() => switchTab('register')}>注册</a>
            <span className="sep">·</span>
            <a onClick={() => switchTab('forgot')}>忘记密码</a>
          </div>
        </div>

        {/* Register */}
        <div className={`view${tab === 'register' ? ' active' : ''}`}>
          <div className="view-title">创建账号</div>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>邮箱</label>
              <input type="email" placeholder="请输入邮箱地址" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldErrors.email ? 'error' : ''} />
              <span className={`field-error${fieldErrors.email ? ' visible' : ''}`}>{fieldErrors.email || ''}</span>
            </div>
            <div className="field">
              <label>密码</label>
              <input type="password" placeholder="至少 8 位字母或数字" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldErrors.password ? 'error' : ''} />
              <span className={`field-error${fieldErrors.password ? ' visible' : ''}`}>{fieldErrors.password || ''}</span>
            </div>
            <div className="field">
              <label>确认密码</label>
              <input type="password" placeholder="再次输入密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={fieldErrors.confirmPassword ? 'error' : ''} />
              <span className={`field-error${fieldErrors.confirmPassword ? ' visible' : ''}`}>{fieldErrors.confirmPassword || ''}</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '处理中...' : '创建账号'}</button>
          </form>
          <div className="switch-links">
            已有账号？<a onClick={() => switchTab('login')}>返回登录</a>
          </div>
        </div>

        {/* Forgot Password */}
        <div className={`view${tab === 'forgot' ? ' active' : ''}`}>
          <div className="view-title">重置密码</div>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>邮箱</label>
              <input type="email" placeholder="请输入注册邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '处理中...' : '发送重置链接'}</button>
          </form>
          <div className="switch-links">
            <a onClick={() => switchTab('login')}>返回登录</a>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast show ${toast.type}`}>{toast.text}</div>
      )}
    </div>
  );
}
