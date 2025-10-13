import { hydrateAccordion } from "./components/accordion";
import { hydrateBottomSheet } from "./components/bottomsheet";
import { hydrateCard } from "./components/card";
import { hydrateDataTable } from "./components/data-table";
import { hydrateDatePicker } from "./components/date-picker";
import { hydrateFilterBar } from "./components/filter-bar";
import { hydrateMetricCard } from "./components/metric-card";
import { hydrateBanner } from "./components/banner";
import { hydrateInputField } from "./components/input-field";
import { hydrateSelectField } from "./components/select-field";
import { hydrateModal } from "./components/modal";
import { hydrateToast } from "./components/toast";
import { hydratePagination } from "./components/pagination";
import { hydrateFileUploader } from "./components/file-uploader";
import { injectVanilaStyles } from "./styles/injectStyles";
import { isBrowser } from "./utils/dom";

export interface HydrationOptions {
  root?: ParentNode;
}

export interface HydrateAllVanilaOptions extends HydrationOptions {
  injectStyles?: boolean;
  styleTarget?: Document | ShadowRoot;
}

const SELECTORS = {
  accordion: "[data-vanila-component='accordion']",
  bottomSheet: "[data-vanila-component='bottom-sheet']",
  card: "[data-vanila-component='card']",
  dataTable: "[data-vanila-component='data-table']",
  filterBar: "[data-vanila-component='filter-bar']",
  datePicker: "[data-vanila-component='date-picker']",
  metricCard: "[data-vanila-component='metric-card']",
  inputField: "[data-vanila-component='input-field']",
  selectField: "[data-vanila-component='select-field']",
  modal: "[data-vanila-component='modal']",
  toast: "[data-vanila-component='toast']",
  pagination: "[data-vanila-component='pagination']",
  banner: "[data-vanila-component='banner']",
  fileUploader: "[data-vanila-component='file-uploader']",
} as const;

export const hydrateVanilaComponents = ({ root }: HydrationOptions = {}): void => {
  if (!isBrowser) {
    return;
  }

  const scope = root ?? document;

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.accordion).forEach((element) => {
    hydrateAccordion(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.bottomSheet).forEach((element) => {
    hydrateBottomSheet(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.card).forEach((element) => {
    hydrateCard(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.dataTable).forEach((element) => {
    hydrateDataTable(element);
  });

  scope.querySelectorAll<HTMLFormElement>(SELECTORS.filterBar).forEach((element) => {
    hydrateFilterBar(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.datePicker).forEach((element) => {
    hydrateDatePicker(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.metricCard).forEach((element) => {
    hydrateMetricCard(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.inputField).forEach((element) => {
    hydrateInputField(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.selectField).forEach((element) => {
    hydrateSelectField(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.modal).forEach((element) => {
    hydrateModal(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.toast).forEach((element) => {
    hydrateToast(element);
  });

  scope.querySelectorAll<HTMLElement>(SELECTORS.pagination).forEach((element) => {
    hydratePagination(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.banner).forEach((element) => {
    hydrateBanner(element);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.fileUploader).forEach((element) => {
    hydrateFileUploader(element);
  });
};

export const hydrateAllVanilaComponents = ({
  injectStyles = true,
  styleTarget,
  root,
}: HydrateAllVanilaOptions = {}): void => {
  if (injectStyles) {
    injectVanilaStyles(styleTarget);
  }

  hydrateVanilaComponents({ root });
};
