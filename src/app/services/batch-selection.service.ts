import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BatchSelectionService {
  private readonly _isBatchMode$ = new BehaviorSubject<boolean>(false);
  private readonly _selectedKeys$ = new BehaviorSubject<Set<string>>(new Set());

  readonly isBatchMode$: Observable<boolean> = this._isBatchMode$.asObservable();
  readonly selectedKeys$: Observable<Set<string>> = this._selectedKeys$.asObservable();
  
  readonly selectedCount$ = this._selectedKeys$.pipe(
    map(keys => keys.size)
  );

  get isBatchMode(): boolean {
    return this._isBatchMode$.value;
  }

  get selectedCount(): number {
    return this._selectedKeys$.value.size;
  }

  get selectedKeys(): Set<string> {
    return new Set(this._selectedKeys$.value);
  }

  isSelected(key: string): boolean {
    return this._selectedKeys$.value.has(key);
  }

  toggleBatchMode(): void {
    const newMode = !this._isBatchMode$.value;
    this._isBatchMode$.next(newMode);
    
    if (!newMode) {
      this.clearSelection();
    }
  }

  enableBatchMode(): void {
    this._isBatchMode$.next(true);
  }

  disableBatchMode(): void {
    this._isBatchMode$.next(false);
    this.clearSelection();
  }

  toggleSelection(key: string): void {
    const current = new Set(this._selectedKeys$.value);
    
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    
    this._selectedKeys$.next(current);
  }

  select(key: string): void {
    const current = new Set(this._selectedKeys$.value);
    current.add(key);
    this._selectedKeys$.next(current);
  }

  deselect(key: string): void {
    const current = new Set(this._selectedKeys$.value);
    current.delete(key);
    this._selectedKeys$.next(current);
  }

  clearSelection(): void {
    this._selectedKeys$.next(new Set());
  }

  getSelectedKeysArray(): string[] {
    return Array.from(this._selectedKeys$.value);
  }
}
