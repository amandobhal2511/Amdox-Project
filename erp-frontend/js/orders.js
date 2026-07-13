const Orders = {
  async getOrders() {
    try {
      const auth = JSON.parse(localStorage.getItem('erp_auth'));
      if (!auth?.token) return [];

      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch orders');
      }

      return result.data?.orders || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async renderStats() {
    const orders = await this.getOrders();

    const pending = orders.filter(o => o.status === 'Pending').length;
    const processing = orders.filter(o => o.status === 'Processing').length;
    const totalValue = orders.reduce((sum, o) => sum + Number(o.price), 0);

    document.getElementById('ord-total').textContent = orders.length;
    document.getElementById('ord-pending').textContent = pending;
    document.getElementById('ord-processing').textContent = processing;
    document.getElementById('ord-revenue').textContent = '$' + totalValue.toLocaleString();
  },

  async renderTable(filter = '') {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    let orders = await this.getOrders();

    if (filter) {
      const q = filter.toLowerCase();
      orders = orders.filter(o =>
        o.customerName.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q)
      );
    }

    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="7">No orders found</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customerName}</td>
        <td>${o.productName}</td>
        <td>${o.quantity}</td>
        <td>$${o.price}</td>
        <td>${o.status}</td>
        <td>
          <button class="delete-btn" data-id="${o.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteOrder(btn.dataset.id));
    });
  },

  async saveOrder() {
    const customer = document.getElementById('ord-customer').value.trim();
    const product = document.getElementById('ord-product').value.trim();
    const quantity = parseInt(document.getElementById('ord-quantity').value);
    const price = parseFloat(document.getElementById('ord-price').value);
    const status = document.getElementById('ord-status').value;

    const auth = JSON.parse(localStorage.getItem('erp_auth'));

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          customerName: customer,
          productName: product,
          quantity,
          price,
          status
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      App.closeModal('order-modal');
      this.renderStats();
      this.renderTable();
      Toast.success('Order saved successfully.');

    } catch (err) {
      console.error(err);
      Toast.error(err.message);
    }
  },

  async deleteOrder(id) {
    const auth = JSON.parse(localStorage.getItem('erp_auth'));

    try {
      await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      this.renderStats();
      this.renderTable();

    } catch (err) {
      console.error(err);
    }
  },

  init() {
    this.renderStats();
    this.renderTable();

    document.getElementById('add-order-btn')?.addEventListener('click', () => {
      App.openModal('order-modal');
    });

    document.getElementById('save-order-btn')?.addEventListener('click', () => {
      this.saveOrder();
    });

    document.getElementById('ord-search')?.addEventListener('input', (e) => {
      this.renderTable(e.target.value);
    });
  }
};

// Replaced page-level DOMContentLoaded with App.init in app.js