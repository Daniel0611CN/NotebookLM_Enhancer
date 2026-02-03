/**
 * Plain Text Export Format Module
 * Handles TXT export with basic formatting
 * @module export-format-txt
 */

(function () {
  'use strict';

  const NLE = (window.__NLE__ = window.__NLE__ || {});
  const { t } = NLE.exportI18n;
  const { downloadFile } = NLE.exportUtils;

  /**
   * Format text content for plain text export
   * @param {string} text - Raw text content
   * @param {string} title - Note title
   * @param {string} date - Formatted date string
   * @returns {string} Formatted plain text
   */
  function formatPlainText(text, title, date) {
    const separator = '='.repeat(title.length);
    const trimmedText = text.trim();

    return `${title}
${separator}

${separator}

${trimmedText}`;
  }

  /**
   * Export content to plain text file
   * @param {{ title: string, text: string, timestamp: Date }} content - The content to export
   */
  function exportToText(content) {
    const { title, text, timestamp } = content;
    const formattedDate = timestamp.toLocaleString();

    const output = formatPlainText(text, title, formattedDate);

    downloadFile(`${title}.txt`, output, 'text/plain;charset=utf-8');
    NLE.log('Exported to TXT:', title);
  }

  /**
   * Get preview content
   * @param {{ title: string, text: string, timestamp: Date }} content
   * @param {Object} options
   * @returns {string} Preview text
   */
  function getPreview(content, options) {
    const { title, text, timestamp } = content;
    const formattedDate = timestamp.toLocaleString();
    return formatPlainText(text, title, formattedDate);
  }

  // Export module
  NLE.exportFormatTXT = {
    export: exportToText,
    getPreview: getPreview,
    name: 'Plain Text',
    extension: 'txt',
    icon: 'article',
    labelKey: 'txt',
  };

  NLE.log('Export format TXT module loaded');
})();
