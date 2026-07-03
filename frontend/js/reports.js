async function loadReports() {
  const [income, expenses, investments, goals] = await Promise.all([
    apiFetch('/income'), apiFetch('/expenses'),
    apiFetch('/investments'), apiFetch('/goals')
  ]);

  // Income table
  const iTbody = document.querySelector('#income-table tbody');
  iTbody.innerHTML = income.map(r => `
    <tr>
      <td>${r.source}</td>
      <td>₹${parseFloat(r.amount).toLocaleString('en-IN')}</td>
      <td>${r.month}</td><td>${r.year}</td>
    </tr>`).join('') || '<tr><td colspan="4" class="muted">No records</td></tr>';

  // Expense table
  const eTbody = document.querySelector('#expense-table tbody');
  eTbody.innerHTML = expenses.map(r => `
    <tr>
      <td>${r.category}</td>
      <td>₹${parseFloat(r.amount).toLocaleString('en-IN')}</td>
      <td>${r.month}</td><td>${r.year}</td>
      <td><button class="btn-del" onclick="delExpense(${r.expense_id})">✕</button></td>
    </tr>`).join('') || '<tr><td colspan="5" class="muted">No records</td></tr>';

  // Investment allocation radar/doughnut
  if (investments.length) {
    const inv = investments[0];
    new Chart(document.getElementById('invChart'), {
      type: 'doughnut',
      data: {
        labels: ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Emergency Fund'],
        datasets: [{
          data: [inv.stocks_percent, inv.mutual_funds_percent, inv.fixed_deposit_percent, inv.emergency_fund_percent],
          backgroundColor: ['#a78bfa','#00d4aa','#f0b429','#60a5fa'], borderWidth: 0
        }]
      },
      options: { plugins: { legend: { labels: { color: '#e2e8f0' } } }, cutout: '55%' }
    });
  }

  // Savings line chart
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthMap = {};
  months.forEach(m => { monthMap[m] = { inc: 0, exp: 0 }; });

  const shortMonth = s => s ? s.slice(0,3) : '';
  income.forEach(r   => { const m = shortMonth(r.month); if (monthMap[m]) monthMap[m].inc  += parseFloat(r.amount); });
  expenses.forEach(r => { const m = shortMonth(r.month); if (monthMap[m]) monthMap[m].exp  += parseFloat(r.amount); });

  new Chart(document.getElementById('savingsLine'), {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Net Savings', fill: true,
        data: months.map(m => monthMap[m].inc - monthMap[m].exp),
        borderColor: '#00d4aa', backgroundColor: 'rgba(0,212,170,0.1)', tension: 0.4, pointRadius: 4
      }]
    },
    options: {
      plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: {
        x: { ticks: { color: '#718096' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#718096' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });

  // Goals
  const gr = document.getElementById('goals-report');
  gr.innerHTML = goals.map(g => {
    const yLeft = g.target_year - new Date().getFullYear();
    const monthly = yLeft > 0 ? Math.ceil(g.target_amount / (yLeft * 12)) : 0;
    return `
      <div class="goal-card" style="margin-bottom:12px">
        <div class="goal-top">
          <span class="goal-type">${g.goal_type}</span>
          <span class="goal-year">Target: ${g.target_year}</span>
        </div>
        <div class="goal-amount">₹${parseFloat(g.target_amount).toLocaleString('en-IN')}</div>
        <div class="goal-meta">${yLeft} years · ₹${monthly.toLocaleString('en-IN')}/month needed</div>
        <button class="btn-del" style="margin-top:8px" onclick="delGoal(${g.goal_id})">Delete goal</button>
      </div>`;
  }).join('') || '<p class="muted">No goals added yet.</p>';
}

async function delExpense(id) {
  await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
  loadReports();
}

async function delGoal(id) {
  await apiFetch(`/goals/${id}`, { method: 'DELETE' });
  loadReports();
}

function logout() { localStorage.clear(); window.location.href = 'index.html'; }

loadReports();