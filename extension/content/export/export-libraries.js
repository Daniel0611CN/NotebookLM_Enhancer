/**
 * Export System Libraries Module
 * Handles verification of PDF export libraries
 * @module export-libraries
 */

(function () {
  'use strict';

  const NLE = (window.__NLE__ = window.__NLE__ || {});

  /**
   * Load PDF export libraries (pdfmake + html-to-pdfmake)
   * Since these are now loaded via manifest.json content_scripts,
   * we only need to verify they exist in the global scope.
   * @returns {Promise<boolean>} True if all libraries loaded successfully
   */
  async function loadPdfLibraries() {
    try {
      // Allow a brief moment for scripts to initialize if needed
      if (typeof window.pdfMake === 'undefined' || typeof window.htmlToPdfmake === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check pdfMake
      if (typeof window.pdfMake === 'undefined') {
        throw new Error('pdfmake is undefined');
      }

      // Check only if htmlToPdfmake is undefined (some versions might attach differently, but standard is window.htmlToPdfmake)
      if (typeof window.htmlToPdfmake === 'undefined') {
        // Fallback check if it's attached elsewhere or named differently? 
        // Usually it's window.htmlToPdfmake.
        throw new Error('html-to-pdfmake is undefined');
      }

      NLE.log('All PDF libraries verified successfully');
      return true;
    } catch (err) {
      console.error('[NLE Export] PDF libraries missing:', err);
      NLE.log('Failed to verify PDF libraries:', err);
      return false;
    }
  }

  /**
   * Check if PDF libraries are loaded
   * @returns {{ pdfMake: boolean, htmlToPdfMake: boolean }} Loading status
   */
  function areLibrariesLoaded() {
    return {
      pdfMake: typeof window.pdfMake !== 'undefined',
      htmlToPdfMake: typeof window.htmlToPdfmake !== 'undefined',
    };
  }

  // Export module
  NLE.exportLibraries = {
    loadPdfLibraries: loadPdfLibraries,
    areLibrariesLoaded: areLibrariesLoaded,
    // Legacy support (noop)
    resetLibraryState: () => { },
  };

  NLE.log('Export libraries module loaded');
})();
