const Employees = {
  editingId: null,

  getAuth() {
    try {
      return JSON.parse(localStorage.getItem('erp_auth')) || null;
    } catch {
      return null;
    }
  },

  async getEmployees() {
    try {
      const auth = this.getAuth();
      if (!auth?.token) return [];

      const response = await fetch('http://localhost:5000/api/employees', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      // backend response shape: { success, message, data: { employees, ... } }
      if (Array.isArray(result.data)) return result.data;
      return result.data?.employees || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async renderStats() {
    const employees = await this.getEmployees();

    const active = employees.filter(e => e.status === 'Active').length;
    const departments = [...new Set(employees.map(e => e.department))].length;
    const avgSalary = employees.length
      ? Math.round(employees.reduce((s, e) => s + Number(e.salary), 0) / employees.length)
      : 0;

    document.getElementById('emp-total').textContent = employees.length;
    document.getElementById('emp-active').textContent = active;
    document.getElementById('emp-depts').textContent = departments;
    document.getElementById('emp-avg-salary').textContent = '$' + avgSalary;
  },

  async renderTable() {
    const tbody = document.getElementById('employees-table-body');
    if (!tbody) return;

    const employees = await this.getEmployees();

    if (!employees.length) {
      tbody.innerHTML = `<tr><td colspan="7">No employees found</td></tr>`;
      return;
    }

    tbody.innerHTML = employees.map(emp => `
      <tr>
        <td>${emp.id}</td>
        <td>${emp.name}</td>
        <td>${emp.department}</td>
        <td>${emp.email}</td>
        <td>$${emp.salary}</td>
        <td>${emp.status}</td>
        <td>
          <button class="delete-btn" data-id="${emp.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteEmployee(btn.dataset.id));
    });
  },

  openAddModal() {
    this.editingId = null;
    document.getElementById('employee-modal-title').textContent = 'Add Employee';
    document.getElementById('emp-name').value = '';
    document.getElementById('emp-email').value = '';
    document.getElementById('emp-department').value = 'Engineering';
    document.getElementById('emp-salary').value = '';
    App.openModal('employee-modal');
  },

  async saveEmployee() {
    const name = document.getElementById('emp-name').value.trim();
    const email = document.getElementById('emp-email').value.trim();
    const department = document.getElementById('emp-department').value;
    const salary = parseFloat(document.getElementById('emp-salary').value);

    if (!name || !email || !department || Number.isNaN(salary)) {
      Toast.warning('Please fill in all fields correctly.');
      return;
    }

    if (!Auth.isValidEmail(email)) {
      Toast.warning('Please enter a valid email address.');
      return;
    }

    const auth = this.getAuth();
    if (!auth?.token) {
      Toast.error('You are not logged in. Please login again.');
      window.location.href = 'login.html';
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name,
          email,
          department,
          salary,
          status: 'Active'
        })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        Toast.error(json.message || 'Failed to add employee.');
        return;
      }

      App.closeModal('employee-modal');
      this.renderStats();
      this.renderTable();
      Toast.success('Employee added successfully.');

    } catch (err) {
      console.error(err);
      Toast.error('Network error. Please try again.');
    }
  },

  async deleteEmployee(id) {
    const auth = this.getAuth();
    if (!auth?.token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        Toast.error(json.message || 'Failed to delete employee.');
        return;
      }

      this.renderStats();
      this.renderTable();
      Toast.success('Employee deleted successfully.');
    } catch (err) {
      console.error(err);
      Toast.error('Network error. Please try again.');
    }
  },

  init() {
    this.renderStats();
    this.renderTable();

    // Open modal (this was missing and caused Add Employee to not work)
    document.getElementById('add-employee-btn')?.addEventListener('click', () => {
      this.openAddModal();
    });

    document.getElementById('save-employee-btn')?.addEventListener('click', () => {
      this.saveEmployee();
    });
  }
};

// Replaced page-level DOMContentLoaded with App.init in app.js