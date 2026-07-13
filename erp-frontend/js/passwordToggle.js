/* ============================================
   Password Toggle Utility
   AI Cloud ERP Suite
   ============================================
   Usage: Include this script, then call
          PasswordToggle.init();
   ============================================ */

const PasswordToggle = (() => {
  'use strict';

  /**
   * Initialise toggle buttons.
   * Finds every `.password-toggle-btn` on the page,
   * resolves its target input via `data-target`, and
   * wires up the click handler.
   */
  function init() {
    const buttons = document.querySelectorAll('.password-toggle-btn');

    buttons.forEach((btn) => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;

      const input = document.getElementById(targetId);
      if (!input) return;

      // Prevent duplicate listeners if init() is called more than once
      if (btn.dataset.ptBound) return;
      btn.dataset.ptBound = 'true';

      const eyeIcon    = btn.querySelector('.eye-icon');
      const eyeOffIcon = btn.querySelector('.eye-off-icon');

      btn.addEventListener('click', () => {
        const isHidden = input.type === 'password';

        // Toggle input type
        input.type = isHidden ? 'text' : 'password';

        // Swap icon visibility
        if (eyeIcon)    eyeIcon.style.display    = isHidden ? 'none'  : 'block';
        if (eyeOffIcon) eyeOffIcon.style.display = isHidden ? 'block' : 'none';

        // Update accessibility attributes
        const label = isHidden ? 'Hide password' : 'Show password';
        btn.setAttribute('aria-label', label);
        btn.setAttribute('title', label);
      });
    });
  }

  return { init };
})();
