/**
 * Export System Detection Module
 * Detects when a note is being viewed and extracts note metadata
 * @module export-detection
 */

(function () {
  'use strict';
  
  const NLE = (window.__NLE__ = window.__NLE__ || {});
  const { selectors } = NLE.constants;

  /**
   * Check if we are currently viewing a note (note editor is open in studio panel)
   * @returns {boolean} True if note view is open
   */
  function isNoteViewOpen() {
    // Check for note-editor specifically within the studio panel (right sidebar)
    const noteEditor = document.querySelector(selectors.noteEditor);
    return !!noteEditor;
  }

  /**
   * Get the panel header element for the note view (within studio panel)
   * @returns {HTMLElement | null} The header element or null if not found
   */
  function getNoteViewHeader() {
    // Get the header specifically from the studio panel (right sidebar)
    return document.querySelector(selectors.studioPanelHeader);
  }

  /**
   * Get the note editor element
   * @returns {HTMLElement | null} The note editor element
   */
  function getNoteEditor() {
    return document.querySelector(selectors.noteEditor);
  }

  /**
   * Get the collapse button in the note view header
   * @returns {HTMLElement | null} The collapse button
   */
  function getCollapseButton() {
    const header = getNoteViewHeader();
    if (!header) return null;
    return header.querySelector(selectors.noteCollapseButton);
  }

  /**
   * Get note metadata without full content extraction
   * @returns {{ title: string, hasContent: boolean } | null} Basic note info
   */
  function getNoteMetadata() {
    const noteEditor = getNoteEditor();
    if (!noteEditor) return null;

    // Get title
    const titleInput = noteEditor.querySelector(selectors.noteTitle);
    const title = titleInput?.value || titleInput?.textContent?.trim() || 'Untitled Note';

    // Check if has content viewer
    const docViewer = noteEditor.querySelector(selectors.noteDocViewer);
    const form = noteEditor.querySelector('form');
    
    return {
      title: title,
      hasContent: !!(docViewer || form),
    };
  }

  /**
   * Check if the export button is already injected
   * @returns {boolean} True if button exists
   */
  function isExportButtonInjected() {
    return !!document.getElementById(NLE.constants.exportButtonId);
  }

  /**
   * Wait for note view to be ready
   * @param {number} timeout - Maximum time to wait in ms
   * @returns {Promise<boolean>} Resolves when note view is ready or timeout
   */
  function waitForNoteView(timeout = 5000) {
    return new Promise((resolve) => {
      if (isNoteViewOpen()) {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (isNoteViewOpen()) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  }

  // Export module
  NLE.exportDetection = {
    isNoteViewOpen: isNoteViewOpen,
    getNoteViewHeader: getNoteViewHeader,
    getNoteEditor: getNoteEditor,
    getCollapseButton: getCollapseButton,
    getNoteMetadata: getNoteMetadata,
    isExportButtonInjected: isExportButtonInjected,
    waitForNoteView: waitForNoteView,
  };

  NLE.log('Export detection module loaded');
})();
