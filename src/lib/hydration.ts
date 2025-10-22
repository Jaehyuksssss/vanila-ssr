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
import { getConfig } from "./config";
import { isBrowser } from "./utils/dom";

export interface HydrationOptions {
  root?: ParentNode;
  /** Skip already hydrated elements (default: true) */
  skipHydrated?: boolean;
  /** Log hydration warnings (default: false in production) */
  debug?: boolean;
}

export interface HydrateAllVanilaOptions extends HydrationOptions {
  injectStyles?: boolean;
  styleTarget?: Document | ShadowRoot;
}

// Hydration state tracking
const HYDRATED_ATTRIBUTE = 'data-vanila-hydrated';
const HYDRATION_HASH_ATTRIBUTE = 'data-vanila-hash';

/**
 * Generate a simple hash from element attributes for hydration validation
 */
function generateElementHash(element: Element): string {
  const attrs = Array.from(element.attributes)
    .filter(attr => !attr.name.startsWith('data-vanila-'))
    .map(attr => `${attr.name}=${attr.value}`)
    .sort()
    .join('|');
  
  let hash = 0;
  for (let i = 0; i < attrs.length; i++) {
    const char = attrs.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Check if element is already hydrated and optionally validate consistency
 */
function isElementHydrated(element: Element, debug = false): boolean {
  const isHydrated = element.hasAttribute(HYDRATED_ATTRIBUTE);
  
  if (isHydrated && debug) {
    const currentHash = generateElementHash(element);
    const storedHash = element.getAttribute(HYDRATION_HASH_ATTRIBUTE);
    
    if (storedHash && currentHash !== storedHash) {
      console.warn(
        '[Vanila Components] Hydration mismatch detected. Element may have been modified after SSR.',
        { element, currentHash, storedHash }
      );
    }
  }
  
  return isHydrated;
}

/**
 * Mark element as hydrated with optional hash for validation
 */
function markElementHydrated(element: Element, debug = false): void {
  element.setAttribute(HYDRATED_ATTRIBUTE, 'true');
  
  if (debug) {
    const hash = generateElementHash(element);
    element.setAttribute(HYDRATION_HASH_ATTRIBUTE, hash);
  }
}

/**
 * Safe hydration wrapper that prevents duplicate hydration
 */
function safeHydrate(
  element: Element,
  hydrateFn: (el: any) => void,
  options: { skipHydrated?: boolean; debug?: boolean } = {}
): void {
  const { skipHydrated = true, debug = false } = options;
  
  if (skipHydrated && isElementHydrated(element, debug)) {
    if (debug) {
      console.log('[Vanila Components] Skipping already hydrated element:', element);
    }
    return;
  }
  
  try {
    hydrateFn(element);
    markElementHydrated(element, debug);
    
    if (debug) {
      console.log('[Vanila Components] Successfully hydrated:', element);
    }
  } catch (error) {
    console.error('[Vanila Components] Hydration failed:', error, element);
  }
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

export const hydrateVanilaComponents = ({ 
  root, 
  skipHydrated = true, 
  debug = false 
}: HydrationOptions = {}): void => {
  if (!isBrowser) {
    if (debug) {
      console.warn('[Vanila Components] Hydration skipped: not in browser environment');
    }
    return;
  }

  const scope = root ?? document;
  const hydrateOptions = { skipHydrated, debug };

  // Hydrate all component types with safety checks
  scope.querySelectorAll<HTMLDivElement>(SELECTORS.accordion).forEach((element) => {
    safeHydrate(element, hydrateAccordion, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.bottomSheet).forEach((element) => {
    safeHydrate(element, hydrateBottomSheet, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.card).forEach((element) => {
    safeHydrate(element, hydrateCard, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.dataTable).forEach((element) => {
    safeHydrate(element, hydrateDataTable, hydrateOptions);
  });

  scope.querySelectorAll<HTMLFormElement>(SELECTORS.filterBar).forEach((element) => {
    safeHydrate(element, hydrateFilterBar, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.datePicker).forEach((element) => {
    safeHydrate(element, hydrateDatePicker, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.metricCard).forEach((element) => {
    safeHydrate(element, hydrateMetricCard, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.inputField).forEach((element) => {
    safeHydrate(element, hydrateInputField, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.selectField).forEach((element) => {
    safeHydrate(element, hydrateSelectField, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.modal).forEach((element) => {
    safeHydrate(element, hydrateModal, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.toast).forEach((element) => {
    safeHydrate(element, hydrateToast, hydrateOptions);
  });

  scope.querySelectorAll<HTMLElement>(SELECTORS.pagination).forEach((element) => {
    safeHydrate(element, hydratePagination, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.banner).forEach((element) => {
    safeHydrate(element, hydrateBanner, hydrateOptions);
  });

  scope.querySelectorAll<HTMLDivElement>(SELECTORS.fileUploader).forEach((element) => {
    safeHydrate(element, hydrateFileUploader, hydrateOptions);
  });
};

export const hydrateAllVanilaComponents = ({
  injectStyles = true,
  styleTarget,
  root,
  skipHydrated = true,
  debug = false,
}: HydrateAllVanilaOptions = {}): void => {
  if (injectStyles) {
    const globalTarget = getConfig().styleTarget;
    injectVanilaStyles(styleTarget ?? globalTarget);
  }

  const globalDebug = getConfig().debug ?? false;
  hydrateVanilaComponents({ root, skipHydrated, debug: debug || globalDebug });
};

/**
 * Lazy hydration utility - hydrates components when they become visible
 */
export const hydrateOnVisible = (
  selector: string,
  hydrateFn: (element: Element) => void,
  options: { root?: Element; rootMargin?: string; threshold?: number } = {}
): void => {
  if (!isBrowser || !('IntersectionObserver' in window)) {
    // Fallback to immediate hydration if IntersectionObserver is not available
    document.querySelectorAll(selector).forEach(hydrateFn);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        hydrateFn(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: options.root || null,
    rootMargin: options.rootMargin || '50px',
    threshold: options.threshold || 0.1,
  });

  document.querySelectorAll(selector).forEach((element) => {
    observer.observe(element);
  });
};

/**
 * Hydrate on first interaction with the element(s).
 */
export const hydrateOnInteraction = (
  selector: string,
  hydrateFn: (element: Element) => void,
  options: { events?: string[]; capture?: boolean } = {}
): void => {
  if (!isBrowser) {
    return;
  }

  const events = options.events ?? ["click", "focusin", "keydown"];

  const attach = (el: Element) => {
    const once = { once: true, capture: options.capture ?? false } as AddEventListenerOptions;
    const handler = () => hydrateFn(el);
    events.forEach((evt) => el.addEventListener(evt, handler, once));
  };

  document.querySelectorAll(selector).forEach(attach);
};

/**
 * Hydrate when browser is idle (or after a fallback timeout)
 */
export const hydrateOnIdle = (
  fn: () => void,
  options: { timeout?: number } = {}
): void => {
  if (!isBrowser) {
    return;
  }

  const timeout = options.timeout ?? 1000;

  // @ts-ignore - requestIdleCallback may not exist in all TS libs
  const ric: typeof window.requestIdleCallback | undefined = (window as any).requestIdleCallback;

  if (typeof ric === "function") {
    ric(fn, { timeout });
  } else {
    setTimeout(fn, timeout);
  }
};
