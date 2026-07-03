const API = '/api';

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
  document.getElementById(tab + '-form').classList.remove('hidden');
  event.target.classList.add('active');
}

document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  showMsg('Logging in...', '');

  try {
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log('Login response:', data); // helps debug

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showMsg('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 500);
    } else {
      showMsg(data.message || 'Login failed', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showMsg('Server error. Is the backend running?', 'error');
  }
});

document.getElementById('signup-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const body = {
    full_name: document.getElementById('reg-name').value.trim(),
    email:     document.getElementById('reg-email').value.trim(),
    phone:     document.getElementById('reg-phone').value.trim(),
    password:  document.getElementById('reg-password').value,
    user_type: document.getElementById('reg-type').value
  };

  showMsg('Creating account...', '');

  try {
    const res = await fetch(API + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok) {
      showMsg('Account created! Please login.', 'success');
      // switch to login tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
      document.getElementById('login-form').classList.remove('hidden');
      document.querySelectorAll('.tab')[0].classList.add('active');
      document.getElementById('login-email').value = body.email;
    } else {
      showMsg(data.message || 'Signup failed', 'error');
    }
  } catch (err) {
    console.error('Signup error:', err);
    showMsg('Server error. Is the backend running?', 'error');
  }
});

function showMsg(text, type) {
  const el = document.getElementById('auth-msg');
  el.textContent = text;
  el.className = 'msg ' + type;
}