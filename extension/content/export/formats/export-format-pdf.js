/**
 * PDF Export Format Module
 * Handles PDF export using pdfmake and html-to-pdfmake
 * @module export-format-pdf
 */

(function () {
  'use strict';

  const NLE = (window.__NLE__ = window.__NLE__ || {});
  const { loadPdfLibraries } = NLE.exportLibraries;
  const { t } = NLE.exportI18n;
  const { downloadFile } = NLE.exportUtils;

  /**
   * Export content to PDF using pdfmake
   * @param {{ title: string, html: string, timestamp: Date }} content - The content to export
   * @param {{ includeImages: boolean, includeCitations: boolean, addPageNumbers: boolean }} options - Export options
   * @returns {Promise<void>}
   */
  async function exportToPDF(content, options = {}) {
    const { title, timestamp } = content;
    let { html } = content;
    const formattedDate = timestamp.toLocaleString();
    const { includeImages = true, includeCitations = true, addPageNumbers = false } = options;

    // Load libraries if needed
    const loaded = await loadPdfLibraries();
    if (!loaded) {
      console.error('[NLE Export] Failed to load PDF libraries');
      alert(t('pdfError'));
      return;
    }

    try {
      // Check if libraries are available
      if (typeof window.pdfMake === 'undefined' || typeof window.htmlToPdfmake === 'undefined') {
        throw new Error('PDF libraries not available');
      }

      // Pre-process HTML based on options
      if (!includeImages) {
        html = html.replace(/<img[^>]*>/gi, '');
      }

      if (!includeCitations) {
        // Remove citation elements (assuming they have specific classes or structure)
        // Common pattern for NotebookLM citations might need adjustment if class names change
        // For now, removing typical citation like <sup> or .citation class if known
        // Since we don't have the exact DOM structure of a citation here without the DOM, 
        // we'll rely on the extraction cleaning usually. 
        // If extraction preserves them as <sup> or specific spans:
        html = html.replace(/<sup[^>]*>.*?<\/sup>/gi, ''); // Generic source removal
        html = html.replace(/<a[^>]*class="source-citation"[^>]*>.*?<\/a>/gi, '');
      }

      // Convert HTML to pdfmake format
      const pdfContent = window.htmlToPdfmake(html, {
        tableAutoSize: true,
        defaultStyles: {
          b: { bold: true },
          strong: { bold: true },
          i: { italics: true },
          em: { italics: true },
          code: { fontSize: 10, background: '#f5f5f5' },
          pre: { fontSize: 9, background: '#f5f5f5', margin: [0, 5, 0, 5] },
        },
      });

      // Create document definition
      const docDefinition = {
        info: {
          title: title,
          creator: 'NotebookLM Enhancer',
          producer: 'pdfmake',
        },
        footer: function (currentPage, pageCount) {
          if (addPageNumbers) {
            return {
              text: `${currentPage} / ${pageCount}`,
              alignment: 'center',
              fontSize: 10,
              margin: [0, 10, 0, 0]
            };
          }
          return null;
        },
        content: [
          { text: title, style: 'header' },
          { text: '', margin: [0, 10, 0, 0] }, // Spacer
          ...pdfContent,
        ],
        defaultStyle: {
          fontSize: 11,
          lineHeight: 1.4,
        },
        styles: {
          header: {
            fontSize: 22,
            bold: true,
            margin: [0, 0, 0, 5],
          },
          metadata: {
            fontSize: 10,
            italics: true,
            color: '#666666',
            margin: [0, 0, 0, 15],
          },
          'html-h1': { fontSize: 20, bold: true, margin: [0, 15, 0, 5] },
          'html-h2': { fontSize: 18, bold: true, margin: [0, 12, 0, 5] },
          'html-h3': { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
          'html-h4': { fontSize: 14, bold: true, margin: [0, 8, 0, 5] },
          'html-code': { fontSize: 10, background: '#f5f5f5' },
          'html-pre': { fontSize: 9, background: '#f5f5f5' },
        },
        pageMargins: [40, 40, 40, 40],
      };

      // Generate and download PDF
      window.pdfMake.createPdf(docDefinition).download(`${title}.pdf`);
      NLE.log('Exported to PDF:', title);
    } catch (err) {
      NLE.log('PDF export error:', err);
      console.error('[NLE Export] PDF export failed:', err);
      alert(t('pdfError'));
    }
  }

  /**
   * Get preview content (Fallback to text for PDF)
   * @param {{ title: string, text: string, timestamp: Date }} content
   * @param {Object} options
   * @returns {string} Preview text
   */
  async function getPreview(content, options) {
    const { title, text, timestamp } = content;
    // PDF content is based on HTML, but for text preview locally, plain text is best.
    // Alternatively we could return "PDF Document\nTitle: " + title ...
    return text.trim();
  }

  // Export module
  NLE.exportFormatPDF = {
    export: exportToPDF,
    getPreview: getPreview,
    name: 'PDF',
    extension: 'pdf',
    icon: 'picture_as_pdf',
    labelKey: 'pdf',
  };

  NLE.log('Export format PDF module loaded');
})();
