/**
 * Theme application utilities
 * Includes FART (Flash of Incorrect Theme) prevention
 * @module theme/applyTheme
 */

import type { ThemeMode, ThemeTokens, ThemeConfig } from "./types";
import { lightTheme, darkTheme } from "./tokens";

const THEME_STORAGE_KEY = "vanila-theme-mode";
const THEME_ATTRIBUTE = "data-vanila-theme";

/**
 * Get system preference for color scheme
 */
function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Get stored theme preference
 */
function getStoredTheme(): ThemeMode | null {
  if (typeof localStorage === "undefined") return null;

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "light" ? stored : null;
}

/**
 * Store theme preference
 */
function storeTheme(mode: ThemeMode): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }
}

/**
 * Apply CSS custom properties to target element
 */
function applyCSSProperties(
  target: HTMLElement | Document,
  tokens: Partial<ThemeTokens>
): void {
  const element = target instanceof Document ? target.documentElement : target;

  Object.entries(tokens).forEach(([property, value]) => {
    if (value) element.style.setProperty(property, value);
  });
}

/**
 * Apply theme tokens to target
 */
export function applyTheme(
  tokens: Partial<ThemeTokens>,
  target: HTMLElement | Document = document
): void {
  applyCSSProperties(target, tokens as ThemeTokens);
}

/**
 * Apply theme mode (light/dark) with built-in tokens
 */
export function applyThemeMode(
  mode: ThemeMode,
  config: ThemeConfig = {}
): void {
  const { target = document, persist = true, customTokens = {} } = config;

  // Get base tokens
  const baseTokens = mode === "dark" ? darkTheme : lightTheme;

  // Merge with custom tokens
  const tokens = { ...baseTokens, ...customTokens };

  // Apply theme
  applyTheme(tokens, target);

  // Set theme attribute for CSS selectors
  const element = target instanceof Document ? target.documentElement : target;
  element.setAttribute(THEME_ATTRIBUTE, mode);

  // Persist preference
  if (persist) {
    storeTheme(mode);
  }

  // Dispatch theme change event
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("vanila-theme-change", {
        detail: { mode, tokens },
      })
    );
  }
}

/**
 * Remove theme from target
 */
export function removeTheme(target: HTMLElement | Document = document): void {
  const element = target instanceof Document ? target.documentElement : target;

  // Remove CSS properties
  Object.keys({ ...lightTheme, ...darkTheme }).forEach((property) => {
    element.style.removeProperty(property);
  });

  // Remove theme attribute
  element.removeAttribute(THEME_ATTRIBUTE);
}

/**
 * Get current theme mode
 */
export function getCurrentThemeMode(): ThemeMode {
  if (typeof document === "undefined") return "light";

  const current = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return current === "dark" ? "dark" : "light";
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(config: ThemeConfig = {}): ThemeMode {
  const current = getCurrentThemeMode();
  const newMode = current === "light" ? "dark" : "light";

  applyThemeMode(newMode, config);
  return newMode;
}

/**
 * Initialize theme with preference detection
 * Call this early in your app to prevent FART
 */
export function initializeTheme(config: ThemeConfig = {}): ThemeMode {
  // Priority: stored preference > system preference > light
  const storedTheme = getStoredTheme();
  const systemTheme = getSystemTheme();
  const initialTheme = storedTheme || systemTheme;

  applyThemeMode(initialTheme, { ...config, persist: storedTheme === null });

  // Listen for system theme changes
  if (typeof window !== "undefined" && !storedTheme) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!getStoredTheme()) {
        // Only follow system if no stored preference
        applyThemeMode(e.matches ? "dark" : "light", config);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
  }

  return initialTheme;
}

/**
 * Generate theme initialization script for SSR
 * Inject this script in your HTML head to prevent FART
 */
export function generateThemeScript(
  config: {
    storageKey?: string;
    attribute?: string;
    lightTokens?: ThemeTokens;
    darkTokens?: ThemeTokens;
  } = {}
): string {
  const {
    storageKey = THEME_STORAGE_KEY,
    attribute = THEME_ATTRIBUTE,
    lightTokens = lightTheme,
    darkTokens = darkTheme,
  } = config;

  return `
(function() {
  try {
    var stored = localStorage.getItem('${storageKey}');
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = stored || system;
    
    var tokens = theme === 'dark' ? ${JSON.stringify(
      darkTokens
    )} : ${JSON.stringify(lightTokens)};
    var root = document.documentElement;
    
    // Apply tokens
    Object.entries(tokens).forEach(function(entry) {
      root.style.setProperty(entry[0], entry[1]);
    });
    
    // Set attribute
    root.setAttribute('${attribute}', theme);
  } catch (e) {
    // Fallback to light theme
    console.warn('Theme initialization failed:', e);
  }
})();
  `.trim();
}
