/**
 * Types and interfaces for the modal system
 */

/**
 * Modal types supported
 */
export type ModalType = 'prompt' | 'confirm';

/**
 * Modal configuration options
 */
export interface ModalConfig {
  /** Modal type */
  type: ModalType;
  /** Title displayed in the modal header */
  title: string;
  /** Optional message/description */
  message?: string;
  /** Default value for prompt modals */
  defaultValue?: string;
  /** Text for confirm button */
  confirmText?: string;
  /** Text for cancel button */
  cancelText?: string;
}

/**
 * Modal result for prompt type
 */
export interface PromptModalResult {
  /** User input value */
  value: string | null;
  /** Whether user confirmed (true) or cancelled (false) */
  confirmed: boolean;
}

/**
 * Modal result for confirm type
 */
export interface ConfirmModalResult {
  /** Whether user confirmed (true) or cancelled (false) */
  confirmed: boolean;
}

/**
 * Modal state for internal tracking
 */
export interface ModalState {
  /** Unique identifier */
  id: string;
  /** Modal configuration */
  config: ModalConfig;
  /** Resolve function for the promise */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value: any) => void;
}
