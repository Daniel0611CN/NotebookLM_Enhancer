/**
 * Markdown Export Format Module
 * Handles Markdown export with HTML to Markdown conversion
 * @module export-format-markdown
 */

(function () {
  'use strict';

  const NLE = (window.__NLE__ = window.__NLE__ || {});
  const { t } = NLE.exportI18n;
  const { downloadFile } = NLE.exportUtils;

  /**
   * Convert HTML to Markdown
   * @param {string} html - HTML string to convert
   * @returns {string} Markdown string
   */
  function htmlToMarkdown(html) {
    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = html;

    // Process the DOM tree
    return processNodeToMarkdown(container).trim();
  }

  /**
   * Process a DOM node to Markdown
   * @param {Node} node - DOM node to process
   * @returns {string} Markdown representation
   */
  function processNodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const el = /** @type {HTMLElement} */ (node);
    const tagName = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes).map(processNodeToMarkdown).join('');

    switch (tagName) {
      case 'h1':
        return `# ${children.trim()}\n\n`;
      case 'h2':
        return `## ${children.trim()}\n\n`;
      case 'h3':
        return `### ${children.trim()}\n\n`;
      case 'h4':
        return `#### ${children.trim()}\n\n`;
      case 'h5':
        return `##### ${children.trim()}\n\n`;
      case 'h6':
        return `###### ${children.trim()}\n\n`;
      case 'p':
      case 'div':
        if (el.classList.contains('paragraph')) {
          if (el.classList.contains('heading3')) {
            return `### ${children.trim()}\n\n`;
          }
          return `${children.trim()}\n\n`;
        }
        return children ? `${children}\n` : '';
      case 'br':
        return '\n';
      case 'strong':
      case 'b':
        return `**${children}**`;
      case 'em':
      case 'i':
        return `*${children}*`;
      case 'u':
        return `<u>${children}</u>`;
      case 's':
      case 'strike':
      case 'del':
        return `~~${children}~~`;
      case 'code':
        return `\`${children}\``;
      case 'pre':
        return `\n\`\`\`\n${children.trim()}\n\`\`\`\n\n`;
      case 'a':
        const href = el.getAttribute('href') || '';
        return `[${children}](${href})`;
      case 'ul':
        return `${processListToMarkdown(el, '-')}\n`;
      case 'ol':
        return `${processListToMarkdown(el, '1.')}\n`;
      case 'li':
        return children;
      case 'blockquote':
        return children
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n') + '\n\n';
      case 'table':
        return processTableToMarkdown(el);
      case 'img':
        const src = el.getAttribute('src') || '';
        const alt = el.getAttribute('alt') || '';
        return `![${alt}](${src})`;
      case 'span':
        return children;
      default:
        return children;
    }
  }

  /**
   * Process list to Markdown
   * @param {HTMLElement} listEl - List element
   * @param {string} marker - List marker (- or 1.)
   * @returns {string} Markdown list
   */
  function processListToMarkdown(listEl, marker) {
    const items = Array.from(listEl.children);
    return items
      .map((item, index) => {
        const content = processNodeToMarkdown(item).trim();
        const prefix = marker === '1.' ? `${index + 1}.` : marker;
        return `${prefix} ${content}`;
      })
      .join('\n');
  }

  /**
   * Process table to Markdown
   * @param {HTMLElement} tableEl - Table element
   * @returns {string} Markdown table
   */
  function processTableToMarkdown(tableEl) {
    const rows = Array.from(tableEl.querySelectorAll('tr'));
    if (rows.length === 0) return '';

    const result = [];
    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      const cellContents = cells.map((cell) => processNodeToMarkdown(cell).trim().replace(/\|/g, '\\|'));
      result.push(`| ${cellContents.join(' | ')} |`);

      // Add header separator after first row
      if (rowIndex === 0) {
        result.push(`| ${cells.map(() => '---').join(' | ')} |`);
      }
    });

    return result.join('\n') + '\n\n';
  }

  /**
   * Export content to Markdown
   * @param {{ title: string, html: string, timestamp: Date }} content - The content to export
   */
  function exportToMarkdown(content) {
    const { title, html, timestamp } = content;
    const formattedDate = timestamp.toLocaleString();

    const markdown = `# ${title}\n\n---\n\n${htmlToMarkdown(html)}`;

    downloadFile(`${title}.md`, markdown, 'text/markdown;charset=utf-8');
    NLE.log('Exported to Markdown:', title);
  }

  /**
   * Get preview content
   * @param {{ title: string, html: string, timestamp: Date }} content
   * @param {Object} options
   * @returns {string} Preview text
   */
  function getPreview(content, options) {
    return htmlToMarkdown(content.html);
  }

  // Export module
  NLE.exportFormatMarkdown = {
    export: exportToMarkdown,
    getPreview: getPreview,
    name: 'Markdown',
    extension: 'md',
    icon: 'description',
    labelKey: 'markdown',
  };

  NLE.log('Export format Markdown module loaded');
})();
