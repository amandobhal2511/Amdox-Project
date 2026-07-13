/**
 * Core Application Module
 * Shared utilities, sidebar, API helpers, notifications, and layout init.
 */

const App = {
  API_BASE: '/api', // Change to your backend URL when integrating

  /**
   * Generic API fetch wrapper — ready for backend integration
   */
  async apiFetch(endpoint, options = {}) {
    const auth = Auth.getAuth();
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth.token || ''}` } : {})
    };

    const response = await fetch(`${this.API_BASE}${endpoint}`, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get/set localStorage data with a key
   */
  getData(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * Generate unique ID
   */
  generateId(prefix = 'ID') {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  },

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Format date
   */
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Get status badge HTML
   */
  getBadge(status) {
    const map = {
      active: 'badge-success',
      inactive: 'badge-danger',
      pending: 'badge-warning',
      processing: 'badge-info',
      delivered: 'badge-success',
      completed: 'badge-success',
      'in stock': 'badge-success',
      'low stock': 'badge-warning',
      'out of stock': 'badge-danger',
      revenue: 'badge-success',
      expense: 'badge-danger',
      paid: 'badge-success',
      unpaid: 'badge-warning'
    };
    const cls = map[status.toLowerCase()] || 'badge-info';
    return `<span class="badge ${cls}">${status}</span>`;
  },

  /**
   * Initialize sidebar navigation and mobile toggle
   */
  initSidebar() {
    const currentPage = document.body.dataset.page;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const logoutBtn = document.getElementById('logout-btn');

    // Highlight active nav link
    document.querySelectorAll('.sidebar-link').forEach(link => {
      if (link.dataset.page === currentPage) {
        link.classList.add('active');
      }
    });

    // Mobile toggle
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar?.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }
  },

  /**
   * Populate navbar user info
   */
  initNavbar() {
    const auth = Auth.getAuth();
    if (!auth) return;

    const usernameEl = document.getElementById('nav-username');
    const avatarEl = document.getElementById('nav-avatar');
    const pageTitle = document.getElementById('page-title');

    if (usernameEl) usernameEl.textContent = auth.user.name;
    if (avatarEl) {
      const initials = auth.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      avatarEl.textContent = initials;
    }
    if (pageTitle && document.body.dataset.pageTitle) {
      pageTitle.textContent = document.body.dataset.pageTitle;
    }

    // Update notification bell count
    this.updateNotifBadge();
  },
  initRoleBasedSidebar() {
    const auth = JSON.parse(localStorage.getItem('erp_auth'));

    if (!auth?.user?.role) return;

    const role = auth.user.role;

    if (role === 'Employee') {
      document.getElementById('employees-link')?.remove();
      document.getElementById('finance-link')?.remove();
      document.getElementById('orders-link')?.remove();
    }
  },

  /**
   * Update notification badge count in navbar
   */
  updateNotifBadge() {
    const notifications = this.getData('erp_notifications', []);
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }
  },

  /**
   * Apply dark/light mode from settings
   */
  applyTheme() {
    const settings = this.getData('erp_settings', { darkMode: true });
    if (settings.darkMode === false) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  },

  /**
   * Modal helpers
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  initModalClose() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.closeModal;
        if (modalId) this.closeModal(modalId);
      });
    });
  },

  /**
   * Seed default data if localStorage is empty
   */
  seedDefaultData() {
    if (!this.getData('erp_employees').length) {
      this.setData('erp_employees', [
        { id: 'EMP-001', name: 'Sarah Johnson', department: 'Engineering', email: 'sarah.j@company.com', salary: 95000, status: 'Active' },
        { id: 'EMP-002', name: 'Michael Chen', department: 'Marketing', email: 'michael.c@company.com', salary: 78000, status: 'Active' },
        { id: 'EMP-003', name: 'Emily Davis', department: 'HR', email: 'emily.d@company.com', salary: 72000, status: 'Active' },
        { id: 'EMP-004', name: 'James Wilson', department: 'Finance', email: 'james.w@company.com', salary: 88000, status: 'Active' },
        { id: 'EMP-005', name: 'Lisa Anderson', department: 'Engineering', email: 'lisa.a@company.com', salary: 102000, status: 'Inactive' }
      ]);
    }

    if (!this.getData('erp_inventory').length) {
      this.setData('erp_inventory', [
        { id: 'PRD-001', name: 'Wireless Mouse', quantity: 150, price: 29.99, category: 'Electronics', status: 'In Stock' },
        { id: 'PRD-002', name: 'USB-C Hub', quantity: 8, price: 49.99, category: 'Electronics', status: 'Low Stock' },
        { id: 'PRD-003', name: 'Office Chair', quantity: 45, price: 299.99, category: 'Furniture', status: 'In Stock' },
        { id: 'PRD-004', name: 'Standing Desk', quantity: 0, price: 599.99, category: 'Furniture', status: 'Out of Stock' },
        { id: 'PRD-005', name: 'Monitor 27"', quantity: 62, price: 349.99, category: 'Electronics', status: 'In Stock' },
        { id: 'PRD-006', name: 'Keyboard Mechanical', quantity: 5, price: 89.99, category: 'Electronics', status: 'Low Stock' }
      ]);
    }

    if (!this.getData('erp_finance').length) {
      this.setData('erp_finance', [
        { id: 'TXN-001', type: 'Revenue', amount: 15000, date: '2026-06-20', status: 'Paid', description: 'Client payment - Project Alpha' },
        { id: 'TXN-002', type: 'Expense', amount: 3200, date: '2026-06-18', status: 'Paid', description: 'Office supplies' },
        { id: 'TXN-003', type: 'Revenue', amount: 8500, date: '2026-06-15', status: 'Paid', description: 'Subscription revenue' },
        { id: 'TXN-004', type: 'Expense', amount: 12000, date: '2026-06-12', status: 'Paid', description: 'Employee salaries' },
        { id: 'TXN-005', type: 'Revenue', amount: 22000, date: '2026-06-10', status: 'Paid', description: 'Enterprise contract' },
        { id: 'TXN-006', type: 'Expense', amount: 4500, date: '2026-06-08', status: 'Unpaid', description: 'Cloud infrastructure' }
      ]);
    }

    if (!this.getData('erp_orders').length) {
      this.setData('erp_orders', [
        { id: 'ORD-001', customer: 'TechCorp Inc.', product: 'Wireless Mouse', quantity: 50, price: 1499.50, status: 'Delivered' },
        { id: 'ORD-002', customer: 'StartupXYZ', product: 'USB-C Hub', quantity: 20, price: 999.80, status: 'Processing' },
        { id: 'ORD-003', customer: 'Global Solutions', product: 'Monitor 27"', quantity: 10, price: 3499.90, status: 'Pending' },
        { id: 'ORD-004', customer: 'Design Studio', product: 'Office Chair', quantity: 15, price: 4499.85, status: 'Delivered' },
        { id: 'ORD-005', customer: 'Dev Agency', product: 'Keyboard Mechanical', quantity: 30, price: 2699.70, status: 'Processing' }
      ]);
    }

    if (!this.getData('erp_notifications').length) {
      this.setData('erp_notifications', [
        { id: 'NOT-001', title: 'Payment Received', message: 'Payment of $15,000 received from TechCorp Inc.', type: 'payment', read: false, time: '2026-06-20T10:30:00' },
        { id: 'NOT-002', title: 'Order Delivered', message: 'Order ORD-001 has been successfully delivered.', type: 'order', read: false, time: '2026-06-19T14:15:00' },
        { id: 'NOT-003', title: 'New Employee Joined', message: 'Sarah Johnson has joined the Engineering team.', type: 'employee', read: true, time: '2026-06-18T09:00:00' },
        { id: 'NOT-004', title: 'Low Stock Alert', message: 'USB-C Hub is running low (8 units remaining).', type: 'inventory', read: false, time: '2026-06-17T16:45:00' },
        { id: 'NOT-005', title: 'New Order Placed', message: 'StartupXYZ placed an order for 20 USB-C Hubs.', type: 'order', read: true, time: '2026-06-16T11:20:00' }
      ]);
    }

    if (!localStorage.getItem('erp_settings')) {
      this.setData('erp_settings', {
        darkMode: true,
        notifications: true,
        name: '',
        email: '',
        company: ''
      });
    }
  },

  /**
   * Relative time helper
   */
  timeAgo(dateStr) {
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  },

  /**
   * Main app initialization — call on every protected page
   */
  init() {
    if (!Auth.requireAuth()) return;

    this.applyTheme();
    this.initSidebar();
    this.initRoleBasedSidebar();
    this.initNavbar();
    this.initModalClose();

    const page = document.body.dataset.page;
    switch (page) {
      case 'dashboard':
        if (typeof Dashboard !== 'undefined') Dashboard.init();
        break;
      case 'employees':
        if (typeof Employees !== 'undefined') Employees.init();
        break;
      case 'inventory':
        if (typeof Inventory !== 'undefined') Inventory.init();
        break;
      case 'finance':
        if (typeof Finance !== 'undefined') Finance.init();
        break;
      case 'orders':
        if (typeof Orders !== 'undefined') Orders.init();
        break;
      case 'notifications':
        if (typeof Notifications !== 'undefined') {
            Notifications.init();
        }
        break;
      case 'settings':
        if (typeof Settings !== 'undefined') Settings.init();
        break;
    }
  }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page) {
    App.init();
  }
});

// Re-check auth when a protected page becomes visible (Back/Forward navigation)
window.addEventListener('pageshow', () => {
  if (document.body.dataset.page) {
    Auth.requireAuth();
  }
});
