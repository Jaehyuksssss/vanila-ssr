import "./lib/styles/vanila.css";

export {
  createAccordion,
  hydrateAccordion,
  renderAccordionMarkup,
} from "./lib/components/accordion";
export type {
  AccordionElement,
  AccordionHydrationOptions,
  AccordionItemOptions,
  AccordionMarkupOptions,
  AccordionDeleteRequestContext,
} from "./lib/components/accordion";

export {
  createBottomSheet,
  hydrateBottomSheet,
  renderBottomSheetMarkup,
  showBottomSheet,
} from "./lib/components/bottomsheet";
export type {
  BottomSheetElement,
  BottomSheetHydrationOptions,
  BottomSheetMarkupOptions,
  BottomSheetOptions,
  BottomSheetPresentationOptions,
} from "./lib/components/bottomsheet";

export {
  bindCardClickEvents,
  createCard,
  hydrateCard,
  renderCard,
  renderCardMarkup,
  renderCards,
} from "./lib/components/card";
export type {
  CardElement,
  CardHydrationOptions,
  CardMarkupOptions,
  CardOptions,
  RenderCardsOptions,
} from "./lib/components/card";

export {
  createDataTable,
  hydrateDataTable,
  renderDataTableMarkup,
} from "./lib/components/data-table";
export type {
  DataTableElement,
  DataTableHydrationOptions,
  DataTableMarkupOptions,
  DataTableOptions,
  SortDirection,
  TableAlignment,
  TableColumn,
} from "./lib/components/data-table";

export {
  createDatePicker,
  hydrateDatePicker,
  renderDatePickerMarkup,
} from "./lib/components/date-picker";
export type {
  DatePickerElement,
  DatePickerOptions,
  DatePickerMarkupOptions,
  DatePickerHydrationOptions,
  DatePickerMode,
  DatePickerRangeValue,
  DatePickerValue,
  DatePickerSize,
} from "./lib/components/date-picker";

export {
  createFilterBar,
  hydrateFilterBar,
  renderFilterBarMarkup,
} from "./lib/components/filter-bar";
export type {
  FilterBarElement,
  FilterBarHydrationOptions,
  FilterBarMarkupOptions,
  FilterBarOptions,
  FilterField,
  FilterLayout,
} from "./lib/components/filter-bar";

export {
  createInputField,
  hydrateInputField,
  renderInputFieldMarkup,
} from "./lib/components/input-field";
export type {
  InputFieldElement,
  InputFieldHydrationOptions,
  InputFieldMarkupOptions,
  InputFieldOptions,
  InputFieldSize,
  InputFieldType,
} from "./lib/components/input-field";

export {
  createSelectField,
  hydrateSelectField,
  renderSelectFieldMarkup,
} from "./lib/components/select-field";
export type {
  SelectFieldElement,
  SelectFieldHydrationOptions,
  SelectFieldMarkupOptions,
  SelectFieldOptions,
  SelectFieldSize,
  SelectOption,
} from "./lib/components/select-field";

export {
  createModal,
  hydrateModal,
  renderModalMarkup,
  showModal,
} from "./lib/components/modal";
export type {
  ModalElement,
  ModalHydrationOptions,
  ModalMarkupOptions,
  ModalOptions,
  ModalPresentationOptions,
} from "./lib/components/modal";

export {
  createToast,
  hydrateToast,
  renderToastMarkup,
  showToast,
} from "./lib/components/toast";
export type {
  ToastElement,
  ToastHydrationOptions,
  ToastMarkupOptions,
  ToastOptions,
  ToastPosition,
  ToastType,
} from "./lib/components/toast";

export {
  createMetricCard,
  hydrateMetricCard,
  renderMetricCardMarkup,
} from "./lib/components/metric-card";
export type {
  MetricCardElement,
  MetricCardMarkupOptions,
  MetricCardOptions,
  MetricCardSize,
  MetricCardVariant,
  MetricTrend,
} from "./lib/components/metric-card";

export {
  createPagination,
  hydratePagination,
  renderPaginationMarkup,
} from "./lib/components/pagination";
export type {
  PaginationElement,
  PaginationOptions,
  PaginationMarkupOptions,
  PaginationHydrationOptions,
  PaginationSize,
} from "./lib/components/pagination";

export {
  hydrateVanilaComponents,
  hydrateAllVanilaComponents,
} from "./lib/hydration";
export type {
  HydrationOptions,
  HydrateAllVanilaOptions,
} from "./lib/hydration";

export {
  injectVanilaStyles,
  getVanilaStyleText,
} from "./lib/styles/injectStyles";

export {
  renderBannerMarkup,
  createBanner,
  hydrateBanner,
} from "./lib/components/banner";
export type {
  BannerOptions,
  BannerMarkupOptions,
  BannerHydrationOptions,
  BannerElement,
  BannerVariant,
  BannerAction,
  BannerActionVariant,
} from "./lib/components/banner";

export {
  renderFileUploaderMarkup,
  createFileUploader,
  hydrateFileUploader,
} from "./lib/components/file-uploader";
export type {
  FileUploaderOptions,
  FileUploaderMarkupOptions,
  FileUploaderHydrationOptions,
  FileUploaderElement,
  FileUploaderError,
  FileUploaderSize,
} from "./lib/components/file-uploader";

// Utilities (v0.3.0)
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

// Theme System (v0.3.0)
export {
  lightTheme,
  darkTheme,
  applyTheme,
  applyThemeMode,
  removeTheme,
  getCurrentThemeMode,
  toggleTheme,
} from "./lib/theme";
export type { ThemeMode, ThemeTokens, ThemeConfig } from "./lib/theme";
