// Low-noise logger helper.
(function () {
  const NLE = (window.__NLE__ = window.__NLE__ || {});

  NLE.log = function log(...args) {
    // Production: disable logs
    // console.debug('[NotebookLM Enhancer]', ...args);
  };
})();
