// Native drag-and-drop setup for artifact notes.
// This runs in the page context (not iframe) so it can set event handlers directly.
(function () {
    const NLE = (window.__NLE__ = window.__NLE__ || {});
    const { extensionHostId, selectors } = NLE.constants;
    const state = NLE.state;

    // Track which notes we've already set up for drag
    const setupNotes = new WeakSet();

    /**
     * Setup draggable attribute and dragstart handler on native note elements.
     */
    NLE.setupNativeDrag = function setupNativeDrag() {
        const notes = document.querySelectorAll('artifact-library-note');

        for (const note of notes) {
            // Skip if inside our widget host
            if (note.closest(`#${extensionHostId}`)) continue;

            // Skip if already set up
            if (setupNotes.has(note)) continue;

            const titleEl = note.querySelector(selectors.artifactTitle);
            if (!titleEl) continue;

            const el = /** @type {HTMLElement} */ (note);
            el.setAttribute('draggable', 'true');

            el.addEventListener('dragstart', (e) => {
                const title = titleEl.textContent?.trim() || '';
                // Find the notebook data from our synced list
                const notebooks = state.notebooks || [];
                const nb = notebooks.find((n) => n.title.trim() === title);

                if (e.dataTransfer) {
                    e.dataTransfer.setData('text/plain', title);
                    e.dataTransfer.setData('application/x-nle-note', JSON.stringify({
                        key: nb?.key || '',
                        title: title
                    }));
                    e.dataTransfer.effectAllowed = 'move';
                }

                // Add visual feedback
                el.style.opacity = '0.5';
            });

            el.addEventListener('dragend', (e) => {
                el.style.opacity = '';
            });

            setupNotes.add(note);
        }
    };

    /**
     * Hide or show native notes based on folder assignments.
     * @param {Record<string, string>} folderByTitle - Map of title -> folderId
     */
    NLE.updateNativeNoteVisibility = function updateNativeNoteVisibility(folderByTitle) {
        const notes = document.querySelectorAll('artifact-library-note');

        for (const note of notes) {
            // Skip if inside our widget host
            if (note.closest(`#${extensionHostId}`)) continue;

            const titleEl = note.querySelector(selectors.artifactTitle);
            if (!titleEl) continue;

            const title = titleEl.textContent?.trim() || '';
            const el = /** @type {HTMLElement} */ (note);

            if (folderByTitle[title]) {
                el.style.display = 'none';
            } else {
                el.style.display = '';
            }
        }
    };
})();
