function formatDate(date) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}


const Finance = {
  async getTransactions() {
    try {
      const auth = JSON.parse(localStorage.getItem('erp_auth'));
      if (!auth?.token) return [];

      const response = await fetch('http://localhost:5000/api/finance', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch transactions');
      }

      return result.data?.transactions || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async calculateTotals() {
    const transactions = await this.getTransactions();

    const revenue = transactions
      .filter(t => t.type === 'Revenue')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      revenue,
      expense,
      profit: revenue - expense
    };
  },

  async renderCards() {
    const { revenue, expense, profit } = await this.calculateTotals();

    document.getElementById('fin-revenue').textContent = '$' + revenue.toLocaleString();
    document.getElementById('fin-expense').textContent = '$' + expense.toLocaleString();

    const profitEl = document.getElementById('fin-profit');
    profitEl.textContent = '$' + profit.toLocaleString();
    profitEl.className = profit >= 0
      ? 'text-2xl font-bold text-green-400'
      : 'text-2xl font-bold text-red-400';
  },

  async renderTable(searchFilter = '') {
    const tbody = document.getElementById('finance-table-body');
    if (!tbody) return;

    let transactions = await this.getTransactions();

    const typeFilter = document.getElementById('type-filter')?.value || '';
    if (typeFilter) {
      transactions = transactions.filter(t => t.type === typeFilter);
    }

    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      transactions = transactions.filter(t =>
        t.type.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (!transactions.length) {
      tbody.innerHTML = `<tr><td colspan="5">No transactions found</td></tr>`;
      return;
    }

    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td>${t.id}</td>
        <td>${t.type}</td>
        <td>$${Number(t.amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </td>
        <td>${formatDate(t.date)}</td>
        <td>${t.status}</td>
      </tr>
    `).join('');
  },

  async saveTransaction() {
    const type = document.getElementById('txn-type').value;
    const amount = parseFloat(document.getElementById('txn-amount').value);
    const description = document.getElementById('txn-description').value.trim();

    const auth = JSON.parse(localStorage.getItem('erp_auth'));

    try {
      const response = await fetch('http://localhost:5000/api/finance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          type,
          amount,
          description,
          status: 'Completed'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        const detail = result.errors?.map(e => e.message).join(', ');
        throw new Error(detail || result.message || 'Failed to save transaction');
      }

      App.closeModal('transaction-modal');
      this.renderCards();
      this.renderTable();
      Toast.success('Transaction saved successfully.');

    } catch (err) {
      console.error(err);
      Toast.error(err.message);
    }
  },

  init() {
    this.renderCards();
    this.renderTable();

    document.getElementById('add-transaction-btn')?.addEventListener('click', () => {
      App.openModal('transaction-modal');
    });

    document.getElementById('save-transaction-btn')?.addEventListener('click', () => {
      this.saveTransaction();
    });

    document.getElementById('fin-search')?.addEventListener('input', (e) => {
      this.renderTable(e.target.value);
    });

    document.getElementById('type-filter')?.addEventListener('change', () => {
      this.renderTable(document.getElementById('fin-search')?.value || '');
    });
  }
};

// Replaced page-level DOMContentLoaded with App.init in app.js