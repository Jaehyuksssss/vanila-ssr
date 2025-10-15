/**
 * Theme system
 * Provides lightweight theming with light/dark mode support and FART prevention
 * @module theme
 */

export { lightTheme, darkTheme } from './tokens';
export {
  applyTheme,
  applyThemeMode,
  removeTheme,
  getCurrentThemeMode,
  toggleTheme,
  initializeTheme,
  generateThemeScript,
} from './applyTheme';
export type { ThemeMode, ThemeTokens, ThemeConfig } from './types';


