import type { Folder } from './folder.model';

export type StorageStateV1 = {
  version: 1;
  folders: Folder[];
  notebookFolderByTitle: Record<string, string | null>;
};

export type StorageStateV2 = {
  version: 2;
  folders: Folder[];
  notebookFolderByKey: Record<string, string | null>;
  notebookFolderByTitle: Record<string, string | null>;
};

export type NotebookScopedState = {
  folders: Folder[];
  notebookFolderByKey: Record<string, string | null>;
  notebookFolderByTitle: Record<string, string | null>;
};

export type StorageStateV3 = {
  version: 3;
  byNotebook: Record<string, NotebookScopedState>;
  activeNotebookId?: string;
};

export type StorageState = StorageStateV3;

export function createEmptyNotebookState(): NotebookScopedState {
  return {
    folders: [],
    notebookFolderByKey: {},
    notebookFolderByTitle: {},
  };
}

export const DEFAULT_STORAGE_STATE: StorageState = {
  version: 3,
  byNotebook: {
    default: createEmptyNotebookState(),
  },
  activeNotebookId: 'default',
};
