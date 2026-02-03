/**
 * Export System Libraries Module
 * Handles dynamic loading of PDF export libraries
 * @module export-libraries
 */

(function () {
  'use strict';
  
  const NLE = (window.__NLE__ = window.__NLE__ || {});

  // Track if libraries are loaded
  let pdfMakeLoaded = false;
  let htmlToPdfMakeLoaded = false;
  let vfsFontsLoaded = false;

  /**
   * Load a script from extension resources
   * @param {string} src - The script source path
   * @returns {Promise<void>} Resolves when script is loaded
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        NLE.log(`Library loaded: ${src.split('/').pop()}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`[NLE Export] Failed to load: ${src}`);
        reject(new Error(`Failed to load ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Load PDF export libraries (pdfmake + html-to-pdfmake)
   * @returns {Promise<boolean>} True if all libraries loaded successfully
   */
  async function loadPdfLibraries() {
    if (pdfMakeLoaded && htmlToPdfMakeLoaded && vfsFontsLoaded) {
      return true;
    }

    try {
      const extensionUrl = chrome.runtime.getURL('');

      // Load pdfmake first
      if (!pdfMakeLoaded) {
        await loadScript(`${extensionUrl}lib/pdfmake.min.js`);
        pdfMakeLoaded = true;
      }

      // Load vfs_fonts
      if (!vfsFontsLoaded) {
        await loadScript(`${extensionUrl}lib/vfs_fonts.min.js`);
        vfsFontsLoaded = true;
      }

      // Load html-to-pdfmake
      if (!htmlToPdfMakeLoaded) {
        await loadScript(`${extensionUrl}lib/html-to-pdfmake.min.js`);
        htmlToPdfMakeLoaded = true;
      }

      // Verify libraries are available
      if (typeof window.pdfMake === 'undefined') {
        throw new Error('pdfmake not available after loading');
      }
      
      if (typeof window.htmlToPdfmake === 'undefined') {
        throw new Error('html-to-pdfmake not available after loading');
      }

      NLE.log('All PDF libraries loaded successfully');
      return true;
    } catch (err) {
      NLE.log('Failed to load PDF libraries:', err);
      console.error('[NLE Export] Library loading failed:', err);
      return false;
    }
  }

  /**
   * Check if PDF libraries are loaded
   * @returns {{ pdfMake: boolean, htmlToPdfMake: boolean, vfsFonts: boolean }} Loading status
   */
  function areLibrariesLoaded() {
    return {
      pdfMake: pdfMakeLoaded && typeof window.pdfMake !== 'undefined',
      htmlToPdfMake: htmlToPdfMakeLoaded && typeof window.htmlToPdfmake !== 'undefined',
      vfsFonts: vfsFontsLoaded,
    };
  }

  /**
   * Reset library loading state (useful for testing)
   */
  function resetLibraryState() {
    pdfMakeLoaded = false;
    htmlToPdfMakeLoaded = false;
    vfsFontsLoaded = false;
  }

  // Export module
  NLE.exportLibraries = {
    loadPdfLibraries: loadPdfLibraries,
    areLibrariesLoaded: areLibrariesLoaded,
    resetLibraryState: resetLibraryState,
    _loadScript: loadScript, // Exposed for testing
  };

  NLE.log('Export libraries module loaded');
})();
