/**
 * Default theme tokens
 * @module theme/tokens
 */

import type { ThemeTokens } from './types';

/**
 * Light theme tokens (default)
 */
export const lightTheme: ThemeTokens = {
  // Backgrounds
  '--vanila-theme-bg': '#ffffff',
  '--vanila-theme-bg-secondary': '#f8fafc',
  '--vanila-theme-bg-tertiary': '#f1f5f9',
  
  // Foregrounds
  '--vanila-theme-fg': '#0f172a',
  '--vanila-theme-fg-secondary': '#475569',
  '--vanila-theme-fg-muted': '#64748b',
  
  // Borders
  '--vanila-theme-border': '#e5e7eb',
  '--vanila-theme-border-secondary': '#d1d5db',
  
  // Primary (Blue)
  '--vanila-theme-primary': '#2563eb',
  '--vanila-theme-primary-hover': '#1d4ed8',
  
  // Success (Green)
  '--vanila-theme-success': '#16a34a',
  '--vanila-theme-success-hover': '#15803d',
  
  // Warning (Orange)
  '--vanila-theme-warning': '#ea580c',
  '--vanila-theme-warning-hover': '#c2410c',
  
  // Danger (Red)
  '--vanila-theme-danger': '#dc2626',
  '--vanila-theme-danger-hover': '#b91c1c',
  
  // Info (Light Blue)
  '--vanila-theme-info': '#0284c7',
  '--vanila-theme-info-hover': '#0369a1',
};

/**
 * Dark theme tokens
 */
export const darkTheme: ThemeTokens = {
  // Backgrounds
  '--vanila-theme-bg': '#0f172a',
  '--vanila-theme-bg-secondary': '#1e293b',
  '--vanila-theme-bg-tertiary': '#334155',
  
  // Foregrounds
  '--vanila-theme-fg': '#f8fafc',
  '--vanila-theme-fg-secondary': '#cbd5e1',
  '--vanila-theme-fg-muted': '#94a3b8',
  
  // Borders
  '--vanila-theme-border': '#334155',
  '--vanila-theme-border-secondary': '#475569',
  
  // Primary (Lighter Blue)
  '--vanila-theme-primary': '#3b82f6',
  '--vanila-theme-primary-hover': '#60a5fa',
  
  // Success (Lighter Green)
  '--vanila-theme-success': '#22c55e',
  '--vanila-theme-success-hover': '#4ade80',
  
  // Warning (Lighter Orange)
  '--vanila-theme-warning': '#f97316',
  '--vanila-theme-warning-hover': '#fb923c',
  
  // Danger (Lighter Red)
  '--vanila-theme-danger': '#ef4444',
  '--vanila-theme-danger-hover': '#f87171',
  
  // Info (Lighter Blue)
  '--vanila-theme-info': '#06b6d4',
  '--vanila-theme-info-hover': '#22d3ee',
};


