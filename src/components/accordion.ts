/**
 * Accordion Component Entry Point
 * Optimized for tree-shaking - only includes accordion-related code
 */

export {
  createAccordion,
  hydrateAccordion,
  renderAccordionMarkup,
} from "../lib/components/accordion";

export type {
  AccordionElement,
  AccordionHydrationOptions,
  AccordionItemOptions,
  AccordionMarkupOptions,
  AccordionDeleteRequestContext,
} from "../lib/components/accordion";

// Include only essential accessibility utilities for accordion
export {
  RovingTabindex,
  announceToScreenReader,
  aria,
} from "../lib/utils/accessibility";
