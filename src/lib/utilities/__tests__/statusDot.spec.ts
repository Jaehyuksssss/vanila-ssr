import { describe, it, expect } from 'vitest';
import { renderStatusDot, StatusPresets } from '../statusDot';

describe('StatusDot Utility', () => {
  describe('renderStatusDot', () => {
    it('should render basic status dot with default color', () => {
      const html = renderStatusDot({ label: 'Idle' });
      
      expect(html).toContain('vanila-status');
      expect(html).toContain('vanila-status__dot');
      expect(html).toContain('vanila-status__dot--gray');
      expect(html).toContain('Idle');
    });

    it('should render status dot with green color', () => {
      const html = renderStatusDot({ label: 'Online', color: 'green' });
      
      expect(html).toContain('vanila-status__dot--green');
      expect(html).toContain('Online');
    });

    it('should render status dot with yellow color', () => {
      const html = renderStatusDot({ label: 'Warning', color: 'yellow' });
      
      expect(html).toContain('vanila-status__dot--yellow');
      expect(html).toContain('Warning');
    });

    it('should render status dot with red color', () => {
      const html = renderStatusDot({ label: 'Error', color: 'red' });
      
      expect(html).toContain('vanila-status__dot--red');
      expect(html).toContain('Error');
    });

    it('should render status dot with blue color', () => {
      const html = renderStatusDot({ label: 'Active', color: 'blue' });
      
      expect(html).toContain('vanila-status__dot--blue');
      expect(html).toContain('Active');
    });

    it('should render status dot with purple color', () => {
      const html = renderStatusDot({ label: 'Custom', color: 'purple' });
      
      expect(html).toContain('vanila-status__dot--purple');
      expect(html).toContain('Custom');
    });

    it('should render status dot with orange color', () => {
      const html = renderStatusDot({ label: 'Alert', color: 'orange' });
      
      expect(html).toContain('vanila-status__dot--orange');
      expect(html).toContain('Alert');
    });

    it('should render pulsing status dot', () => {
      const html = renderStatusDot({ label: 'Live', color: 'green', pulse: true });
      
      expect(html).toContain('vanila-status__dot--pulse');
      expect(html).toContain('Live');
    });

    it('should render status dot with custom className', () => {
      const html = renderStatusDot({ label: 'Custom', className: 'my-status' });
      
      expect(html).toContain('my-status');
    });

    it('should render status dot with all options', () => {
      const html = renderStatusDot({
        label: 'Broadcasting',
        color: 'red',
        pulse: true,
        className: 'broadcast-status',
      });
      
      expect(html).toContain('vanila-status');
      expect(html).toContain('vanila-status__dot--red');
      expect(html).toContain('vanila-status__dot--pulse');
      expect(html).toContain('broadcast-status');
      expect(html).toContain('Broadcasting');
    });
  });

  describe('StatusPresets', () => {
    it('should render online preset', () => {
      const html = StatusPresets.online();
      
      expect(html).toContain('vanila-status__dot--green');
      expect(html).toContain('vanila-status__dot--pulse');
      expect(html).toContain('Online');
    });

    it('should render online preset with custom label', () => {
      const html = StatusPresets.online('Connected');
      
      expect(html).toContain('Connected');
    });

    it('should render offline preset', () => {
      const html = StatusPresets.offline();
      
      expect(html).toContain('vanila-status__dot--gray');
      expect(html).toContain('Offline');
    });

    it('should render busy preset', () => {
      const html = StatusPresets.busy();
      
      expect(html).toContain('vanila-status__dot--red');
      expect(html).toContain('Busy');
    });

    it('should render away preset', () => {
      const html = StatusPresets.away();
      
      expect(html).toContain('vanila-status__dot--yellow');
      expect(html).toContain('Away');
    });

    it('should render active preset', () => {
      const html = StatusPresets.active();
      
      expect(html).toContain('vanila-status__dot--blue');
      expect(html).toContain('Active');
    });
  });
});


