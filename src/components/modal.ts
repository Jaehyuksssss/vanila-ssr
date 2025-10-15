/**
 * Modal Component Entry Point
 * Optimized for tree-shaking - only includes modal-related code
 */

export {
  createModal,
  hydrateModal,
  renderModalMarkup,
  showModal,
} from "../lib/components/modal";

export type {
  ModalElement,
  ModalHydrationOptions,
  ModalMarkupOptions,
  ModalOptions,
  ModalPresentationOptions,
} from "../lib/components/modal";

// Include only essential accessibility utilities for modal
export {
  FocusTrap,
  createFocusTrap,
  announceToScreenReader,
  aria,
} from "../lib/utils/accessibility";

export type { FocusTrapOptions } from "../lib/utils/accessibility";
