/**
 * Authentication Module
 * Backend Integrated with Node + Express + PostgreSQL
 */

const Auth = {
  STORAGE_KEY: 'erp_auth',

  getAuth() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    const auth = this.getAuth();
    return auth && auth.loggedIn === true;
  },

  setAuth(userData, token) {
    const auth = {
      loggedIn: true,
      token: token,
      user: {
        name: userData.name,
        email: userData.email,
        company: userData.company || 'My Company',
        role: userData.role
      },
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(auth));
    return auth;
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    window.location.href = 'login.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  },

  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + '-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
  },

  clearErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.querySelectorAll('.error-msg').forEach(el => {
      el.textContent = '';
      el.classList.remove('show');
    });
  },

  async login(email, password, rememberMe) {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const userData = {
      name: data.data.user.fullName,
      email: data.data.user.email,
      company: data.data.user.companyName,
      role: data.data.user.role
    };

    this.setAuth(userData, data.data.token);

    if (rememberMe) {
      localStorage.setItem('erp_remember', email);
    } else {
      localStorage.removeItem('erp_remember');
    }

    return data;
  },

  async signup(name, email, password, company) {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: name,
        email,
        password,
        companyName: company,
        role: 'Employee'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    const userData = {
      name: data.data.user.fullName,
      email: data.data.user.email,
      company: data.data.user.companyName,
      role: data.data.user.role
    };

    this.setAuth(userData, data.data.token);

    return data;
  },

  initLogin() {
    if (this.redirectIfLoggedIn()) return;

    const remembered = localStorage.getItem('erp_remember');
    if (remembered) {
      const emailInput = document.getElementById('email');
      const rememberCheckbox = document.getElementById('remember');
      if (emailInput) emailInput.value = remembered;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors('login-form');

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('remember').checked;

      let valid = true;

      if (!email) {
        this.showError('email', 'Email is required');
        valid = false;
      }

      if (!password) {
        this.showError('password', 'Password is required');
        valid = false;
      }

      if (!valid) return;

      const btn = document.getElementById('login-btn');
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      try {
        await this.login(email, password, rememberMe);
        Toast.success('Welcome back! Redirecting...');
        window.location.href = 'dashboard.html';
      } catch (err) {
        this.showError('password', err.message);
        Toast.error(err.message);
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  },

  initSignup() {
    if (this.redirectIfLoggedIn()) return;

    const form = document.getElementById('signup-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors('signup-form');

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const company = document.getElementById('company').value.trim();

      let valid = true;

      if (!name) {
        this.showError('name', 'Full name is required');
        valid = false;
      }

      if (!email) {
        this.showError('email', 'Email is required');
        valid = false;
      }

      if (!password) {
        this.showError('password', 'Password is required');
        valid = false;
      }

      if (password !== confirmPassword) {
        this.showError('confirm-password', 'Passwords do not match');
        valid = false;
      }

      if (!company) {
        this.showError('company', 'Company name is required');
        valid = false;
      }

      if (!valid) return;

      const btn = document.getElementById('signup-btn');
      btn.disabled = true;
      btn.textContent = 'Creating account...';

      try {
        await this.signup(name, email, password, company);
        Toast.success('Account created! Redirecting...');
        window.location.href = 'dashboard.html';
      } catch (err) {
        this.showError('email', err.message);
        Toast.error(err.message);
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  }
};