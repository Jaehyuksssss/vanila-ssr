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

export { hydrateVanilaComponents } from "./lib/hydration";

export { injectVanilaStyles, getVanilaStyleText } from "./lib/styles/injectStyles";
