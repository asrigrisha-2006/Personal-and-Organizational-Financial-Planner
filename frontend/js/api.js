const API = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(API + path, {
      headers: authHeaders(),
      ...options
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      window.location.href = '/index.html';
      return null;
    }

    return res.json();
  } catch (err) {
    console.error('API error on ' + path, err);
    return null;
  }
}

// Page guard — only runs on non-login pages
(function() {
  const page = window.location.pathname;
  const isAuthPage = page.endsWith('index.html') || page === '/';
  if (!isAuthPage && !getToken()) {
    window.location.href = '/index.html';
  }
})();

function logout() {
  localStorage.clear();
  window.location.href = '/index.html';
}