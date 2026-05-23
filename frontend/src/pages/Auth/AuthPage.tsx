import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { register, login, forgotPassword } from '../../services/authService';
import type { AxiosError } from 'axios';

type Tab = 'login' | 'register' | 'forgot';

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const authLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!email.trim()) errs.email = '请输入邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = '邮箱格式不正确';
    if (tab !== 'forgot') {
      if (!password) errs.password = '请输入密码';
      else if (password.length < 8) errs.password = '密码长度不足 8 位';
      else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
        errs.password = '密码需包含字母和数字';
    }
    if (tab === 'register' && password !== confirmPassword) {
      errs.confirmPassword = '两次输入的密码不一致';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const extractError = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as AxiosError<{ message?: string; fieldErrors?: Record<string, string> }>;
      if (axiosErr.response?.data?.fieldErrors) {
        const map: Record<string, string> = {};
        const fe = axiosErr.response.data.fieldErrors;
        for (const key of Object.keys(fe)) map[key] = fe[key];
        setFieldErrors((prev) => ({ ...prev, ...map }));
      }
      return axiosErr.response?.data?.message || '操作失败，请重试';
    }
    return '网络错误，请检查连接';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccess(null);
    if (!validate()) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await login(email, password);
        authLogin(res.token, res.email);
        navigate('/paints');
      } else if (tab === 'register') {
        const res = await register(email, password);
        authLogin(res.token, res.email);
        navigate('/paints');
      } else {
        await forgotPassword(email);
        setSuccess('重置链接已发送到您的邮箱');
      }
    } catch (err) {
      setServerError(extractError(err));
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          width: 420,
          padding: 'var(--space-8)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-soft)',
          boxShadow: 'var(--elev-raised)',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--fg-2)',
            fontFamily: 'var(--font-display)',
            marginBottom: 'var(--space-6)',
          }}
        >
          涂装工作站
        </h2>

        <div
          style={{
            display: 'flex',
            marginBottom: 'var(--space-6)',
            background: 'var(--surface-warm)',
            borderRadius: 'var(--radius-sm)',
            padding: 2,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setFieldErrors({});
                setServerError(null);
                setSuccess(null);
              }}
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-4)',
                background: tab === t.key ? 'var(--accent)' : 'transparent',
                color: tab === t.key ? 'var(--accent-on)' : 'var(--muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background var(--motion-fast) var(--ease-standard)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <input
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--surface-warm)',
                border: `1px solid ${fieldErrors.email ? 'var(--danger)' : 'var(--border-soft)'}`,
                borderRadius: 'var(--radius-sm)',
                color: 'var(--fg)',
                fontSize: 'var(--text-base)',
                outline: 'none',
              }}
            />
            {fieldErrors.email && (
              <p style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{fieldErrors.email}</p>
            )}
          </div>

          {tab !== 'forgot' && (
            <div>
              <input
                type="password"
                placeholder="请输入密码（至少8位，包含字母和数字）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--surface-warm)',
                  border: `1px solid ${fieldErrors.password ? 'var(--danger)' : 'var(--border-soft)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--fg)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                }}
              />
              {fieldErrors.password && (
                <p style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{fieldErrors.password}</p>
              )}
            </div>
          )}

          {tab === 'register' && (
            <div>
              <input
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--surface-warm)',
                  border: `1px solid ${fieldErrors.confirmPassword ? 'var(--danger)' : 'var(--border-soft)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--fg)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                }}
              />
              {fieldErrors.confirmPassword && (
                <p style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{fieldErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {serverError && (
            <p
              style={{
                color: 'var(--danger)',
                fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'rgba(242, 63, 67, 0.1)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {serverError}
            </p>
          )}

          {success && (
            <p
              style={{
                color: 'var(--success)',
                fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'rgba(35, 165, 90, 0.1)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: loading ? 'var(--accent-hover)' : 'var(--accent)',
              color: 'var(--accent-on)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '处理中...' : tabs.find((t) => t.key === tab)!.label}
          </button>
        </form>
      </div>
    </div>
  );
}
