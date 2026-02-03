/**
 * Export System UI Module
 * Handles UI components for the export system
 * @module export-ui
 */

(function () {
  'use strict';
  
  const NLE = (window.__NLE__ = window.__NLE__ || {});
  const { exportButtonId, exportMenuId } = NLE.constants;
  const { t } = NLE.exportI18n;

  // Track current menu state
  let currentMenu = null;
  let currentButton = null;

  /**
   * Available export formats
   * @type {Array<{id: string, module: string, icon: string, labelKey: string}>}
   */
  const exportFormats = [
    { id: 'pdf', module: 'exportFormatPDF', icon: 'picture_as_pdf', labelKey: 'pdf' },
    { id: 'markdown', module: 'exportFormatMarkdown', icon: 'description', labelKey: 'markdown' },
    { id: 'html', module: 'exportFormatHTML', icon: 'code', labelKey: 'html' },
    { id: 'txt', module: 'exportFormatTXT', icon: 'article', labelKey: 'txt' },
  ];

  /**
   * Create the export button element
   * @returns {HTMLButtonElement} The export button
   */
  function createExportButton() {
    const button = document.createElement('button');
    button.id = exportButtonId;
    button.className =
      'mdc-icon-button mat-mdc-icon-button mat-mdc-button-base mat-mdc-tooltip-trigger label-medium-button mat-unthemed nle-export-button';
    button.setAttribute('mat-icon-button', '');
    button.setAttribute('aria-label', t('exportButton'));
    button.setAttribute('title', t('exportButton'));

    button.innerHTML = `
      <span class="mat-mdc-button-persistent-ripple mdc-icon-button__ripple"></span>
      <mat-icon role="img" aria-hidden="true" class="mat-icon notranslate material-symbols-outlined google-symbols mat-icon-no-color" data-mat-icon-type="font" style="font-size: 24px;">download</mat-icon>
      <span class="mat-focus-indicator"></span>
      <span class="mat-mdc-button-touch-target"></span>
    `;

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleExportMenu(button);
    });

    return button;
  }

  /**
   * Create the export menu element
   * @returns {HTMLDivElement} The export menu
   */
  function createExportMenu() {
    const menu = document.createElement('div');
    menu.id = exportMenuId;
    menu.className = 'nle-export-menu';

    exportFormats.forEach(({ id, icon, labelKey }, index) => {
      // Add divider before last item for visual separation
      if (index === exportFormats.length - 1 && exportFormats.length > 1) {
        const divider = document.createElement('div');
        divider.className = 'nle-export-menu-divider';
        menu.appendChild(divider);
      }

      const item = document.createElement('button');
      item.className = 'nle-export-menu-item';
      item.dataset.format = id;
      item.dataset.testid = `export-format-${id}`;

      item.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <span>${t(labelKey)}</span>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        handleExportClick(id);
      });

      menu.appendChild(item);
    });

    return menu;
  }

  /**
   * Toggle export menu visibility
   * @param {HTMLElement} button - The button that triggered the toggle
   */
  function toggleExportMenu(button) {
    // Close existing menu if different button
    if (currentMenu && currentButton !== button) {
      hideExportMenu();
    }

    let menu = document.getElementById(exportMenuId);

    if (!menu) {
      menu = createExportMenu();
      button.appendChild(menu);
      currentMenu = menu;
      currentButton = button;
    }

    const isVisible = menu.style.display !== 'none' && menu.style.display !== '';
    
    if (isVisible) {
      hideExportMenu();
    } else {
      menu.style.display = 'block';
      setupOutsideClickHandler(button, menu);
    }
  }

  /**
   * Hide the export menu
   */
  function hideExportMenu() {
    const menu = document.getElementById(exportMenuId);
    if (menu) {
      menu.style.display = 'none';
    }
    currentMenu = null;
    currentButton = null;
  }

  /**
   * Setup click outside handler to close menu
   * @param {HTMLElement} button - The export button
   * @param {HTMLElement} menu - The export menu
   */
  function setupOutsideClickHandler(button, menu) {
    const closeHandler = (e) => {
      if (!button.contains(e.target)) {
        hideExportMenu();
        document.removeEventListener('click', closeHandler);
      }
    };

    // Small delay to avoid immediate close
    setTimeout(() => {
      document.addEventListener('click', closeHandler, { once: true });
    }, 0);
  }

  /**
   * Handle export format click
   * @param {string} formatId - The format ID to export
   */
  function handleExportClick(formatId) {
    hideExportMenu();
    
    // Dispatch event for core module to handle
    const event = new CustomEvent('nle-export-request', {
      detail: { format: formatId },
      bubbles: true,
    });
    document.dispatchEvent(event);
  }

  /**
   * Remove export button from DOM
   */
  function removeExportButton() {
    const button = document.getElementById(exportButtonId);
    if (button) {
      button.remove();
      NLE.log('Export button removed');
    }
    hideExportMenu();
  }

  /**
   * Inject export button into note view header
   * @returns {boolean} True if button was injected
   */
  function injectExportButton() {
    const { getNoteViewHeader, getCollapseButton, isNoteViewOpen, isExportButtonInjected } = NLE.exportDetection;
    
    // Check if note view is open
    if (!isNoteViewOpen()) {
      removeExportButton();
      return false;
    }

    // Check if button already exists
    if (isExportButtonInjected()) {
      return false;
    }

    const header = getNoteViewHeader();
    if (!header) return false;

    const collapseButton = getCollapseButton();
    const button = createExportButton();

    if (collapseButton) {
      collapseButton.parentNode?.insertBefore(button, collapseButton);
    } else {
      // Fallback: insert at the end of header
      const anyButton = header.querySelector('button:last-of-type');
      if (anyButton && anyButton.parentNode) {
        anyButton.parentNode.insertBefore(button, anyButton.nextSibling);
      } else {
        header.appendChild(button);
      }
    }

    NLE.log('Export button injected');
    return true;
  }

  /**
   * Set button loading state
   * @param {boolean} loading - Whether button is in loading state
   */
  function setButtonLoading(loading) {
    const button = document.getElementById(exportButtonId);
    if (!button) return;

    if (loading) {
      button.classList.add('nle-export-loading');
      button.disabled = true;
    } else {
      button.classList.remove('nle-export-loading');
      button.disabled = false;
    }
  }

  // Export module
  NLE.exportUI = {
    createExportButton: createExportButton,
    createExportMenu: createExportMenu,
    toggleExportMenu: toggleExportMenu,
    hideExportMenu: hideExportMenu,
    injectExportButton: injectExportButton,
    removeExportButton: removeExportButton,
    setButtonLoading: setButtonLoading,
    exportFormats: exportFormats,
  };

  NLE.log('Export UI module loaded');
})();
