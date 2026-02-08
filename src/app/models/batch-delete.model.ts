export interface BatchDeleteRequest {
  notebooks: Array<{
    index: number;
    title: string;
    key: string;
  }>;
}

export interface BatchDeleteProgress {
  current: number;
  total: number;
  currentTitle: string;
}

export interface BatchDeleteResult {
  success: boolean;
  deletedCount: number;
  failedCount: number;
  errors?: string[];
}

export interface BatchSelectionState {
  isBatchMode: boolean;
  selectedKeys: Set<string>;
}
