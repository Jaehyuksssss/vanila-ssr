/**
 * Data Table Component Entry Point
 * Optimized for tree-shaking - only includes data-table-related code
 */

export {
  createDataTable,
  hydrateDataTable,
  renderDataTableMarkup,
} from "../lib/components/data-table";

export type {
  DataTableElement,
  DataTableHydrationOptions,
  DataTableMarkupOptions,
  DataTableOptions,
  SortDirection,
  TableAlignment,
  TableColumn,
} from "../lib/components/data-table";

// Include table-specific utilities
export { TableHelpers } from "../lib/utilities";

// Include essential accessibility utilities for tables
export {
  RovingTabindex,
  announceToScreenReader,
  aria,
} from "../lib/utils/accessibility";
