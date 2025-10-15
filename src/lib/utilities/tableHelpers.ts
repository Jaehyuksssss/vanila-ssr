/**
 * Table Helper utilities
 * Pre-built column renderers for common DataTable patterns
 * @module utilities/tableHelpers
 */

import { renderBadge, BadgeVariant } from './badge';
import { renderStatusDot, StatusColor } from './statusDot';

/**
 * Table column helper utilities
 * Simplifies common DataTable column rendering patterns
 */
export const TableHelpers = {
  /**
   * Status badge column renderer
   * Maps status values to badge variants
   * 
   * @example
   * ```typescript
   * {
   *   key: 'status',
   *   header: 'Status',
   *   ...TableHelpers.statusColumn({
   *     'active': 'success',
   *     'pending': 'warning',
   *     'failed': 'danger',
   *   })
   * }
   * ```
   */
  statusColumn: (statusMap: Record<string, BadgeVariant>) => ({
    render: (value: string) => {
      const variant = statusMap[value] ?? 'neutral';
      return renderBadge({ label: value, variant });
    },
  }),

  /**
   * Status badge with dot column renderer
   */
  statusBadgeWithDot: (statusMap: Record<string, BadgeVariant>) => ({
    render: (value: string) => {
      const variant = statusMap[value] ?? 'neutral';
      return renderBadge({ label: value, variant, dot: true });
    },
  }),

  /**
   * Progress bar column renderer
   * Displays a visual progress bar with percentage
   * 
   * @example
   * ```typescript
   * {
   *   key: 'progress',
   *   header: 'Progress',
   *   ...TableHelpers.progressColumn()
   * }
   * ```
   */
  progressColumn: () => ({
    render: (value: number) => {
      const percentage = Math.min(100, Math.max(0, value));
      return `
        <div class="vanila-progress">
          <div class="vanila-progress__bar" style="width: ${percentage}%"></div>
          <span class="vanila-progress__text">${percentage}%</span>
        </div>
      `;
    },
  }),

  /**
   * Date formatting column renderer
   * 
   * @example
   * ```typescript
   * {
   *   key: 'createdAt',
   *   header: 'Created',
   *   ...TableHelpers.dateColumn('short')
   * }
   * ```
   */
  dateColumn: (format: 'short' | 'long' | 'relative' = 'short') => ({
    render: (value: string | Date) => {
      const date = typeof value === 'string' ? new Date(value) : value;
      
      if (format === 'relative') {
        return formatRelativeTime(date);
      }
      
      return format === 'short' 
        ? date.toLocaleDateString()
        : date.toLocaleString();
    },
  }),

  /**
   * Health indicator column renderer
   * 
   * @example
   * ```typescript
   * {
   *   key: 'health',
   *   header: 'Health',
   *   ...TableHelpers.healthColumn()
   * }
   * ```
   */
  healthColumn: () => ({
    render: (value: 'healthy' | 'warning' | 'critical' | string) => {
      const colorMap: Record<string, StatusColor> = {
        healthy: 'green',
        warning: 'yellow',
        critical: 'red',
        unknown: 'gray',
      };
      const color = colorMap[value] ?? 'gray';
      return renderStatusDot({ label: value, color });
    },
  }),

  /**
   * Boolean indicator column renderer
   * Shows check/cross for true/false values
   * 
   * @example
   * ```typescript
   * {
   *   key: 'isActive',
   *   header: 'Active',
   *   ...TableHelpers.booleanColumn()
   * }
   * ```
   */
  booleanColumn: (trueLabel = '✓', falseLabel = '✗') => ({
    render: (value: boolean) => {
      const color: StatusColor = value ? 'green' : 'gray';
      const label = value ? trueLabel : falseLabel;
      return `<span class="vanila-status__dot vanila-status__dot--${color}" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px;"></span>${label}`;
    },
  }),

  /**
   * Number formatting column renderer
   * 
   * @example
   * ```typescript
   * {
   *   key: 'revenue',
   *   header: 'Revenue',
   *   ...TableHelpers.numberColumn({ prefix: '$', decimals: 2 })
   * }
   * ```
   */
  numberColumn: (options?: { 
    prefix?: string; 
    suffix?: string; 
    decimals?: number;
    locale?: string;
  }) => ({
    render: (value: number) => {
      const { prefix = '', suffix = '', decimals = 0, locale = 'en-US' } = options ?? {};
      const formatted = value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${prefix}${formatted}${suffix}`;
    },
  }),

  /**
   * Tag list column renderer
   * Displays multiple tags as badges
   * 
   * @example
   * ```typescript
   * {
   *   key: 'tags',
   *   header: 'Tags',
   *   ...TableHelpers.tagsColumn()
   * }
   * ```
   */
  tagsColumn: (variant: BadgeVariant = 'neutral') => ({
    render: (value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return '—';
      return value
        .map((tag) => renderBadge({ label: tag, variant, size: 'sm' }))
        .join(' ');
    },
  }),

  /**
   * Truncate text column renderer
   * Shows truncated text with ellipsis
   * 
   * @example
   * ```typescript
   * {
   *   key: 'description',
   *   header: 'Description',
   *   ...TableHelpers.truncateColumn(50)
   * }
   * ```
   */
  truncateColumn: (maxLength = 50) => ({
    render: (value: string) => {
      if (!value || value.length <= maxLength) return value;
      return `<span title="${value}">${value.substring(0, maxLength)}...</span>`;
    },
  }),
};

/**
 * Helper function to format relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}


