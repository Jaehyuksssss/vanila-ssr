/**
 * Bottom Sheet Component Entry Point
 * Optimized for tree-shaking - only includes bottomsheet-related code
 */

export {
  createBottomSheet,
  hydrateBottomSheet,
  renderBottomSheetMarkup,
  showBottomSheet,
} from "../lib/components/bottomsheet";

export type {
  BottomSheetElement,
  BottomSheetHydrationOptions,
  BottomSheetMarkupOptions,
  BottomSheetOptions,
  BottomSheetPresentationOptions,
} from "../lib/components/bottomsheet";

// Include essential accessibility utilities for bottomsheet
export {
  FocusTrap,
  createFocusTrap,
  announceToScreenReader,
  aria,
} from "../lib/utils/accessibility";

export type { FocusTrapOptions } from "../lib/utils/accessibility";
