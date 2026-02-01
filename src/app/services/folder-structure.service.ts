import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import type { Folder } from '../models/folder.model';
import type { NotebookScopedState, StorageState } from '../models/storage-state.model';
import { createEmptyNotebookState } from '../models/storage-state.model';
import { StorageService } from './storage.service';

function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `f_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

@Injectable({ providedIn: 'root' })
export class FolderStructureService {
  private readonly state$ = new BehaviorSubject<StorageState | null>(null);
  private activeNotebookId = 'default';
  private pendingNotebookId: string | null = null;

  readonly folders$ = new BehaviorSubject<Folder[]>([]);
  readonly notebookFolderByKey$ = new BehaviorSubject<Record<string, string | null>>({});
  readonly notebookFolderByTitle$ = new BehaviorSubject<Record<string, string | null>>({});

  constructor(private readonly storage: StorageService) {
    void this.init();
  }

  private async init(): Promise<void> {
    const state = await this.storage.load();
    this.state$.next(state);
    if (this.pendingNotebookId) {
      this.activeNotebookId = this.pendingNotebookId;
      this.pendingNotebookId = null;
    } else {
      this.activeNotebookId = state.activeNotebookId ?? 'default';
    }
    if (!state.byNotebook[this.activeNotebookId]) {
      const nextState: StorageState = {
        ...state,
        byNotebook: {
          ...state.byNotebook,
          [this.activeNotebookId]: createEmptyNotebookState(),
        },
        activeNotebookId: this.activeNotebookId,
      };
      await this.commit(nextState);
      return;
    }
    this.applyActiveNotebook(state);
  }

  private applyActiveNotebook(state: StorageState): void {
    const notebook = state.byNotebook[this.activeNotebookId] ?? createEmptyNotebookState();
    this.folders$.next(notebook.folders);
    this.notebookFolderByKey$.next(notebook.notebookFolderByKey);
    this.notebookFolderByTitle$.next(notebook.notebookFolderByTitle);
  }

  private updateActiveNotebook(state: StorageState, nextNotebook: NotebookScopedState): StorageState {
    return {
      ...state,
      byNotebook: {
        ...state.byNotebook,
        [this.activeNotebookId]: nextNotebook,
      },
      activeNotebookId: this.activeNotebookId,
    };
  }

  private async commit(next: StorageState): Promise<void> {
    this.state$.next(next);
    this.applyActiveNotebook(next);
    await this.storage.save(next);
  }

  async setActiveNotebookId(notebookId: string | null): Promise<void> {
    const nextId = notebookId && notebookId.trim() ? notebookId.trim() : 'default';
    const base = this.state$.value;
    if (!base) {
      this.pendingNotebookId = nextId;
      return;
    }

    this.activeNotebookId = nextId;
    
    if (!base.byNotebook[nextId]) {
      const nextState: StorageState = {
        ...base,
        byNotebook: {
          ...base.byNotebook,
          [nextId]: createEmptyNotebookState(),
        },
        activeNotebookId: nextId,
      };
      await this.commit(nextState);
      return;
    }
    const nextState: StorageState = {
      ...base,
      activeNotebookId: nextId,
    };
    this.state$.next(nextState);
    this.applyActiveNotebook(nextState);
    await this.storage.save(nextState);
  }

  async createFolder(name: string, parentId: string | null = null): Promise<Folder> {
    const base = this.state$.value;
    if (!base) throw new Error('FolderStructureService not initialized');
    const current = base.byNotebook[this.activeNotebookId] ?? createEmptyNotebookState();

    // Validate: Only allow 1 level of subfolders (max depth = 1)
    // If parentId is provided, check that the parent is a root folder (parentId === null)
    if (parentId) {
      const parent = current.folders.find((f) => f.id === parentId);
      if (parent && parent.parentId !== null) {
        throw new Error('Cannot create subfolders deeper than 1 level');
      }
    }

    const folder: Folder = {
      id: uid(),
      name: name.trim() || 'Untitled',
      parentId,
      collapsed: false,
      createdAt: Date.now(),
    };

    await this.commit(
      this.updateActiveNotebook(base, {
        ...current,
        folders: [...current.folders, folder],
      })
    );

    return folder;
  }

  async renameFolder(folderId: string, name: string): Promise<void> {
    const base = this.state$.value;
    if (!base) throw new Error('FolderStructureService not initialized');
    const current = base.byNotebook[this.activeNotebookId] ?? createEmptyNotebookState();

    const nextName = name.trim();
    if (!nextName) return;

    await this.commit(
      this.updateActiveNotebook(base, {
        ...current,
        folders: current.folders.map((f) => (f.id === folderId ? { ...f, name: nextName } : f)),
      })
    );
  }

  async deleteFolder(folderId: string): Promise<void> {
    const base = this.state$.value;
    if (!base) throw new Error('FolderStructureService not initialized');
    const current = base.byNotebook[this.activeNotebookId] ?? createEmptyNotebookState();

    const deletedIds = this.getDescendantFolderIds(current.folders, folderId);
    deletedIds.add(folderId);

    const remaining = current.folders.filter((f) => !deletedIds.has(f.id));

    const nextKeyMap: Record<string, string | null> = { ...current.notebookFolderByKey };
    for (const [key, id] of Object.entries(nextKeyMap)) {
      if (id && deletedIds.has(id)) nextKeyMap[key] = null;
    }

    const nextTitleMap: Record<string, string | null> = { ...current.notebookFolderByTitle };
    for (const [title, id] of Object.entries(nextTitleMap)) {
      if (id && deletedIds.has(id)) nextTitleMap[title] = null;
    }

    await this.commit(
      this.updateActiveNotebook(base, {
        ...current,
        folders: remaining,
        notebookFolderByKey: nextKeyMap,
        notebookFolderByTitle: nextTitleMap,
      })
    );
  }

  async toggleFolderCollapsed(folderId: string): Promise<void> {
    const base = this.state$.value;
    if (!base) throw new Error('FolderStructureService not initialized');
    const current = base.byNotebook[this.activeNotebookId] ?? createEmptyNotebookState();

    await this.commit(
      this.updateActiveNotebook(base, {
        ...current,
        folders: current.folders.map((f) => (f.id === folderId ? { ...f, collapsed: !f.collapsed } : f)),
      })
    );
  }

  private getDescendantFolderIds(folders: Folder[], folderId: string): Set<string> {
    const byParent = new Map<string, string[]>();
    for (const f of folders) {
      if (!f.parentId) continue;
      const arr = byParent.get(f.parentId) ?? [];
      arr.push(f.id);
      byParent.set(f.parentId, arr);
    }

    const out = new Set<string>();
    const stack = [...(byParent.get(folderId) ?? [])];
    while (stack.length > 0) {
      const id = stack.pop();
      if (!id || out.has(id)) continue;
      out.add(id);
      for (const child of byParent.get(id) ?? []) stack.push(child);
    }
    return out;
  }

  async setNotebookFolder(notebookKey: string, folderId: string | null, notebookTitle?: string): Promise<void> {
    const base = this.state$.value;
    if (!base) throw new Error('FolderStructureService not initialized');
    const current = base.byNotebook[this.activeNotebookId] ?? createEmptyNotebookState();

    const nextKeyMap: Record<string, string | null> = {
      ...current.notebookFolderByKey,
      [notebookKey]: folderId,
    };

    const nextTitleMap: Record<string, string | null> =
      typeof notebookTitle === 'string'
        ? {
            ...current.notebookFolderByTitle,
            [notebookTitle]: folderId,
          }
        : current.notebookFolderByTitle;

    await this.commit(
      this.updateActiveNotebook(base, {
        ...current,
        notebookFolderByKey: nextKeyMap,
        notebookFolderByTitle: nextTitleMap,
      })
    );
  }

  async setNotebooksFolder(notebooks: Array<{ key: string; title?: string }>, folderId: string | null): Promise<void> {
    const base = this.state$.value;
    if (!base) throw new Error('FolderStructureService not initialized');
    const current = base.byNotebook[this.activeNotebookId] ?? createEmptyNotebookState();
    if (notebooks.length === 0) return;

    const nextKeyMap: Record<string, string | null> = { ...current.notebookFolderByKey };
    const nextTitleMap: Record<string, string | null> = { ...current.notebookFolderByTitle };

    for (const nb of notebooks) {
      if (!nb.key) continue;
      nextKeyMap[nb.key] = folderId;

      if (typeof nb.title === 'string' && nb.title.trim()) {
        nextTitleMap[nb.title] = folderId;
      }
    }

    await this.commit(
      this.updateActiveNotebook(base, {
        ...current,
        notebookFolderByKey: nextKeyMap,
        notebookFolderByTitle: nextTitleMap,
      })
    );
  }
}
