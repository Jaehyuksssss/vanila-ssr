/**
 * Server-only exports (SSR/Pre-rendering)
 * Use this entry point in server-side rendering contexts
 *
 * @example
 * ```typescript
 * // In server-side template (e.g., Laravel Blade, Express, Next.js)
 * import { renderModalMarkup, renderDataTableMarkup } from 'vanilla-ssr/server';
 *
 * const html = renderModalMarkup({ title: 'Hello', message: 'World' });
 * ```
 */

// All render*Markup functions (pure, no side effects)
export { renderAccordionMarkup } from "./lib/components/accordion";
export { renderBottomSheetMarkup } from "./lib/components/bottomsheet";
export { renderCardMarkup, renderCards } from "./lib/components/card";
export { renderDataTableMarkup } from "./lib/components/data-table";
export { renderDatePickerMarkup } from "./lib/components/date-picker";
export { renderFilterBarMarkup } from "./lib/components/filter-bar";
export { renderInputFieldMarkup } from "./lib/components/input-field";
export { renderSelectFieldMarkup } from "./lib/components/select-field";
export { renderModalMarkup } from "./lib/components/modal";
export { renderToastMarkup } from "./lib/components/toast";
export { renderMetricCardMarkup } from "./lib/components/metric-card";
export { renderPaginationMarkup } from "./lib/components/pagination";
export { renderBannerMarkup } from "./lib/components/banner";
export { renderFileUploaderMarkup } from "./lib/components/file-uploader";

// Utility render functions
export {
  renderBadge,
  renderSuccessBadge,
  renderWarningBadge,
  renderDangerBadge,
  renderInfoBadge,
  renderChip,
  renderChips,
  renderStatusDot,
  StatusPresets,
} from "./lib/utilities";

// Style utilities (safe for server)
export { getVanilaStyleText } from "./lib/styles/injectStyles";

// Theme tokens (for SSR)
export { lightTheme, darkTheme, generateThemeScript } from "./lib/theme";

// Types
export type * from "./index";
