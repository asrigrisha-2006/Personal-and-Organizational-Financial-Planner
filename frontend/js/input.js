function showSection(name, btn) {
  document.querySelectorAll('.form-section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('section-' + name).classList.remove('hidden');
  btn.classList.add('active');
}

async function addIncome() {
  const source = document.getElementById('inc-source').value.trim();
  const amount = document.getElementById('inc-amount').value;
  const month  = document.getElementById('inc-month').value;
  const year   = document.getElementById('inc-year').value;

  if (!source || !amount) { showMsg('inc-msg', 'Please fill all fields', false); return; }

  try {
    const res = await fetch('/api/income', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ source, amount, month, year })
    });
    const data = await res.json();
    if (res.ok) {
      showMsg('inc-msg', '✓ Income added successfully!', true);
      document.getElementById('inc-source').value = '';
      document.getElementById('inc-amount').value = '';
    } else {
      showMsg('inc-msg', data.message || 'Failed to add', false);
    }
  } catch (err) {
    console.error(err);
    showMsg('inc-msg', 'Server error', false);
  }
}

async function addExpense() {
  const category = document.getElementById('exp-category').value;
  const amount   = document.getElementById('exp-amount').value;
  const month    = document.getElementById('exp-month').value;
  const year     = document.getElementById('exp-year').value;

  if (!amount) { showMsg('exp-msg', 'Please enter an amount', false); return; }

  try {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ category, amount, month, year })
    });
    const data = await res.json();
    if (res.ok) {
      showMsg('exp-msg', '✓ Expense added successfully!', true);
      document.getElementById('exp-amount').value = '';
    } else {
      showMsg('exp-msg', data.message || 'Failed to add', false);
    }
  } catch (err) {
    console.error(err);
    showMsg('exp-msg', 'Server error', false);
  }
}

async function addGoal() {
  const goal_type     = document.getElementById('goal-type').value.trim();
  const target_amount = document.getElementById('goal-amount').value;
  const target_year   = document.getElementById('goal-year').value;

  if (!goal_type || !target_amount || !target_year) {
    showMsg('goal-msg', 'Please fill all fields', false); return;
  }

  try {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ goal_type, target_amount, target_year })
    });
    const data = await res.json();
    if (res.ok) {
      showMsg('goal-msg', '✓ Goal added successfully!', true);
      document.getElementById('goal-type').value   = '';
      document.getElementById('goal-amount').value = '';
      document.getElementById('goal-year').value   = '';
    } else {
      showMsg('goal-msg', data.message || 'Failed to add', false);
    }
  } catch (err) {
    console.error(err);
    showMsg('goal-msg', 'Server error', false);
  }
}

function updateTotal() {
  const stocks = parseFloat(document.getElementById('inv-stocks').value) || 0;
  const mf     = parseFloat(document.getElementById('inv-mf').value)     || 0;
  const fd     = parseFloat(document.getElementById('inv-fd').value)     || 0;
  const ef     = parseFloat(document.getElementById('inv-ef').value)     || 0;
  const total  = stocks + mf + fd + ef;

  document.getElementById('inv-total').textContent = total;
  const status = document.getElementById('total-status');
  if (total === 100) {
    status.textContent = '✓ Good';
    status.style.color = '#00d4aa';
  } else if (total > 100) {
    status.textContent = '⚠ Over 100';
    status.style.color = '#fc8181';
  } else {
    status.textContent = '';
  }
}

async function addInvestment() {
  const total = parseFloat(document.getElementById('inv-total').textContent) || 0;
  if (total !== 100) {
    showMsg('inv-msg', 'Percentages must add up to exactly 100', false); return;
  }

  const body = {
    month:                  document.getElementById('inv-month').value,
    year:                   document.getElementById('inv-year').value,
    stocks_percent:         document.getElementById('inv-stocks').value,
    mutual_funds_percent:   document.getElementById('inv-mf').value,
    fixed_deposit_percent:  document.getElementById('inv-fd').value,
    emergency_fund_percent: document.getElementById('inv-ef').value,
    risk_level:             document.getElementById('inv-risk').value
  };

  try {
    const res = await fetch('/api/investments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      showMsg('inv-msg', '✓ Investment plan saved successfully!', true);
      document.getElementById('inv-stocks').value = '';
      document.getElementById('inv-mf').value     = '';
      document.getElementById('inv-fd').value     = '';
      document.getElementById('inv-ef').value     = '';
      document.getElementById('inv-total').textContent = '0';
      document.getElementById('total-status').textContent = '';
    } else {
      showMsg('inv-msg', data.message || 'Failed to save', false);
    }
  } catch (err) {
    console.error(err);
    showMsg('inv-msg', 'Server error', false);
  }
}

function showMsg(id, text, ok) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className   = 'msg ' + (ok ? 'success' : 'error');
  // auto clear after 3 seconds
  setTimeout(() => { el.textContent = ''; el.className = 'msg'; }, 3000);
}

// redirect if not logged in
if (!localStorage.getItem('token')) {
  window.location.href = '/index.html';
}