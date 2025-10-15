/**
 * Badge utility component
 * Provides pre-styled badge elements for status, labels, and tags
 * @module utilities/badge
 */

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeOptions {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  outline?: boolean;
  className?: string;
}

/**
 * Renders a styled badge component
 * @param options - Badge configuration options
 * @returns HTML string for the badge
 * 
 * @example
 * ```typescript
 * renderBadge({ label: 'Active', variant: 'success', dot: true })
 * // <span class="vanila-badge vanila-badge--success vanila-badge--md">
 * //   <span class="vanila-badge__dot"></span>
 * //   <span class="vanila-badge__label">Active</span>
 * // </span>
 * ```
 */
export function renderBadge(options: BadgeOptions): string {
  const { 
    label, 
    variant = 'neutral', 
    size = 'md', 
    dot = false, 
    outline = false,
    className = '',
  } = options;

  const classes = [
    'vanila-badge',
    `vanila-badge--${variant}`,
    `vanila-badge--${size}`,
    outline && 'vanila-badge--outline',
    className,
  ].filter(Boolean).join(' ');

  const dotHtml = dot ? '<span class="vanila-badge__dot"></span>' : '';
  
  return `<span class="${classes}">${dotHtml}<span class="vanila-badge__label">${label}</span></span>`;
}

/**
 * Shorthand helper for success badges
 */
export function renderSuccessBadge(label: string, options?: Partial<BadgeOptions>): string {
  return renderBadge({ ...options, label, variant: 'success' });
}

/**
 * Shorthand helper for warning badges
 */
export function renderWarningBadge(label: string, options?: Partial<BadgeOptions>): string {
  return renderBadge({ ...options, label, variant: 'warning' });
}

/**
 * Shorthand helper for danger badges
 */
export function renderDangerBadge(label: string, options?: Partial<BadgeOptions>): string {
  return renderBadge({ ...options, label, variant: 'danger' });
}

/**
 * Shorthand helper for info badges
 */
export function renderInfoBadge(label: string, options?: Partial<BadgeOptions>): string {
  return renderBadge({ ...options, label, variant: 'info' });
}


