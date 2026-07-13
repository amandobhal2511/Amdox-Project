/**
 * Dashboard Service
 * Live analytics from PostgreSQL (finance, orders, inventory, employees)
 */
const { query } = require('../config/database');

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class DashboardService {
  /**
   * Build last N month slots ending at current month
   */
  getLastMonths(count = 6) {
    const months = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: MONTH_LABELS[d.getMonth()],
      });
    }
    return months;
  }

  async getRevenueOverview() {
    const months = this.getLastMonths(6);
    const startKey = months[0].key;

    const result = await query(
      `SELECT TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month_key,
              COALESCE(SUM(amount), 0) AS total
       FROM finance
       WHERE type = 'Revenue'
         AND status = 'Completed'
         AND date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
       GROUP BY DATE_TRUNC('month', date)
       ORDER BY month_key ASC`,
      []
    );

    const byMonth = {};
    result.rows.forEach((row) => {
      byMonth[row.month_key] = parseFloat(row.total);
    });

    const values = months.map((m) => byMonth[m.key] || 0);
    const hasData = values.some((v) => v > 0);

    return {
      labels: months.map((m) => m.label),
      values,
      hasData,
    };
  }

  async getOrdersOverview() {
    // Schema supports status: Pending, Processing, Delivered
    const result = await query(
      `SELECT status, COUNT(*)::int AS count
       FROM orders
       GROUP BY status
       ORDER BY status ASC`
    );

    const statusOrder = ['Pending', 'Processing', 'Delivered'];
    const byStatus = {};
    result.rows.forEach((row) => {
      byStatus[row.status] = row.count;
    });

    const labels = statusOrder.filter((s) => byStatus[s] !== undefined || result.rows.length === 0);
    const values = statusOrder.map((s) => byStatus[s] || 0);
    const hasData = values.some((v) => v > 0);

    // If no orders at all, still return all statuses with zeros for consistent chart
    return {
      labels: statusOrder,
      values,
      hasData,
      mode: 'status',
    };
  }

  async getSalesGrowth() {
    const currentResult = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM finance
       WHERE type = 'Revenue'
         AND status = 'Completed'
         AND date >= DATE_TRUNC('month', CURRENT_DATE)`
    );

    const previousResult = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM finance
       WHERE type = 'Revenue'
         AND status = 'Completed'
         AND date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
         AND date < DATE_TRUNC('month', CURRENT_DATE)`
    );

    const currentMonthRevenue = parseFloat(currentResult.rows[0].total);
    const previousMonthRevenue = parseFloat(previousResult.rows[0].total);

    // Require prior month revenue to compute a meaningful MoM comparison
    const hasData = previousMonthRevenue > 0;
    let growthPercent = null;
    if (hasData) {
      growthPercent = parseFloat(
        (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)
      );
    }

    return {
      hasData,
      currentMonthRevenue,
      previousMonthRevenue,
      growthPercent,
    };
  }

  async getInventoryStatus() {
    const result = await query(
      `SELECT status, COUNT(*)::int AS count
       FROM inventory
       GROUP BY status`
    );

    const counts = { 'In Stock': 0, 'Low Stock': 0, 'Out of Stock': 0 };
    result.rows.forEach((row) => {
      if (counts[row.status] !== undefined) {
        counts[row.status] = row.count;
      }
    });

    const total = counts['In Stock'] + counts['Low Stock'] + counts['Out of Stock'];

    return {
      inStock: counts['In Stock'],
      lowStock: counts['Low Stock'],
      outOfStock: counts['Out of Stock'],
      total,
      hasData: total > 0,
    };
  }

  async getRecentActivity() {
    const financeRows = await query(
      `SELECT id, type, amount, description, date, created_at
       FROM finance
       ORDER BY created_at DESC
       LIMIT 5`
    );

    const orderRows = await query(
      `SELECT id, customer_name, product_name, status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 5`
    );

    const employeeRows = await query(
      `SELECT id, name, department, created_at
       FROM employees
       ORDER BY created_at DESC
       LIMIT 5`
    );

    const activities = [];

    financeRows.rows.forEach((row) => {
      const desc = row.description
        ? `${row.description} (${row.type}: $${parseFloat(row.amount).toLocaleString()})`
        : `${row.type} transaction: $${parseFloat(row.amount).toLocaleString()}`;
      activities.push({
        type: 'finance',
        title: row.type === 'Revenue' ? 'Payment received' : 'Expense recorded',
        description: desc,
        timestamp: row.created_at || row.date,
      });
    });

    orderRows.rows.forEach((row) => {
      activities.push({
        type: 'order',
        title: `Order ${row.status}`,
        description: `${row.customer_name} — ${row.product_name}`,
        timestamp: row.created_at,
      });
    });

    employeeRows.rows.forEach((row) => {
      activities.push({
        type: 'employee',
        title: 'New employee joined',
        description: `${row.name} joined ${row.department}`,
        timestamp: row.created_at,
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      items: activities.slice(0, 8),
      hasData: activities.length > 0,
    };
  }

  async getDepartmentDistribution() {
    const result = await query(
      `SELECT department, COUNT(*)::int AS count
       FROM employees
       WHERE status = 'Active'
       GROUP BY department
       ORDER BY count DESC`
    );

    return {
      labels: result.rows.map((r) => r.department),
      values: result.rows.map((r) => r.count),
      hasData: result.rows.length > 0,
    };
  }

  async getStats() {
    const employees = await query("SELECT COUNT(*) AS count FROM employees WHERE status = 'Active'");
    const products = await query('SELECT COUNT(*) AS count FROM inventory');
    const revenue = await query("SELECT COALESCE(SUM(amount), 0) AS total FROM finance WHERE type = 'Revenue' AND status = 'Completed'");
    const pendingOrders = await query("SELECT COUNT(*) AS count FROM orders WHERE status = 'Pending'");
    const expenseResult = await query("SELECT COALESCE(SUM(amount), 0) AS total FROM finance WHERE type = 'Expense' AND status = 'Completed'");
    const revenueOverview = await this.getRevenueOverview();
    const ordersOverview = await this.getOrdersOverview();
    const salesGrowth = await this.getSalesGrowth();
    const inventoryStatus = await this.getInventoryStatus();
    const recentActivity = await this.getRecentActivity();
    const departmentDistribution = await this.getDepartmentDistribution();

    const totalRevenue = parseFloat(revenue.rows[0].total);
    const totalExpense = parseFloat(expenseResult.rows[0].total);

    return {
      // Top stat cards (unchanged shape for backward compatibility)
      totalEmployees: parseInt(employees.rows[0].count, 10),
      totalProducts: parseInt(products.rows[0].count, 10),
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      pendingOrders: parseInt(pendingOrders.rows[0].count, 10),

      // Dashboard widgets
      revenueOverview,
      ordersOverview,
      salesGrowth,
      inventoryStatus,
      recentActivity,
      departmentDistribution,
    };
  }
}

module.exports = new DashboardService();
