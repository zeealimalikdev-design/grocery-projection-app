import { db, initDefaults } from './src/db.js';
import { calculateMonthlyProjections, calculateBreakEven } from './src/logic.js';
import Chart from 'chart.js/auto';

// App State
let currentView = 'dashboard';
let growthRate = 5;
let mainChart = null;
let currentCurrency = 'PKR';
let showIdeal = false;

const currencyConfig = {
  PKR: { symbol: 'Rs.', rate: 1, locale: 'en-PK' },
  USD: { symbol: '$', rate: 0.0036, locale: 'en-US' },
  EUR: { symbol: '€', rate: 0.0033, locale: 'de-DE' },
  GBP: { symbol: '£', rate: 0.0028, locale: 'en-GB' },
  AED: { symbol: 'د.إ', rate: 0.013, locale: 'ar-AE' }
};

function formatVal(value, isCompact = false) {
  const config = currencyConfig[currentCurrency];
  const converted = value * config.rate;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currentCurrency === 'Rs.' ? 'PKR' : currentCurrency,
    currencyDisplay: 'symbol',
    notation: isCompact && converted > 1000000 ? 'compact' : 'standard',
    maximumFractionDigits: converted < 1 ? 2 : 0
  }).format(converted);
}

// Views
const views = {
  dashboard: async () => {
    const inventory = await db.inventory.toArray();
    const expenses = await db.expenses.toArray();
    const projections = calculateMonthlyProjections(inventory, expenses, growthRate);
    const breakEven = calculateBreakEven(inventory, expenses);

    const month1 = projections[0];
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return `
      <div class="dashboard-header">
        <h1>Financial Dashboard</h1>
        <p>Real-time grocery distribution insights and projections.</p>
      </div>

      <div class="dashboard-grid">
        <div class="card" style="grid-column: span 3; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0;">Projection Model</h3>
            <p style="margin: 0; font-size: 14px; color: var(--text-muted);">Switch between real-world spoilage and perfect operational scenarios.</p>
          </div>
          <div class="switch-container">
            <span style="font-size: 12px; font-weight: 700; color: ${!showIdeal ? 'var(--accent)' : 'var(--text-muted)'}">REALISTIC</span>
            <label class="switch">
              <input type="checkbox" id="idealToggle" ${showIdeal ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
            <span style="font-size: 12px; font-weight: 700; color: ${showIdeal ? 'var(--accent)' : 'var(--text-muted)'}">IDEAL (0% SPOIL)</span>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Initial Monthly Revenue <i data-lucide="bar-chart-3"></i></div>
          <div class="card-value">${formatVal(month1.revenue)}</div>
          <div class="card-trend trend-up"><i data-lucide="arrow-up-right"></i> Target Month 1</div>
        </div>
        <div class="card">
          <div class="card-title">Monthly Expenses <i data-lucide="credit-card"></i></div>
          <div class="card-value">${formatVal(totalExpenses)}</div>
          <div class="card-trend trend-down"><i data-lucide="arrow-down-right"></i> Fixed Costs</div>
        </div>
        <div class="card">
          <div class="card-title">Net Profit (M1) <i data-lucide="banknote"></i></div>
          <div class="card-value" style="color: ${showIdeal ? 'var(--accent)' : (month1.netIncome >= 0 ? 'var(--accent)' : 'var(--danger)')}">
            ${formatVal(showIdeal ? (month1.grossProfitRaw - totalExpenses) : month1.netIncome)}
          </div>
          <div class="card-trend ${month1.netIncome >= 0 ? 'trend-up' : 'trend-down'}">
            <i data-lucide="${month1.netIncome >= 0 ? 'trending-up' : 'trending-down'}"></i> 
            ${showIdeal ? '0% Operational Waste' : (((month1.netIncome / month1.revenue) * 100).toFixed(1) + '% Realistic Margin')}
          </div>
        </div>
        <div class="card">
          <div class="card-title">Break-even Units <i data-lucide="target"></i></div>
          <div class="card-value">${breakEven.toLocaleString()}</div>
          <div class="card-trend"><i data-lucide="info"></i> Total units to cover costs</div>
        </div>

        <div class="card chart-container" style="grid-column: span 3;">
          <div class="card-title">
            12-Month Growth Projection
            <div style="display: flex; align-items: center; gap: 10px;">
              <label style="margin: 0; font-size: 12px;">Growth %:</label>
              <input type="number" id="growthInput" value="${growthRate}" style="width: 70px; padding: 4px 8px; font-size: 12px;">
            </div>
          </div>
          <canvas id="projectionChart"></canvas>
        </div>
      </div>
    `;
  },

  inventory: async () => {
    const items = await db.inventory.toArray();
    return `
      <div class="dashboard-header">
        <h1>Inventory Management</h1>
        <p>Manage your grocery items, costs, and expected volumes.</p>
      </div>
      
      <div class="card" style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem;">Add New Item</h3>
        <form id="addInventoryForm" class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          <div class="form-group">
            <label>Item Name</label>
            <input type="text" name="name" required placeholder="e.g. Organic Bananas">
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" name="category" required placeholder="e.g. Produce">
          </div>
          <div class="form-group">
            <label>Unit Cost (${currencyConfig[currentCurrency].symbol})</label>
            <input type="number" step="0.01" name="unitCost" required value="100">
          </div>
          <div class="form-group">
            <label>Markup (%)</label>
            <input type="number" name="markup" required value="30">
          </div>
          <div class="form-group">
            <label>Monthly Volume</label>
            <input type="number" name="expectedVolume" required value="1000">
          </div>
          <div class="form-group">
            <label>Spoilage Rate (%)</label>
            <input type="number" step="0.1" name="spoilageRate" required value="5">
          </div>
          <div class="form-group">
            <label>Bulk Threshold (Units)</label>
            <input type="number" name="bulkThreshold" required value="5000">
          </div>
          <div class="form-group">
            <label>Bulk Discount (%)</label>
            <input type="number" name="discountPercentage" required value="10">
          </div>
          <div class="form-group" style="display: flex; align-items: flex-end;">
            <button type="submit" class="btn" style="width: 100%;">Add Item</button>
          </div>
        </form>
      </div>

      <div class="card table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Cost/Price</th>
              <th>Spoilage</th>
              <th>Bulk (Units/%)</th>
              <th>Volume</th>
              <th>Exp. Profit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
      const basePrice = item.unitCost * (1 + item.markup / 100);
      const volume = item.expectedVolume;
      const sellingPrice = (item.bulkThreshold && volume >= item.bulkThreshold)
        ? basePrice * (1 - (item.discountPercentage || 0) / 100)
        : basePrice;

      const baseProfit = (sellingPrice - item.unitCost) * volume;
      const wastage = item.unitCost * volume * (item.spoilageRate || 0);
      const profit = baseProfit - wastage;

      return `
                <tr>
                  <td>
                    ${item.name}<br>
                    <span class="badge ${item.spoilageRate >= 0.05 ? 'badge-high' : (item.spoilageRate >= 0.02 ? 'badge-medium' : 'badge-low')}">
                      ${item.spoilageRate >= 0.05 ? 'High Risk' : (item.spoilageRate >= 0.02 ? 'Medium Risk' : 'Low Risk')}
                    </span>
                  </td>
                  <td>${item.category}</td>
                  <td>${formatVal(item.unitCost)} / ${formatVal(sellingPrice)}</td>
                  <td style="color: var(--danger)">${((item.spoilageRate || 0) * 100).toFixed(1)}%</td>
                  <td>${(item.bulkThreshold || 0).toLocaleString()} / ${item.discountPercentage || 0}%</td>
                  <td>${(item.expectedVolume || 0).toLocaleString()}</td>
                  <td style="color: var(--accent); font-weight: 700;">${formatVal(profit)}</td>
                  <td>
                    <button class="delete-item btn" style="background: var(--danger); padding: 5px 10px;" data-id="${item.id}">
                      <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                  </td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  expenses: async () => {
    const expenses = await db.expenses.toArray();
    return `
      <div class="dashboard-header">
        <h1>Operating Expenses</h1>
        <p>Track fixed and variable overhead costs.</p>
      </div>

      <div class="card" style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem;">Add Expense</h3>
        <form id="addExpenseForm" class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          <div class="form-group">
            <label>Expense Name</label>
            <input type="text" name="name" required placeholder="e.g. Electricity">
          </div>
          <div class="form-group">
            <label>Monthly Amount (${currencyConfig[currentCurrency].symbol})</label>
            <input type="number" name="amount" required value="5000">
          </div>
          <div class="form-group" style="display: flex; align-items: flex-end;">
            <button type="submit" class="btn" style="width: 100%;">Add Expense</button>
          </div>
        </form>
      </div>

      <div class="card table-container">
        <table>
          <thead>
            <tr>
              <th>Expense Name</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(exp => `
              <tr>
                <td>${exp.name}</td>
                <td>${formatVal(exp.amount)}</td>
                <td>
                  <button class="delete-expense btn" style="background: var(--danger); padding: 5px 10px;" data-id="${exp.id}">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  projections: async () => {
    const inventory = await db.inventory.toArray();
    const expenses = await db.expenses.toArray();
    const data = calculateMonthlyProjections(inventory, expenses, growthRate);

    return `
      <div class="dashboard-header">
        <h1>12-Month Forecast</h1>
        <p>Detailed breakdown of projected performance over the next year.</p>
      </div>

      <div class="card table-container">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
              <th>Expenses</th>
              <th>Gross Profit</th>
              <th>Net Income</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(m => `
              <tr>
                <td>${m.month}</td>
                <td>${formatVal(m.revenue)}</td>
                <td>${formatVal(m.expenses)}</td>
                <td>${formatVal(m.grossProfit)}</td>
                <td style="font-weight: 700; color: ${m.netIncome >= 0 ? 'var(--accent)' : 'var(--danger)'}">
                  ${formatVal(m.netIncome)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
};

// Render Functions
async function navigate(viewName) {
  currentView = viewName;
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loading">Loading...</div>';

  const html = await views[viewName]();
  content.innerHTML = html;

  // Re-initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  } else {
    console.error('Lucide not loaded');
  }


  // Handle active states
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === viewName);
  });

  // Attach events
  attachViewEvents(viewName);

  if (viewName === 'dashboard') {
    renderChart();
  }

  // Close sidebar on mobile after navigation
  closeSidebar();
}

