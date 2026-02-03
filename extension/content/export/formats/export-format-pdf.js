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
   * @returns {Promise<void>}
   */
  async function exportToPDF(content) {
    const { title, html, timestamp } = content;
    const formattedDate = timestamp.toLocaleString();

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

      // Convert HTML to pdfmake format
      const pdfContent = window.htmlToPdfmake(html, {
        tableAutoSize: true,
        defaultStyles: {
          b: { bold: true },
          strong: { bold: true },
          i: { italics: true },
          em: { italics: true },
          code: { font: 'Courier', fontSize: 10, background: '#f5f5f5' },
          pre: { font: 'Courier', fontSize: 9, background: '#f5f5f5', margin: [0, 5, 0, 5] },
        },
      });

      // Create document definition
      const docDefinition = {
        info: {
          title: title,
          creator: 'NotebookLM Enhancer',
          producer: 'pdfmake',
        },
        content: [
          { text: title, style: 'header' },
          { text: `${t('exportedFrom')} ${formattedDate}`, style: 'metadata' },
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
          'html-code': { font: 'Courier', fontSize: 10, background: '#f5f5f5' },
          'html-pre': { font: 'Courier', fontSize: 9, background: '#f5f5f5' },
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

  // Export module
  NLE.exportFormatPDF = {
    export: exportToPDF,
    name: 'PDF',
    extension: 'pdf',
    icon: 'picture_as_pdf',
    labelKey: 'pdf',
  };

  NLE.log('Export format PDF module loaded');
})();
