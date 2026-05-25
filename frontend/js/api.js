// Shared API module for HobbyMix
const API_BASE = '/api';

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  const token = localStorage.getItem('token');
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + path, opts);
  if (res.status === 401 && !path.startsWith('/auth/')) {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    window.location.href = '/auth';
    return null;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '请求失败');
  }
  return res.json();
}

// Auth
async function authRegister(email, password) {
  const res = await fetch(API_BASE + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '注册失败');
  }
  return res.json();
}

async function authLogin(email, password) {
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '登录失败');
  }
  return res.json();
}

async function authForgotPassword(email) {
  const res = await fetch(API_BASE + '/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

// Paints
async function getPaints(params) {
  let qs = '';
  if (params) {
    const sp = new URLSearchParams();
    Object.keys(params).forEach(k => { if (params[k]) sp.append(k, params[k]); });
    qs = '?' + sp.toString();
  }
  return api('GET', '/paints' + qs);
}

async function createPaint(data) {
  return api('POST', '/paints', data);
}

async function updatePaint(id, data) {
  return api('PUT', '/paints/' + id, data);
}

async function deletePaint(id) {
  return api('DELETE', '/paints/' + id);
}

// Auth guard
function requireAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = '/auth';
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  window.location.href = '/auth';
}

// Mix
async function postMix(r, g, b) {
  return api('POST', '/mix', { r, g, b });
}
