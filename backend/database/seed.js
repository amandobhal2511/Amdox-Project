/**
 * Database seed script
 * Inserts sample data and default admin user
 * Run: npm run db:seed
 */
const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/database');

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Default admin user (password: admin123)
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const userResult = await query(
      `INSERT INTO users (full_name, email, password, company_name, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['System Admin', 'admin@erp.com', hashedPassword, 'Acme Corporation', 'Admin']
    );

    let adminId = userResult.rows[0]?.id;
    if (!adminId) {
      const existing = await query('SELECT id FROM users WHERE email = $1', ['admin@erp.com']);
      adminId = existing.rows[0]?.id;
    }

    if (adminId) {
      await query(
        `INSERT INTO settings (user_id, dark_mode, notifications_enabled)
         VALUES ($1, TRUE, TRUE)
         ON CONFLICT (user_id) DO NOTHING`,
        [adminId]
      );
    }

    // Employees
    await query(`
      INSERT INTO employees (name, email, department, salary, status) VALUES
      ('Sarah Johnson', 'sarah.j@company.com', 'Engineering', 95000, 'Active'),
      ('Michael Chen', 'michael.c@company.com', 'Marketing', 78000, 'Active'),
      ('Emily Davis', 'emily.d@company.com', 'HR', 72000, 'Active'),
      ('James Wilson', 'james.w@company.com', 'Finance', 88000, 'Active'),
      ('Lisa Anderson', 'lisa.a@company.com', 'Engineering', 102000, 'Inactive')
      ON CONFLICT (email) DO NOTHING
    `);

    // Inventory
    await query(`
      INSERT INTO inventory (product_name, quantity, price, category, status) VALUES
      ('Wireless Mouse', 150, 29.99, 'Electronics', 'In Stock'),
      ('USB-C Hub', 8, 49.99, 'Electronics', 'Low Stock'),
      ('Office Chair', 45, 299.99, 'Furniture', 'In Stock'),
      ('Standing Desk', 0, 599.99, 'Furniture', 'Out of Stock'),
      ('Monitor 27"', 62, 349.99, 'Electronics', 'In Stock'),
      ('Keyboard Mechanical', 5, 89.99, 'Electronics', 'Low Stock')
    `);

    // Finance
    await query(`
      INSERT INTO finance (type, amount, date, status, description) VALUES
      ('Revenue', 15000, '2026-06-20', 'Completed', 'Client payment - Project Alpha'),
      ('Expense', 3200, '2026-06-18', 'Completed', 'Office supplies'),
      ('Revenue', 8500, '2026-06-15', 'Completed', 'Subscription revenue'),
      ('Expense', 12000, '2026-06-12', 'Completed', 'Employee salaries'),
      ('Revenue', 22000, '2026-06-10', 'Completed', 'Enterprise contract'),
      ('Expense', 4500, '2026-06-08', 'Pending', 'Cloud infrastructure')
    `);

    // Orders
    await query(`
      INSERT INTO orders (customer_name, product_name, quantity, price, status) VALUES
      ('TechCorp Inc.', 'Wireless Mouse', 50, 1499.50, 'Delivered'),
      ('StartupXYZ', 'USB-C Hub', 20, 999.80, 'Processing'),
      ('Global Solutions', 'Monitor 27"', 10, 3499.90, 'Pending'),
      ('Design Studio', 'Office Chair', 15, 4499.85, 'Delivered'),
      ('Dev Agency', 'Keyboard Mechanical', 30, 2699.70, 'Processing')
    `);

    // Notifications
    if (adminId) {
      await query(`
        INSERT INTO notifications (user_id, message, status) VALUES
        ($1, 'Payment of $15,000 received from TechCorp Inc.', 'Unread'),
        ($1, 'Order ORD-001 has been successfully delivered.', 'Unread'),
        ($1, 'Sarah Johnson has joined the Engineering team.', 'Read'),
        ($1, 'USB-C Hub is running low (8 units remaining).', 'Unread'),
        ($1, 'StartupXYZ placed an order for 20 USB-C Hubs.', 'Read')
      `, [adminId]);
    }

    console.log('Database seeded successfully.');
    console.log('Default admin login: admin@erp.com / admin123');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
