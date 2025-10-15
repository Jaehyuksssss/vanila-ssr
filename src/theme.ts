/**
 * Theme entry point for per-component imports
 * Optimized for tree-shaking
 */

export {
  lightTheme,
  darkTheme,
  applyTheme,
  applyThemeMode,
  removeTheme,
  getCurrentThemeMode,
  toggleTheme,
  initializeTheme,
  generateThemeScript,
} from "./lib/theme";

export type { ThemeMode, ThemeTokens, ThemeConfig } from "./lib/theme";
