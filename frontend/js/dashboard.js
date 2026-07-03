const months = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];

async function loadDashboard() {
  const user = getUser();
  document.getElementById('user-name').textContent = user.full_name || 'User';
  document.getElementById('current-month').textContent =
    new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const [income, expenses, investments, goals] = await Promise.all([
    apiFetch('/income'),
    apiFetch('/expenses'),
    apiFetch('/investments'),
    apiFetch('/goals')
  ]);

  const totalIncome  = income.reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalExpense = expenses.reduce((s, r) => s + parseFloat(r.amount), 0);
  const savings      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

  document.getElementById('total-income').textContent  = '₹' + totalIncome.toLocaleString('en-IN');
  document.getElementById('total-expense').textContent = '₹' + totalExpense.toLocaleString('en-IN');
  document.getElementById('net-savings').textContent   = '₹' + savings.toLocaleString('en-IN');
  document.getElementById('savings-rate').textContent  = savingsRate + '%';

  if (savings < 0) document.getElementById('net-savings').style.color = '#fc8181';

  drawDonut(totalIncome, totalExpense);
  drawBar(income, expenses);
  drawExpensePie(expenses);
  showSuggestion(investments, savingsRate);
  renderGoals(goals, totalIncome);
}

function drawDonut(income, expense) {
  new Chart(document.getElementById('donutChart'), {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{ data: [income, expense], backgroundColor: ['#00d4aa', '#fc8181'], borderWidth: 0 }]
    },
    options: { plugins: { legend: { labels: { color: '#e2e8f0' } } }, cutout: '65%' }
  });
}

function drawBar(income, expenses) {
  // Aggregate by month
  const monthMap = {};
  months.forEach(m => { monthMap[m] = { income: 0, expense: 0 }; });
  income.forEach(r  => { if (monthMap[r.month]) monthMap[r.month].income  += parseFloat(r.amount); });
  expenses.forEach(r => { if (monthMap[r.month]) monthMap[r.month].expense += parseFloat(r.amount); });

  // Only show months with data
  const active = months.filter(m => monthMap[m].income > 0 || monthMap[m].expense > 0);
  const labels = active.length ? active : months.slice(0, 6);

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',   data: labels.map(m => monthMap[m].income),  backgroundColor: '#00d4aa' },
        { label: 'Expenses', data: labels.map(m => monthMap[m].expense), backgroundColor: '#fc8181' }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: {
        x: { ticks: { color: '#718096' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#718096' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function drawExpensePie(expenses) {
  const catMap = {};
  expenses.forEach(r => {
    catMap[r.category] = (catMap[r.category] || 0) + parseFloat(r.amount);
  });
  const colors = ['#f0b429','#a78bfa','#34d399','#f87171','#60a5fa','#fb923c','#e879f9'];
  new Chart(document.getElementById('expensePie'), {
    type: 'pie',
    data: {
      labels: Object.keys(catMap),
      datasets: [{ data: Object.values(catMap), backgroundColor: colors, borderWidth: 0 }]
    },
    options: { plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } } }
  });
}

function showSuggestion(investments, savingsRate) {
  const latest = investments[0];
  const risk = latest ? latest.risk_level : 'Medium';

  const schemes = {
    Low: [
      { name: 'Public Provident Fund (PPF)', return: '7.1%', type: 'Government' },
      { name: 'Fixed Deposit (FD)', return: '6.5–7.5%', type: 'Bank' },
      { name: 'National Savings Certificate', return: '7.7%', type: 'Government' }
    ],
    Medium: [
      { name: 'SIP in Mutual Funds', return: '10–12%', type: 'Market-linked' },
      { name: 'ELSS (Tax Saving Fund)', return: '12–15%', type: 'Equity' },
      { name: 'NPS (National Pension)', return: '9–11%', type: 'Pension' }
    ],
    High: [
      { name: 'Direct Equity / Stocks', return: '15–20%+', type: 'High Risk' },
      { name: 'Small-cap Mutual Funds', return: '15–18%', type: 'High Risk' },
      { name: 'REITs (Real Estate)', return: '8–12%', type: 'Alternative' }
    ]
  };

  const list = schemes[risk] || schemes['Medium'];
  const rateMsg = savingsRate >= 20
    ? `Great job! You're saving <strong>${savingsRate}%</strong> of your income.`
    : `You're saving <strong>${savingsRate}%</strong>. Try to target at least 20%.`;

  document.getElementById('suggestion-text').innerHTML = `
    <p>${rateMsg} Based on your <strong>${risk}</strong> risk profile, consider:</p>
    <div class="scheme-list">
      ${list.map(s => `
        <div class="scheme-item">
          <div class="scheme-name">${s.name}</div>
          <div class="scheme-meta"><span class="badge">${s.type}</span><span class="ret">${s.return} p.a.</span></div>
        </div>`).join('')}
    </div>`;
}

function renderGoals(goals, totalIncome) {
  const container = document.getElementById('goals-container');
  if (!goals.length) {
    container.innerHTML = '<p class="muted" style="padding:16px">No goals yet. <a href="input.html">Add one →</a></p>';
    return;
  }
  container.innerHTML = goals.map(g => {
    const yearsLeft = g.target_year - new Date().getFullYear();
    const monthly   = yearsLeft > 0 ? (g.target_amount / (yearsLeft * 12)).toFixed(0) : 0;
    const progress  = Math.min((totalIncome / g.target_amount) * 100, 100).toFixed(0);
    return `
      <div class="goal-card">
        <div class="goal-top">
          <span class="goal-type">${g.goal_type}</span>
          <span class="goal-year">${g.target_year}</span>
        </div>
        <div class="goal-amount">₹${parseFloat(g.target_amount).toLocaleString('en-IN')}</div>
        <div class="goal-bar"><div class="goal-fill" style="width:${progress}%"></div></div>
        <div class="goal-meta">${yearsLeft} years left · Save ₹${parseInt(monthly).toLocaleString('en-IN')}/month</div>
      </div>`;
  }).join('');
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

loadDashboard();