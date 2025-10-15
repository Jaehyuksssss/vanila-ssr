/**
 * Status Dot utility component
 * Provides status indicator with colored dot and label
 * @module utilities/statusDot
 */

export type StatusColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple' | 'orange';

export interface StatusDotOptions {
  label: string;
  color?: StatusColor;
  pulse?: boolean;
  className?: string;
}

/**
 * Renders a status indicator with colored dot
 * @param options - Status dot configuration
 * @returns HTML string for the status indicator
 * 
 * @example
 * ```typescript
 * renderStatusDot({ label: 'Online', color: 'green', pulse: true })
 * // <span class="vanila-status">
 * //   <span class="vanila-status__dot vanila-status__dot--green vanila-status__dot--pulse"></span>
 * //   <span class="vanila-status__label">Online</span>
 * // </span>
 * ```
 */
export function renderStatusDot(options: StatusDotOptions): string {
  const { label, color = 'gray', pulse = false, className = '' } = options;

  const dotClasses = [
    'vanila-status__dot',
    `vanila-status__dot--${color}`,
    pulse && 'vanila-status__dot--pulse',
  ].filter(Boolean).join(' ');

  const statusClasses = ['vanila-status', className].filter(Boolean).join(' ');

  return `<span class="${statusClasses}"><span class="${dotClasses}"></span><span class="vanila-status__label">${label}</span></span>`;
}

/**
 * Shorthand for common status states
 */
export const StatusPresets = {
  online: (label = 'Online') => renderStatusDot({ label, color: 'green', pulse: true }),
  offline: (label = 'Offline') => renderStatusDot({ label, color: 'gray' }),
  busy: (label = 'Busy') => renderStatusDot({ label, color: 'red' }),
  away: (label = 'Away') => renderStatusDot({ label, color: 'yellow' }),
  active: (label = 'Active') => renderStatusDot({ label, color: 'blue' }),
};


