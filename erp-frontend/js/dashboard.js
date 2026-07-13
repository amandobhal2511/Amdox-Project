/**
 * Dashboard Module
 * Live data from GET /api/dashboard/stats
 */

const Dashboard = {
  revenueChart: null,
  ordersChart: null,
  departmentChart: null,

  API_URL: 'http://localhost:5000/api/dashboard/stats',

  animateNumber(element, target, duration = 1200) {
    const start = 0;
    const startTime = performance.now();
    const isCurrency = element.dataset.format === 'currency';

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);

      if (isCurrency) {
        element.textContent = '$' + current.toLocaleString();
      } else {
        element.textContent = current.toLocaleString();
      }

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  },

  async getAnalytics() {
    try {
      const auth = JSON.parse(localStorage.getItem('erp_auth'));
      if (!auth?.token) return null;

      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to fetch stats');
      return result.data;
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      return null;
    }
  },

  emptyState(message) {
    return `
      <div class="empty-state py-8">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <p class="text-sm font-medium text-slate-400">${message}</p>
      </div>`;
  },

  chartTooltipOptions() {
    return {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      padding: 12,
    };
  },

  renderStats(data) {
    const cards = [
      { id: 'stat-employees', value: data.totalEmployees },
      { id: 'stat-products', value: data.totalProducts },
      { id: 'stat-revenue', value: data.totalRevenue, format: 'currency' },
      { id: 'stat-orders', value: data.pendingOrders },
    ];

    cards.forEach((card) => {
      const el = document.getElementById(card.id);
      if (el) {
        el.dataset.format = card.format || 'number';
        this.animateNumber(el, card.value || 0);
      }
    });
  },

  renderRevenueChart(overview) {
    const canvas = document.getElementById('revenue-chart');
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    if (this.revenueChart) {
      this.revenueChart.destroy();
      this.revenueChart = null;
    }

    if (!overview?.hasData) {
      container.innerHTML = this.emptyState('No revenue data for the last 6 months');
      return;
    }

    // Restore canvas if replaced by empty state
    if (!document.getElementById('revenue-chart')) {
      container.innerHTML = '<canvas id="revenue-chart"></canvas>';
    }

    const ctx = document.getElementById('revenue-chart').getContext('2d');
    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: overview.labels,
        datasets: [{
          label: 'Revenue',
          data: overview.values,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...this.chartTooltipOptions(),
            callbacks: {
              label: (ctx) => ' $' + ctx.parsed.y.toLocaleString(),
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#64748b' },
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: {
              color: '#64748b',
              callback: (v) => '$' + (v >= 1000 ? (v / 1000) + 'k' : v),
            },
          },
        },
      },
    });
  },

  renderOrdersChart(overview) {
    const canvas = document.getElementById('orders-chart');
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    if (this.ordersChart) {
      this.ordersChart.destroy();
      this.ordersChart = null;
    }

    if (!overview?.hasData) {
      container.innerHTML = this.emptyState('No orders recorded yet');
      return;
    }

    if (!document.getElementById('orders-chart')) {
      container.innerHTML = '<canvas id="orders-chart"></canvas>';
    }

    const statusColors = {
      Pending: 'rgba(234, 179, 8, 0.8)',
      Processing: 'rgba(59, 130, 246, 0.8)',
      Delivered: 'rgba(34, 197, 94, 0.8)',
    };

    const colors = overview.labels.map((label) => statusColors[label] || 'rgba(139, 92, 246, 0.8)');

    const ctx = document.getElementById('orders-chart').getContext('2d');
    this.ordersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: overview.labels,
        datasets: [{
          label: 'Orders',
          data: overview.values,
          backgroundColor: colors,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: this.chartTooltipOptions(),
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b' },
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: {
              color: '#64748b',
              stepSize: 1,
              precision: 0,
            },
          },
        },
      },
    });
  },

  renderSalesGrowth(growth) {
    const container = document.getElementById('qa-sales');
    if (!container) return;

    if (!growth?.hasData) {
      container.innerHTML = this.emptyState('Not enough revenue history to calculate growth');
      return;
    }

    const isPositive = growth.growthPercent >= 0;
    const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
    const sign = isPositive ? '+' : '';

    container.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-slate-400">Month-over-Month</span>
        <span class="text-sm font-semibold ${colorClass}">${sign}${growth.growthPercent}%</span>
      </div>
      <div class="w-full bg-slate-700/50 rounded-full h-2">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
          style="width: ${Math.min(100, Math.abs(growth.growthPercent))}%"></div>
      </div>
      <p class="text-xs text-slate-500 mt-3">
        $${growth.currentMonthRevenue.toLocaleString()} this month vs
        $${growth.previousMonthRevenue.toLocaleString()} last month
      </p>`;
  },

  renderInventoryStatus(status) {
    const container = document.getElementById('qa-inventory');
    if (!container) return;

    if (!status?.hasData) {
      container.innerHTML = this.emptyState('No inventory items found');
      return;
    }

    container.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-sm text-slate-400">In Stock</span>
          <span class="text-sm font-medium text-green-400">${status.inStock} items</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-slate-400">Low Stock</span>
          <span class="text-sm font-medium text-yellow-400">${status.lowStock} items</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-slate-400">Out of Stock</span>
          <span class="text-sm font-medium text-red-400">${status.outOfStock} items</span>
        </div>
      </div>`;
  },

  renderRecentActivity(activity) {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    if (!activity?.hasData || !activity.items?.length) {
      container.innerHTML = this.emptyState('No recent activity');
      return;
    }

    const icons = {
      finance: '💰',
      order: '📦',
      employee: '👤',
    };

    const iconColors = {
      finance: 'bg-purple-500/20',
      order: 'bg-indigo-500/20',
      employee: 'bg-blue-500/20',
    };

    container.innerHTML = activity.items
      .map(
        (item, i) => `
        <div class="flex items-start gap-3 py-3 ${i < activity.items.length - 1 ? 'border-b border-slate-700/50' : ''}">
          <div class="w-10 h-10 rounded-lg ${iconColors[item.type] || 'bg-slate-500/20'} flex items-center justify-center text-lg flex-shrink-0">
            ${icons[item.type] || '🔔'}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-200">${item.title}</p>
            <p class="text-xs text-slate-400 mt-0.5 truncate">${item.description}</p>
          </div>
          <span class="text-xs text-slate-500 flex-shrink-0">${App.timeAgo(item.timestamp)}</span>
        </div>`
      )
      .join('');
  },

  renderDepartmentDistribution(distribution) {
    const container = document.getElementById('qa-performance');
    if (!container) return;

    if (this.departmentChart) {
      this.departmentChart.destroy();
      this.departmentChart = null;
    }

    if (!distribution?.hasData) {
      container.innerHTML = this.emptyState('No active employees to display');
      container.classList.remove('max-w-md');
      return;
    }

    container.classList.add('max-w-md');
    container.innerHTML = '<div class="chart-container" style="height:220px"><canvas id="department-chart"></canvas></div>';

    const ctx = document.getElementById('department-chart').getContext('2d');
    const palette = ['#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#60a5fa', '#818cf8'];

    this.departmentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: distribution.labels,
        datasets: [{
          data: distribution.values,
          backgroundColor: distribution.labels.map((_, i) => palette[i % palette.length]),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', boxWidth: 12, padding: 12 },
          },
          tooltip: this.chartTooltipOptions(),
        },
      },
    });
  },

  async init() {
    const data = await this.getAnalytics();
    if (!data) return;

    this.renderStats(data);
    this.renderRevenueChart(data.revenueOverview);
    this.renderOrdersChart(data.ordersOverview);
    this.renderSalesGrowth(data.salesGrowth);
    this.renderInventoryStatus(data.inventoryStatus);
    this.renderRecentActivity(data.recentActivity);
    this.renderDepartmentDistribution(data.departmentDistribution);
  },
};
