/**
 * Client-only exports (Browser/Hydration)
 * Use this entry point for client-side hydration and interactions
 *
 * @example
 * ```typescript
 * // In client-side JavaScript
 * import { hydrateModal, hydrateDataTable } from 'vanilla-ssr/client';
 *
 * hydrateModal(document.getElementById('my-modal'), {
 *   onClose: () => console.log('closed')
 * });
 * ```
 */

// All hydrate* and create* functions (browser-only)
export { hydrateAccordion, createAccordion } from "./lib/components/accordion";
export {
  hydrateBottomSheet,
  createBottomSheet,
  showBottomSheet,
} from "./lib/components/bottomsheet";
export {
  hydrateCard,
  createCard,
  bindCardClickEvents,
} from "./lib/components/card";
export { hydrateDataTable, createDataTable } from "./lib/components/data-table";
export {
  hydrateDatePicker,
  createDatePicker,
} from "./lib/components/date-picker";
export { hydrateFilterBar, createFilterBar } from "./lib/components/filter-bar";
export {
  hydrateInputField,
  createInputField,
} from "./lib/components/input-field";
export {
  hydrateSelectField,
  createSelectField,
} from "./lib/components/select-field";
export { hydrateModal, createModal, showModal } from "./lib/components/modal";
export { hydrateToast, createToast, showToast } from "./lib/components/toast";
export {
  hydrateMetricCard,
  createMetricCard,
} from "./lib/components/metric-card";
export {
  hydratePagination,
  createPagination,
} from "./lib/components/pagination";
export { hydrateBanner, createBanner } from "./lib/components/banner";
export {
  hydrateFileUploader,
  createFileUploader,
} from "./lib/components/file-uploader";

// Utilities (client-safe)
export {
  renderBadge,
  renderSuccessBadge,
  renderWarningBadge,
  renderDangerBadge,
  renderInfoBadge,
  renderChip,
  renderChips,
  createChip,
  renderStatusDot,
  StatusPresets,
  TableHelpers,
} from "./lib/utilities";

// Hydration helpers
export {
  hydrateVanilaComponents,
  hydrateAllVanilaComponents,
  hydrateOnVisible,
} from "./lib/hydration";

// Style injection (browser-only)
export {
  injectVanilaStyles,
  getVanilaStyleText,
} from "./lib/styles/injectStyles";

// Theme (browser-only)
export {
  lightTheme,
  darkTheme,
  applyTheme,
  applyThemeMode,
  removeTheme,
  getCurrentThemeMode,
  toggleTheme,
  initializeTheme,
  generateThemeScript,
} from "./lib/theme";

// Accessibility utilities
export {
  FocusTrap,
  createFocusTrap,
  RovingTabindex,
  announceToScreenReader,
  aria,
} from "./lib/utils/accessibility";
export type { FocusTrapOptions } from "./lib/utils/accessibility";

// Types
export type * from "./index";
