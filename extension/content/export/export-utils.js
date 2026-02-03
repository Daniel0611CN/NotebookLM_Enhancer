/**
 * Export System Utilities Module
 * Common utility functions for export operations
 * @module export-utils
 */

(function () {
  'use strict';
  
  const NLE = (window.__NLE__ = window.__NLE__ || {});

  /**
   * Download a file to the user's computer
   * @param {string} filename - The filename for the download
   * @param {string | Blob} content - The file content
   * @param {string} mimeType - The MIME type of the file
   * @returns {boolean} True if download was triggered
   */
  function downloadFile(filename, content, mimeType) {
    try {
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the object URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
        NLE.log('Downloaded file cleaned up:', filename);
      }, 1000);

      return true;
    } catch (err) {
      console.error('[NLE Export] Download failed:', err);
      NLE.log('Download failed:', filename, err);
      return false;
    }
  }

  /**
   * Show a temporary notification
   * @param {string} message - The message to display
   * @param {string} type - The type of notification ('success' | 'error' | 'info')
   * @param {number} duration - Duration in milliseconds
   */
  function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `nle-notification nle-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      font-size: 14px;
      z-index: 10001;
      animation: nle-notification-slide 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'nle-notification-fade 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes - Number of bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted string
   */
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Add notification styles if not already present
   */
  function addNotificationStyles() {
    if (document.getElementById('nle-notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'nle-notification-styles';
    style.textContent = `
      @keyframes nle-notification-slide {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes nle-notification-fade {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Add styles on module load
  addNotificationStyles();

  // Export module
  NLE.exportUtils = {
    downloadFile: downloadFile,
    showNotification: showNotification,
    formatBytes: formatBytes,
    debounce: debounce,
  };

  NLE.log('Export utils module loaded');
})();
