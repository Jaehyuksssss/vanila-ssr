/**
 * Accessibility utilities entry point
 * Optimized for tree-shaking
 */

export {
  FocusTrap,
  createFocusTrap,
  RovingTabindex,
  announceToScreenReader,
  aria,
} from "./lib/utils/accessibility";

export type { FocusTrapOptions } from "./lib/utils/accessibility";
