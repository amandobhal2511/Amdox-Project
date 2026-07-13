/* ============================================
   Loading Overlay Utility
   AI Cloud ERP Suite
   ============================================
   Usage:
     Loading.show();   // show overlay (ref-counted)
     Loading.hide();   // hide when all callers done
     Loading.init();   // optional pre-creation
   ============================================ */

const Loading = (() => {
  'use strict';

  let _count = 0;
  let _overlay = null;

  /**
   * Lazily create the overlay DOM on first need.
   * Safe to call multiple times — only creates once.
   */
  function _ensureDOM() {
    if (_overlay) return;

    _overlay = document.createElement('div');
    _overlay.className = 'loading-overlay';
    _overlay.setAttribute('aria-live', 'polite');
    _overlay.innerHTML = `
      <div class="loading-card">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading...</p>
        <p class="loading-subtext">Please wait</p>
      </div>
    `;

    document.body.appendChild(_overlay);
  }

  /**
   * Show the loading overlay.
   * Increments the reference counter.
   * Creates DOM lazily if needed.
   */
  function show() {
    _count++;
    _ensureDOM();
    _overlay.classList.add('active');
  }

  /**
   * Hide the loading overlay.
   * Decrements the reference counter.
   * Only removes overlay when counter reaches 0.
   */
  function hide() {
    if (_count > 0) _count--;
    if (_count === 0 && _overlay) {
      _overlay.classList.remove('active');
    }
  }

  /**
   * Optional pre-creation of the DOM.
   * Pages are never required to call this.
   */
  function init() {
    _ensureDOM();
  }

  return { show, hide, init };
})();