function toggleSidebar() {
  console.log('Toggling sidebar...');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileOverlay');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
  console.log('Sidebar classes:', sidebar.className);
}

function closeSidebar() {
  console.log('Closing sidebar...');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileOverlay');
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}



function attachViewEvents(viewName) {
  if (viewName === 'inventory') {
    document.getElementById('addInventoryForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await db.inventory.add({
        name: fd.get('name'),
        category: fd.get('category'),
        unitCost: parseFloat(fd.get('unitCost')) / currencyConfig[currentCurrency].rate,
        markup: parseFloat(fd.get('markup')),
        expectedVolume: parseInt(fd.get('expectedVolume')),
        spoilageRate: parseFloat(fd.get('spoilageRate')) / 100,
        bulkThreshold: parseInt(fd.get('bulkThreshold')),
        discountPercentage: parseFloat(fd.get('discountPercentage'))
      });
      navigate('inventory');
    });

    document.querySelectorAll('.delete-item').forEach(btn => {
      btn.onclick = async () => {
        await db.inventory.delete(Number(btn.dataset.id));
        navigate('inventory');
      };
    });
  }

  if (viewName === 'expenses') {
    document.getElementById('addExpenseForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await db.expenses.add({
        name: fd.get('name'),
        amount: parseFloat(fd.get('amount')) / currencyConfig[currentCurrency].rate,
        frequency: 'Monthly'
      });
      navigate('expenses');
    });

    document.querySelectorAll('.delete-expense').forEach(btn => {
      btn.onclick = async () => {
        await db.expenses.delete(Number(btn.dataset.id));
        navigate('expenses');
      };
    });
  }

  if (viewName === 'dashboard') {
    document.getElementById('growthInput')?.addEventListener('change', (e) => {
      growthRate = parseFloat(e.target.value) || 0;
      navigate('dashboard');
    });

    document.getElementById('idealToggle')?.addEventListener('change', (e) => {
      showIdeal = e.target.checked;
      navigate('dashboard');
    });
  }
}

