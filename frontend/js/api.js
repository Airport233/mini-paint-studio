// Shared API module for HobbyMix
const API_BASE = '/api';

window.api = async function(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  const token = localStorage.getItem('token');
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + path, opts);
  if ((res.status === 401 || res.status === 403) && !path.startsWith('/auth/')) {
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
};

window.authRegister = async function(email, password) {
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
};

window.authLogin = async function(email, password) {
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
};

window.authForgotPassword = async function(email) {
  const res = await fetch(API_BASE + '/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

window.getPaints = async function(params) {
  let qs = '';
  if (params) {
    const sp = new URLSearchParams();
    Object.keys(params).forEach(k => { if (params[k]) sp.append(k, params[k]); });
    qs = '?' + sp.toString();
  }
  return api('GET', '/paints' + qs);
};

window.createPaint = async function(data) {
  return api('POST', '/paints', data);
};

window.updatePaint = async function(id, data) {
  return api('PUT', '/paints/' + id, data);
};

window.deletePaint = async function(id) {
  return api('DELETE', '/paints/' + id);
};

window.postMix = async function(r, g, b) {
  return api('POST', '/mix', { r, g, b });
};

function requireAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = '/auth';
  }
}

window.logout = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  window.location.href = '/auth';
}

// STL
window.uploadStl = async function(file) {
  var fd = new FormData();
  fd.append('file', file);
  var token = localStorage.getItem('token');
  var res = await fetch('/api/stl/upload', {
    method: 'POST',
    headers: token ? { 'Authorization': 'Bearer ' + token } : {},
    body: fd,
  });
  if (!res.ok) throw new Error('上传失败');
  return res.json();
};

window.getStls = async function() {
  return api('GET', '/stl');
};

window.renameStl = async function(id, displayName) {
  return api('PUT', '/stl/' + id, { displayName: displayName });
};

window.deleteStl = async function(id) {
  return api('DELETE', '/stl/' + id);
};
