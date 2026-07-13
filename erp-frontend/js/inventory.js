const Inventory = {
  editingId: null,

  async getProducts() {
    try {
      const auth = JSON.parse(localStorage.getItem('erp_auth'));
      if (!auth?.token) return [];

      const response = await fetch('http://localhost:5000/api/inventory', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch inventory');
      }

      return result.data.products || [];
    } catch (err) {
      console.error('Inventory fetch error:', err);
      return [];
    }
  },

  getStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  },

  async renderStats() {
    const products = await this.getProducts();

    const inStock = products.filter(p => p.quantity >= 10).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
    const totalValue = products.reduce((sum, p) => {
      return sum + (Number(p.quantity) * Number(p.price));
    }, 0);

    document.getElementById('inv-total').textContent = products.length;
    document.getElementById('inv-instock').textContent = inStock;
    document.getElementById('inv-low').textContent = lowStock;
    document.getElementById('inv-value').textContent = '$' + totalValue.toLocaleString();
  },

  async renderTable(filter = '') {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    let products = await this.getProducts();

    if (filter) {
      const q = filter.toLowerCase();
      products = products.filter(p =>
        p.productName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (!products.length) {
      tbody.innerHTML = `<tr><td colspan="7">No products found</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => {
      const status = this.getStatus(Number(p.quantity));

      return `
        <tr>
          <td>${p.id}</td>
          <td>${p.productName}</td>
          <td>${p.quantity}</td>
          <td>$${p.price}</td>
          <td>${p.category}</td>
          <td>${status}</td>
          <td>
            <button class="delete-btn" data-id="${p.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteProduct(btn.dataset.id));
    });
  },

  async saveProduct() {
    const name = document.getElementById('prod-name').value.trim();
    const quantity = parseInt(document.getElementById('prod-quantity').value);
    const price = parseFloat(document.getElementById('prod-price').value);
    const category = document.getElementById('prod-category').value;

    const auth = JSON.parse(localStorage.getItem('erp_auth'));

    try {
      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name,
          quantity,
          price,
          category
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      App.closeModal('product-modal');
      this.renderStats();
      this.renderTable();
      Toast.success('Product saved successfully.');

    } catch (err) {
      console.error(err);
      Toast.error(err.message);
    }
  },

  async deleteProduct(id) {
    const auth = JSON.parse(localStorage.getItem('erp_auth'));

    try {
      await fetch(`http://localhost:5000/api/inventory/${id}`, {
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

    document.getElementById('add-product-btn')?.addEventListener('click', () => {
      App.openModal('product-modal');
    });

    document.getElementById('save-product-btn')?.addEventListener('click', () => {
      this.saveProduct();
    });

    document.getElementById('inv-search')?.addEventListener('input', (e) => {
      this.renderTable(e.target.value);
    });
  }
};

// document.addEventListener('DOMContentLoaded', () => {
//   Inventory.init();
// });