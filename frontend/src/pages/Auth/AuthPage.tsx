import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import type { AxiosError } from 'axios';

type Tab = 'login' | 'register' | 'forgot';

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const authLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleError = (err: unknown, defaultMsg: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    setError(axiosErr.response?.data?.message || defaultMsg);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      authLogin(res.token, res.email);
      navigate('/');
    } catch (err) {
      handleError(err, '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.register(email, password);
      authLogin(res.token, res.email);
      navigate('/');
    } catch (err) {
      handleError(err, '注册失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess('如果该邮箱已注册，重置链接已发送');
    } catch (err) {
      handleError(err, '发送失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
    setSuccess('');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)',
        width: '380px', boxShadow: 'var(--shadow)',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8, color: 'var(--text-primary)' }}>
          涂装工作站
        </h2>
        <p style={{ textAlign: 'center', marginBottom: 20, color: 'var(--text-muted)', fontSize: 13 }}>
          登录以管理你的漆料库和配色方案
        </p>

        <div style={{ display: 'flex', marginBottom: 20, gap: 0 }}>
          {(['login', 'register', 'forgot'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1, padding: '8px 0', background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-secondary)', border: 'none',
                borderRadius: 'var(--radius-sm) 4px 0 0', cursor: 'pointer', fontSize: 13,
              }}
            >
              {{ login: '登录', register: '注册', forgot: '忘记密码' }[t]}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'var(--danger)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12, fontSize: 13 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'var(--success)', color: '#000', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12, fontSize: 13 }}>
            {success}
          </div>
        )}

        <form onSubmit={tab === 'login' ? handleLogin : tab === 'register' ? handleRegister : handleForgot}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="请输入邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px', background: 'var(--bg-input)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: 14,
              }}
            />
          </div>

          {tab !== 'forgot' && (
            <div style={{ marginBottom: 12 }}>
              <input
                type="password"
                placeholder={tab === 'register' ? '密码（至少8位字母或数字）' : '请输入密码'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={{
                  width: '100%', padding: '10px', background: 'var(--bg-input)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)', fontSize: 14,
                }}
              />
            </div>
          )}

          {tab === 'register' && (
            <div style={{ marginBottom: 12 }}>
              <input
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                style={{
                  width: '100%', padding: '10px', background: 'var(--bg-input)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)', fontSize: 14,
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 14,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '处理中...' : tab === 'login' ? '登录' : tab === 'register' ? '注册' : '发送重置链接'}
          </button>
        </form>
      </div>
    </div>
  );
}
