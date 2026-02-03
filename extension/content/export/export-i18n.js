/**
 * Export System Internationalization Module
 * Shared translations for the export system
 * @module export-i18n
 */

(function () {
  'use strict';
  
  const NLE = (window.__NLE__ = window.__NLE__ || {});

  /**
   * Translation dictionary for export system
   * @type {Object.<string, Object.<string, string>>}
   */
  const translations = {
    en: {
      exportButton: 'Export note',
      pdf: 'PDF Document',
      markdown: 'Markdown',
      html: 'HTML Page',
      txt: 'Plain Text',
      exportedFrom: 'Exported from NotebookLM on',
      exportError: 'Could not extract note content. Please try again.',
      pdfError: 'Failed to export PDF. Please try again.',
      loadingPdf: 'Loading PDF libraries...',
      downloadFailed: 'Download failed. Please try again.',
      preparingExport: 'Preparing export...',
    },
    es: {
      exportButton: 'Exportar nota',
      pdf: 'Documento PDF',
      markdown: 'Markdown',
      html: 'Página HTML',
      txt: 'Texto plano',
      exportedFrom: 'Exportado desde NotebookLM el',
      exportError: 'No se pudo extraer el contenido de la nota. Por favor, inténtalo de nuevo.',
      pdfError: 'Error al exportar PDF. Por favor, inténtalo de nuevo.',
      loadingPdf: 'Cargando librerías PDF...',
      downloadFailed: 'Error en la descarga. Por favor, inténtalo de nuevo.',
      preparingExport: 'Preparando exportación...',
    },
  };

  /**
   * Get current language from document or default to English
   * @returns {'en' | 'es'} The detected language code
   */
  function getCurrentLang() {
    const htmlLang = document.documentElement.lang?.toLowerCase() || '';
    if (htmlLang.startsWith('es')) return 'es';
    // Check URL for Spanish locale
    if (location.href.includes('hl=es')) return 'es';
    return 'en';
  }

  /**
   * Get translation for a key
   * @param {string} key - The translation key
   * @returns {string} The translated string or the key if not found
   */
  function translate(key) {
    const lang = getCurrentLang();
    return translations[lang]?.[key] || translations.en[key] || key;
  }

  /**
   * Get all translations for current language
   * @returns {Object.<string, string>} Object with all translations
   */
  function getAllTranslations() {
    const lang = getCurrentLang();
    return translations[lang] || translations.en;
  }

  /**
   * Add custom translations (useful for extending)
   * @param {string} lang - Language code
   * @param {Object.<string, string>} newTranslations - New translations to add
   */
  function addTranslations(lang, newTranslations) {
    if (!translations[lang]) {
      translations[lang] = {};
    }
    Object.assign(translations[lang], newTranslations);
  }

  // Export module
  NLE.exportI18n = {
    t: translate,
    translate: translate,
    getCurrentLang: getCurrentLang,
    getAllTranslations: getAllTranslations,
    addTranslations: addTranslations,
    _translations: translations, // Exposed for debugging
  };

  NLE.log('Export i18n module loaded');
})();