async function renderChart() {
  const inventory = await db.inventory.toArray();
  const expenses = await db.expenses.toArray();
  const projections = calculateMonthlyProjections(inventory, expenses, growthRate);

  const ctx = document.getElementById('projectionChart').getContext('2d');

  if (mainChart) mainChart.destroy();

  mainChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: projections.map(p => p.month),
      datasets: [
        {
          label: 'Revenue',
          data: projections.map(p => p.revenue * currencyConfig[currentCurrency].rate),
          backgroundColor: 'rgba(16, 185, 129, 0.4)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 5,
        },
        {
          label: 'Spoilage Loss',
          data: projections.map(p => p.wastage * currencyConfig[currentCurrency].rate),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
          borderRadius: 5,
        },
        {
          label: 'Operating Expenses',
          data: projections.map(p => p.expenses * currencyConfig[currentCurrency].rate),
          backgroundColor: 'rgba(71, 85, 105, 0.6)',
          borderColor: 'rgba(71, 85, 105, 1)',
          borderWidth: 1,
          borderRadius: 5,
        },
        {
          label: 'Net Profit',
          data: projections.map(p => (showIdeal ? (p.grossProfitRaw - p.expenses) : p.netIncome) * currencyConfig[currentCurrency].rate),
          type: 'line',
          borderColor: '#f8fafc',
          borderWidth: 3,
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#94a3b8', font: { family: 'Cairo Play' } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

// Export CSV Function
async function exportToCSV() {
  const inventory = await db.inventory.toArray();
  const expenses = await db.expenses.toArray();

  let csv = 'Type,Name,Details,Value\n';
  inventory.forEach(i => {
    const spoilage = ((i.spoilageRate || 0) * 100).toFixed(1);
    csv += `Inventory,${i.name},Cost: ${i.unitCost} Spoilage: ${spoilage}% Bulk: ${i.bulkThreshold || 0}@${i.discountPercentage || 0}%,${i.expectedVolume || 0}\n`;
  });
  expenses.forEach(e => {
    csv += `Expense,${e.name},Monthly,${e.amount}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'grocery_projections.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  await initDefaults();

  // Sidebar clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(item.dataset.view);
    });
  });

  document.getElementById('exportBtn').onclick = exportToCSV;

  document.getElementById('currencySelect').addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    navigate(currentView);
  });

  document.getElementById('fabMenu').addEventListener('click', toggleSidebar);
  document.getElementById('mobileOverlay').addEventListener('click', closeSidebar);


  navigate('dashboard');
});

