/**
 * Hydration safety utilities
 * Prevents duplicate initialization and ensures idempotent hydration
 */

const HYDRATION_ATTR = "data-vanila-hydrated";
const HYDRATION_HASH_ATTR = "data-vanila-hash";

/**
 * Generates a simple hash from component options for SSR-CSR match verification
 */
export function generateOptionsHash(options: Record<string, any>): string {
  const str = JSON.stringify(options, (_key, value) => {
    // Skip functions and callbacks
    if (typeof value === "function") return undefined;
    return value;
  });

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Checks if an element has already been hydrated
 * @returns true if already hydrated (should skip), false if needs hydration
 */
export function isAlreadyHydrated(
  element: HTMLElement,
  componentName: string
): boolean {
  const hydratedComponents = element.getAttribute(HYDRATION_ATTR);

  if (!hydratedComponents) {
    return false;
  }

  const components = hydratedComponents.split(",");
  return components.includes(componentName);
}

/**
 * Marks an element as hydrated for a specific component
 */
export function markAsHydrated(
  element: HTMLElement,
  componentName: string
): void {
  const existing = element.getAttribute(HYDRATION_ATTR);

  if (!existing) {
    element.setAttribute(HYDRATION_ATTR, componentName);
  } else if (!existing.split(",").includes(componentName)) {
    element.setAttribute(HYDRATION_ATTR, `${existing},${componentName}`);
  }
}

/**
 * Verifies SSR-CSR props match (warns on mismatch, doesn't throw)
 */
export function verifyHydrationMatch(
  element: HTMLElement,
  componentName: string,
  options: Record<string, any>
): void {
  const ssrHash = element.getAttribute(HYDRATION_HASH_ATTR);

  if (!ssrHash) {
    // No SSR hash, likely CSR-only initialization (OK)
    return;
  }

  const csrHash = generateOptionsHash(options);

  if (ssrHash !== csrHash) {
    console.warn(
      `[Vanila Components] Hydration mismatch detected for ${componentName}. ` +
        `SSR props may differ from CSR props. This can cause visual inconsistencies.`,
      { element, ssrHash, csrHash }
    );
  }
}

/**
 * Safe hydration wrapper - prevents duplicate hydration
 *
 * @example
 * ```typescript
 * export function hydrateModal(el: HTMLElement, options: ModalOptions) {
 *   return safeHydrate(el, 'modal', options, (element) => {
 *     // Actual hydration logic here
 *     return attachModalBehavior(element, options);
 *   });
 * }
 * ```
 */
export function safeHydrate<T extends HTMLElement>(
  element: HTMLElement,
  componentName: string,
  options: Record<string, any>,
  hydrationFn: (element: HTMLElement) => T
): T | null {
  // Check if already hydrated
  if (isAlreadyHydrated(element, componentName)) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[Vanila Components] ${componentName} already hydrated, skipping.`,
        element
      );
    }
    return element as T;
  }

  // Verify SSR-CSR match
  verifyHydrationMatch(element, componentName, options);

  // Perform actual hydration
  const hydratedElement = hydrationFn(element);

  // Mark as hydrated
  markAsHydrated(element, componentName);

  return hydratedElement;
}

/**
 * Attaches hash to server-rendered markup for hydration verification
 * Use this in render*Markup functions
 */
export function attachHydrationHash(options: Record<string, any>): string {
  const hash = generateOptionsHash(options);
  return `${HYDRATION_HASH_ATTR}="${hash}"`;
}
