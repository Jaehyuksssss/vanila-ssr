/**
 * Toast Component Entry Point
 * Optimized for tree-shaking - only includes toast-related code
 */

export {
  createToast,
  hydrateToast,
  renderToastMarkup,
  showToast,
} from "../lib/components/toast";

export type {
  ToastElement,
  ToastHydrationOptions,
  ToastMarkupOptions,
  ToastOptions,
  ToastPosition,
  ToastType,
} from "../lib/components/toast";

// Include essential accessibility utilities for toast
export {
  announceToScreenReader,
  aria,
} from "../lib/utils/accessibility";
