/*
  Content script entrypoint.
  Injects a ShadowRoot host into the NotebookLM sidebar and mounts the Angular UI via an iframe.
*/

(function () {
  const EXTENSION_HOST_ID = 'notebooklm-enhancer-root';
  const IFRAME_TITLE = 'NotebookLM Enhancer';
  const MESSAGE_TYPE_NOTEBOOKS = 'NLE_NOTEBOOKS_SYNC';
  const ARTIFACT_LIST_SELECTOR = '.artifact-library-container';
  const STUDIO_PANEL_SELECTOR = 'section.studio-panel';
  const PANEL_ROOT_SELECTOR = '.panel-content-scrollable';

  /** @type {{ panelRootEl: Element | null; hostEl: HTMLElement | null; frameEl: HTMLIFrameElement | null; listEl: Element | null; listObserver: MutationObserver | null; }} */
  const state = {
    panelRootEl: null,
    hostEl: null,
    frameEl: null,
    listEl: null,
    listObserver: null,
  };

  let ensureScheduled = false;

  function log(...args) {
    // Keep logs low-noise; useful during selector hardening.
    console.debug('[NotebookLM Enhancer]', ...args);
  }

  function findStudioPanel() {
    const section = document.querySelector(STUDIO_PANEL_SELECTOR);
    if (section) return section;

    // Fallback: tolerate changes (e.g. element type) as long as class survives.
    return document.querySelector('.studio-panel');
  }

  function findPanelRoot() {
    const studioPanel = findStudioPanel();
    if (studioPanel) {
      const panelRoot = studioPanel.querySelector(PANEL_ROOT_SELECTOR);
      if (panelRoot) return panelRoot;
    }

    // Fallback: best-effort search.
    return document.querySelector(PANEL_ROOT_SELECTOR);
  }

  function ensureHost(panelRootEl, insertBeforeEl) {
    const existing = panelRootEl.querySelector(`#${EXTENSION_HOST_ID}`);
    if (existing) return existing;

    const host = document.createElement('div');
    host.id = EXTENSION_HOST_ID;
    host.style.display = 'block';
    host.style.width = '100%';

    // Insert before the native artifact list so it feels native.
    if (insertBeforeEl?.parentNode === panelRootEl) {
      panelRootEl.insertBefore(host, insertBeforeEl);
    } else {
      panelRootEl.prepend(host);
    }
    return host;
  }

  function mountUi(hostEl) {
    const shadow = hostEl.shadowRoot ?? hostEl.attachShadow({ mode: 'open' });

    const existingFrame = shadow.getElementById('nle-frame');
    if (existingFrame) return /** @type {HTMLIFrameElement} */ (existingFrame);

    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; display: block; width: 100%; }
      .nle-wrap { display: block; width: 100%; }
      .nle-frame {
        width: 100%;
        height: 280px;
        border: 0;
        display: block;
      }
    `;

    const wrap = document.createElement('div');
    wrap.className = 'nle-wrap';

    const frame = document.createElement('iframe');
    frame.id = 'nle-frame';
    frame.className = 'nle-frame';
    frame.title = IFRAME_TITLE;
    frame.src = chrome.runtime.getURL('index.html');

    wrap.appendChild(frame);
    shadow.appendChild(style);
    shadow.appendChild(wrap);

    return frame;
  }

  function extractNotebooksFromSidebar(artifactListEl) {
    const titleEls = artifactListEl.querySelectorAll('.artifact-title');

    return Array.from(titleEls)
      .map((el) => {
        const title = (el.textContent ?? '').trim();
        if (!title) return null;

        const detailsEl = el.closest('.artifact-labels')?.querySelector('.artifact-details');
        const details = detailsEl ? (detailsEl.textContent ?? '').trim() : null;

        return {
          title,
          details,
        };
      })
      .filter((x) => x !== null);
  }

  function postNotebooks(frameEl, notebooks) {
    if (!frameEl?.contentWindow) return;
    frameEl.contentWindow.postMessage(
      {
        type: MESSAGE_TYPE_NOTEBOOKS,
        payload: {
          notebooks,
          timestamp: Date.now(),
        },
      },
      '*'
    );
  }

  function detachListObserver() {
    state.listObserver?.disconnect?.();
    state.listObserver = null;
    state.listEl = null;
  }

  function attachListObserver(listEl, frameEl) {
    if (state.listEl === listEl && state.listObserver) return;

    detachListObserver();
    state.listEl = listEl;

    let scheduled = false;
    const emit = () => {
      scheduled = false;
      if (!state.listEl || !state.frameEl?.contentWindow) return;
      const notebooks = extractNotebooksFromSidebar(state.listEl);
      postNotebooks(state.frameEl, notebooks);
    };
    const scheduleEmit = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(emit);
    };

    // Emit on frame load + immediately.
    frameEl.addEventListener('load', emit);
    emit();

    state.listObserver = new MutationObserver(scheduleEmit);
    state.listObserver.observe(listEl, { childList: true, subtree: true, characterData: true });
    log('Observing artifact list updates.');
  }

  function ensureMounted() {
    const panelRoot = findPanelRoot();
    if (!panelRoot) {
      // Studio panel hidden or not present.
      detachListObserver();
      state.panelRootEl = null;
      state.hostEl = null;
      state.frameEl = null;
      return;
    }

    const artifactList = panelRoot.querySelector(ARTIFACT_LIST_SELECTOR);
    const host = ensureHost(panelRoot, artifactList);
    const frame = mountUi(host);

    state.panelRootEl = panelRoot;
    state.hostEl = host;
    state.frameEl = frame;

    if (artifactList && frame) {
      attachListObserver(artifactList, frame);
    }
  }

  function scheduleEnsureMounted() {
    if (ensureScheduled) return;
    ensureScheduled = true;
    requestAnimationFrame(() => {
      ensureScheduled = false;
      try {
        ensureMounted();
      } catch (err) {
        console.warn('[NotebookLM Enhancer] ensureMounted failed', err);
      }
    });
  }

  // Global watchdog for SPA navigation + sidebar hide/show + list replacements.
  const bodyObserver = new MutationObserver(scheduleEnsureMounted);
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  function openNativeNotebookByTitle(title) {
    const listEl = state.listEl;
    if (!listEl) return false;

    const titleEls = listEl.querySelectorAll('.artifact-title');
    const match = Array.from(titleEls).find((el) => (el.textContent ?? '').trim() === title);
    if (!match) return false;

    const button = match.closest('button.artifact-button-content') ?? match.closest('button');
    if (!button) return false;

    button.click();
    return true;
  }

  window.addEventListener('message', (event) => {
    // Only accept messages from our iframe.
    if (!state.frameEl?.contentWindow) return;
    if (event.source !== state.frameEl.contentWindow) return;
    if (!event.data || typeof event.data !== 'object') return;

    const data = /** @type {{ type?: unknown; payload?: unknown }} */ (event.data);
    if (data.type !== 'NLE_OPEN_NOTEBOOK') return;

    const payload = /** @type {{ title?: unknown }} */ (data.payload ?? {});
    if (typeof payload.title !== 'string') return;

    const ok = openNativeNotebookByTitle(payload.title);
    if (!ok) log('Notebook not found for click:', payload.title);
  });

  // Also hook navigation events (NotebookLM is a SPA).
  window.addEventListener('popstate', scheduleEnsureMounted);
  try {
    const origPushState = history.pushState;
    history.pushState = function (...args) {
      const ret = origPushState.apply(this, args);
      scheduleEnsureMounted();
      return ret;
    };
    const origReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      const ret = origReplaceState.apply(this, args);
      scheduleEnsureMounted();
      return ret;
    };
  } catch {
    // Ignore if we can't patch (should be rare).
  }

  // Initial mount.
  scheduleEnsureMounted();
})();
