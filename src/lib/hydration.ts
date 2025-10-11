import { hydrateAccordion } from "./components/accordion";
import { hydrateBottomSheet } from "./components/bottomsheet";
import { hydrateCard } from "./components/card";
import { hydrateDataTable } from "./components/data-table";
import { hydrateFilterBar } from "./components/filter-bar";
import { hydrateMetricCard } from "./components/metric-card";
import { hydrateInputField } from "./components/input-field";
import { hydrateSelectField } from "./components/select-field";
import { hydrateModal } from "./components/modal";
import { hydrateToast } from "./components/toast";
import { isBrowser } from "./utils/dom";

export interface HydrationOptions {
  root?: ParentNode;
}

const SELECTORS = {
  accordion: "[data-vanila-component='accordion']",
  bottomSheet: "[data-vanila-component='bottom-sheet']",
  card: "[data-vanila-component='card']",
  dataTable: "[data-vanila-component='data-table']",
  filterBar: "[data-vanila-component='filter-bar']",
  metricCard: "[data-vanila-component='metric-card']",
  inputField: "[data-vanila-component='input-field']",
  selectField: "[data-vanila-component='select-field']",
  modal: "[data-vanila-component='modal']",
  toast: "[data-vanila-component='toast']",
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
};
