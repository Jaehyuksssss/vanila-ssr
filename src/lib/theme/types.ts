/**
 * Theme system types
 * @module theme/types
 */

export type ThemeMode = "light" | "dark";

export interface ThemeTokens {
  // Background colors
  "--vanila-theme-bg": string;
  "--vanila-theme-bg-secondary": string;
  "--vanila-theme-bg-tertiary": string;

  // Foreground colors
  "--vanila-theme-fg": string;
  "--vanila-theme-fg-secondary": string;
  "--vanila-theme-fg-muted": string;

  // Border colors
  "--vanila-theme-border": string;
  "--vanila-theme-border-secondary": string;

  // Semantic colors
  "--vanila-theme-primary": string;
  "--vanila-theme-primary-hover": string;
  "--vanila-theme-success": string;
  "--vanila-theme-success-hover": string;
  "--vanila-theme-warning": string;
  "--vanila-theme-warning-hover": string;
  "--vanila-theme-danger": string;
  "--vanila-theme-danger-hover": string;
  "--vanila-theme-info": string;
  "--vanila-theme-info-hover": string;
}

export interface ThemeConfig {
  target?: HTMLElement | Document;
  persist?: boolean;
  customTokens?: Partial<ThemeTokens>;
}
