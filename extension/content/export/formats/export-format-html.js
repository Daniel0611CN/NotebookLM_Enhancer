/**
 * HTML Export Format Module
 * Handles HTML export with embedded styles
 * @module export-format-html
 */

(function () {
  'use strict';

  const NLE = (window.__NLE__ = window.__NLE__ || {});
  const { t } = NLE.exportI18n;
  const { downloadFile } = NLE.exportUtils;

  /**
   * Escape HTML entities
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Export content to HTML file
   * @param {{ title: string, html: string, timestamp: Date }} content - The content to export
   */
  /**
   * Generate full HTML string
   * @param {{ title: string, html: string, timestamp: Date }} content
   * @returns {string} Full HTML
   */
  function generateHTML(content) {
    const { title, html, timestamp } = content;
    const formattedDate = timestamp.toLocaleString();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --color-text: #333;
      --color-text-secondary: #666;
      --color-background: #fff;
      --color-surface: #f5f5f5;
      --color-border: #ddd;
      --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --color-text: #e0e0e0;
        --color-text-secondary: #999;
        --color-background: #1a1a1a;
        --color-surface: #2a2a2a;
        --color-border: #333;
      }
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-body);
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: var(--color-text);
      background: var(--color-background);
    }
    
    h1 { 
      font-size: 1.8em; 
      margin-bottom: 0.5em;
      line-height: 1.3;
    }
    
    .metadata { 
      font-size: 0.85em; 
      color: var(--color-text-secondary); 
      margin-bottom: 1.5em; 
      border-bottom: 1px solid var(--color-border); 
      padding-bottom: 1em; 
    }
    
    p { margin: 0.5em 0; }
    
    ul, ol { 
      padding-left: 1.5em; 
      margin: 0.5em 0; 
    }
    
    li { margin-bottom: 0.3em; }
    
    code { 
      background: var(--color-surface); 
      padding: 2px 6px; 
      border-radius: 3px; 
      font-family: var(--font-mono);
      font-size: 0.9em; 
    }
    
    pre { 
      background: var(--color-surface); 
      padding: 12px; 
      border-radius: 6px; 
      overflow-x: auto; 
    }
    
    pre code { 
      background: none; 
      padding: 0; 
    }
    
    strong, b { font-weight: 600; }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 1em 0; 
    }
    
    th, td { 
      border: 1px solid var(--color-border); 
      padding: 8px 12px; 
      text-align: left; 
    }
    
    th { 
      background: var(--color-surface); 
      font-weight: 600; 
    }
    
    blockquote { 
      margin: 1em 0; 
      padding: 0.5em 1em; 
      border-left: 4px solid var(--color-border); 
      color: var(--color-text-secondary); 
    }
    
    .paragraph { margin: 0.5em 0; }
    
    .heading3 { 
      font-size: 1.2em; 
      font-weight: 600; 
      margin-top: 1em; 
    }
    
    a {
      color: #1a73e8;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="content">${html}</div>
</body>
</html>`;
  }

  /**
   * Export content to HTML file
   * @param {{ title: string, html: string, timestamp: Date }} content - The content to export
   */
  function exportToHTML(content) {
    const fullHTML = generateHTML(content);
    downloadFile(`${content.title}.html`, fullHTML, 'text/html;charset=utf-8');
    NLE.log('Exported to HTML:', content.title);
  }

  /**
   * Get preview content
   * @param {{ title: string, html: string, timestamp: Date }} content
   * @param {Object} options
   * @returns {string} Preview text
   */
  function getPreview(content, options) {
    return generateHTML(content);
  }

  // Export module
  NLE.exportFormatHTML = {
    export: exportToHTML,
    getPreview: getPreview,
    name: 'HTML',
    extension: 'html',
    icon: 'code',
    labelKey: 'html',
  };

  NLE.log('Export format HTML module loaded');
})();
