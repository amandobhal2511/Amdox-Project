const Settings = {
  settingsData: {
    darkMode: true,
    notificationsEnabled: true,
    fullName: '',
    email: '',
    companyName: ''
  },

  async getSettings() {
    try {
      const auth = JSON.parse(localStorage.getItem('erp_auth'));
      if (!auth?.token) return this.settingsData;

      const response = await fetch('http://localhost:5000/api/settings', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (!response.ok) return this.settingsData;

      const result = await response.json();
      return result.data || this.settingsData;

    } catch (err) {
      console.error(err);
      return this.settingsData;
    }
  },

  async saveSettings(data) {
    try {
      const auth = JSON.parse(localStorage.getItem('erp_auth'));

      await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify(data)
      });

    } catch (err) {
      console.error(err);
    }
  },

  async loadProfile() {
    const auth = JSON.parse(localStorage.getItem('erp_auth'));
    const settings = await this.getSettings();

    this.settingsData.fullName = settings.profile?.fullName || auth?.user?.name || '';
    this.settingsData.email = settings.profile?.email || auth?.user?.email || '';
    this.settingsData.companyName = settings.profile?.companyName || auth?.user?.company || '';

    document.getElementById('settings-name').value = this.settingsData.fullName;
    document.getElementById('settings-email').value = this.settingsData.email;
    document.getElementById('settings-company').value = this.settingsData.companyName;
  },

  async saveProfile() {
    this.settingsData.fullName = document.getElementById('settings-name').value.trim();
    this.settingsData.email = document.getElementById('settings-email').value.trim();
    this.settingsData.companyName = document.getElementById('settings-company').value.trim();

    await this.saveSettings(this.settingsData);
    this.showToast('Profile saved successfully');
  },

  async loadPreferences() {
    const settings = await this.getSettings();

    this.settingsData.darkMode = settings.darkMode !== undefined ? settings.darkMode : true;
    this.settingsData.notificationsEnabled = settings.notificationsEnabled !== undefined ? settings.notificationsEnabled : true;

    document.getElementById('dark-mode-toggle').checked = this.settingsData.darkMode;
    document.getElementById('notif-toggle').checked = this.settingsData.notificationsEnabled;
  },

  async savePreferences() {
    this.settingsData.darkMode = document.getElementById('dark-mode-toggle').checked;
    this.settingsData.notificationsEnabled = document.getElementById('notif-toggle').checked;

    await this.saveSettings(this.settingsData);

    App.applyTheme();
    this.showToast('Preferences saved');
  },

  initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(`tab-${tab}`)?.classList.add('active');
      });
    });
  },

  showToast(message) {
    Toast.success(message);
  },

  init() {
    this.initTabs();
    this.loadProfile();
    this.loadPreferences();

    document.getElementById('save-profile-btn')?.addEventListener('click', () => {
      this.saveProfile();
    });

    document.getElementById('save-preferences-btn')?.addEventListener('click', () => {
      this.savePreferences();
    });
  }
};

// Replaced page-level DOMContentLoaded with App.init in app.js