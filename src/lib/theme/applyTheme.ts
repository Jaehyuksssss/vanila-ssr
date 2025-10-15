/**
 * Theme application utilities
 * @module theme/applyTheme
 */

import type { ThemeConfig, ThemeMode } from './types';
import { lightTheme, darkTheme } from './tokens';

/**
 * Applies theme tokens to the document root or a specific element
 * @param tokens - CSS custom properties to apply
 * @param target - Target element (defaults to document.documentElement)
 * 
 * @example
 * ```typescript
 * import { applyTheme, darkTheme } from 'vanila-components/theme';
 * 
 * applyTheme(darkTheme);
 * ```
 */
export function applyTheme(
  tokens: ThemeConfig,
  target?: HTMLElement
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = target ?? document.documentElement;
  
  Object.entries(tokens).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(key, value);
    }
  });
}

/**
 * Applies a theme mode (light or dark) with optional overrides
 * @param mode - Theme mode ('light' or 'dark')
 * @param overrides - Custom token overrides
 * @param target - Target element
 * 
 * @example
 * ```typescript
 * import { applyThemeMode } from 'vanila-components/theme';
 * 
 * // Apply dark mode
 * applyThemeMode('dark');
 * 
 * // Apply dark mode with custom primary color
 * applyThemeMode('dark', {
 *   '--vanila-theme-primary': '#8b5cf6',
 * });
 * ```
 */
export function applyThemeMode(
  mode: ThemeMode,
  overrides?: ThemeConfig,
  target?: HTMLElement
): void {
  const baseTheme = mode === 'dark' ? darkTheme : lightTheme;
  const finalTheme = { ...baseTheme, ...overrides };
  
  applyTheme(finalTheme, target);
  
  // Also set data attribute for potential CSS selectors
  const root = target ?? document.documentElement;
  root.setAttribute('data-theme', mode);
}

/**
 * Removes all theme tokens from the target element
 * @param target - Target element (defaults to document.documentElement)
 */
export function removeTheme(target?: HTMLElement): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = target ?? document.documentElement;
  const themeKeys = Object.keys({ ...lightTheme });
  
  themeKeys.forEach((key) => {
    root.style.removeProperty(key);
  });
  
  root.removeAttribute('data-theme');
}

/**
 * Gets the current theme mode from the document
 * @returns Current theme mode or null if not set
 */
export function getCurrentThemeMode(): ThemeMode | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const mode = document.documentElement.getAttribute('data-theme');
  return mode === 'light' || mode === 'dark' ? mode : null;
}

/**
 * Toggles between light and dark theme
 * @param overrides - Custom token overrides to apply
 * @param target - Target element
 * 
 * @example
 * ```typescript
 * import { toggleTheme } from 'vanila-components/theme';
 * 
 * document.getElementById('theme-toggle')?.addEventListener('click', () => {
 *   toggleTheme();
 * });
 * ```
 */
export function toggleTheme(
  overrides?: ThemeConfig,
  target?: HTMLElement
): ThemeMode {
  const currentMode = getCurrentThemeMode();
  const newMode: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
  
  applyThemeMode(newMode, overrides, target);
  
  return newMode;
}


