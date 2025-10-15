import { describe, it, expect } from 'vitest';
import {
  renderBadge,
  renderSuccessBadge,
  renderWarningBadge,
  renderDangerBadge,
  renderInfoBadge,
} from '../badge';

describe('Badge Utility', () => {
  describe('renderBadge', () => {
    it('should render basic badge with default variant and size', () => {
      const html = renderBadge({ label: 'Test' });
      
      expect(html).toContain('vanila-badge');
      expect(html).toContain('vanila-badge--neutral');
      expect(html).toContain('vanila-badge--md');
      expect(html).toContain('Test');
    });

    it('should render badge with success variant', () => {
      const html = renderBadge({ label: 'Active', variant: 'success' });
      
      expect(html).toContain('vanila-badge--success');
      expect(html).toContain('Active');
    });

    it('should render badge with warning variant', () => {
      const html = renderBadge({ label: 'Pending', variant: 'warning' });
      
      expect(html).toContain('vanila-badge--warning');
      expect(html).toContain('Pending');
    });

    it('should render badge with danger variant', () => {
      const html = renderBadge({ label: 'Failed', variant: 'danger' });
      
      expect(html).toContain('vanila-badge--danger');
      expect(html).toContain('Failed');
    });

    it('should render badge with info variant', () => {
      const html = renderBadge({ label: 'Info', variant: 'info' });
      
      expect(html).toContain('vanila-badge--info');
      expect(html).toContain('Info');
    });

    it('should render small badge', () => {
      const html = renderBadge({ label: 'Small', size: 'sm' });
      
      expect(html).toContain('vanila-badge--sm');
    });

    it('should render large badge', () => {
      const html = renderBadge({ label: 'Large', size: 'lg' });
      
      expect(html).toContain('vanila-badge--lg');
    });

    it('should render badge with dot', () => {
      const html = renderBadge({ label: 'Online', dot: true });
      
      expect(html).toContain('vanila-badge__dot');
    });

    it('should render outline badge', () => {
      const html = renderBadge({ label: 'Outline', outline: true });
      
      expect(html).toContain('vanila-badge--outline');
    });

    it('should render badge with custom className', () => {
      const html = renderBadge({ label: 'Custom', className: 'my-badge' });
      
      expect(html).toContain('my-badge');
    });

    it('should render badge with all options', () => {
      const html = renderBadge({
        label: 'Complete',
        variant: 'success',
        size: 'lg',
        dot: true,
        outline: true,
        className: 'custom-class',
      });
      
      expect(html).toContain('vanila-badge');
      expect(html).toContain('vanila-badge--success');
      expect(html).toContain('vanila-badge--lg');
      expect(html).toContain('vanila-badge--outline');
      expect(html).toContain('vanila-badge__dot');
      expect(html).toContain('custom-class');
      expect(html).toContain('Complete');
    });
  });

  describe('Shorthand helpers', () => {
    it('should render success badge with shorthand', () => {
      const html = renderSuccessBadge('Success');
      
      expect(html).toContain('vanila-badge--success');
      expect(html).toContain('Success');
    });

    it('should render warning badge with shorthand', () => {
      const html = renderWarningBadge('Warning');
      
      expect(html).toContain('vanila-badge--warning');
      expect(html).toContain('Warning');
    });

    it('should render danger badge with shorthand', () => {
      const html = renderDangerBadge('Danger');
      
      expect(html).toContain('vanila-badge--danger');
      expect(html).toContain('Danger');
    });

    it('should render info badge with shorthand', () => {
      const html = renderInfoBadge('Info');
      
      expect(html).toContain('vanila-badge--info');
      expect(html).toContain('Info');
    });

    it('should accept options in shorthand helpers', () => {
      const html = renderSuccessBadge('Success', { size: 'lg', dot: true });
      
      expect(html).toContain('vanila-badge--success');
      expect(html).toContain('vanila-badge--lg');
      expect(html).toContain('vanila-badge__dot');
    });
  });
});


