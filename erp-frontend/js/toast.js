/**
 * Toast Notification Utility
 * Reusable top-right toast system for the ERP suite.
 */

const Toast = {
  DURATION: 3000,
  container: null,

  icons: {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  },

  init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', duration = this.DURATION) {
    if (!message) return;

    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${this.icons[type] || this.icons.info}</span>
      <span class="toast-message">${this.escapeHtml(String(message))}</span>
      <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
    `;

    const dismiss = () => this.dismiss(toast);
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', dismiss);

    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    const timeoutId = setTimeout(dismiss, duration);
    toast._timeoutId = timeoutId;
  },

  dismiss(toast) {
    if (!toast || toast.classList.contains('toast-hide')) return;

    clearTimeout(toast._timeoutId);
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');

    toast.addEventListener('transitionend', () => {
      toast.remove();
    }, { once: true });

    setTimeout(() => toast.remove(), 400);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'error', duration);
  },

  warning(message, duration) {
    this.show(message, 'warning', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  }
};
