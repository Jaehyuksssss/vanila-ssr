/**
 * Utilities entry point for per-component imports
 * Optimized for tree-shaking
 */

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

export type {
  BadgeOptions,
  BadgeVariant,
  BadgeSize,
  ChipOptions,
  ChipElement,
  StatusDotOptions,
  StatusColor,
} from "./lib/utilities";
