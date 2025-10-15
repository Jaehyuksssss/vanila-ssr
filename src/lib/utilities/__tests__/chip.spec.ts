import { describe, it, expect, vi } from 'vitest';
import { renderChip, renderChips, createChip } from '../chip';

describe('Chip Utility', () => {
  describe('renderChip', () => {
    it('should render basic chip', () => {
      const html = renderChip({ label: 'React' });
      
      expect(html).toContain('vanila-chip');
      expect(html).toContain('React');
    });

    it('should render chip with value attribute', () => {
      const html = renderChip({ label: 'TypeScript', value: 'ts' });
      
      expect(html).toContain('data-value="ts"');
      expect(html).toContain('TypeScript');
    });

    it('should render removable chip', () => {
      const html = renderChip({ label: 'Removable', removable: true });
      
      expect(html).toContain('vanila-chip__remove');
      expect(html).toContain('Removable');
    });

    it('should render chip with custom className', () => {
      const html = renderChip({ label: 'Custom', className: 'my-chip' });
      
      expect(html).toContain('my-chip');
    });
  });

  describe('renderChips', () => {
    it('should render multiple chips', () => {
      const labels = ['React', 'Vue', 'Angular'];
      const html = renderChips(labels);
      
      expect(html).toContain('React');
      expect(html).toContain('Vue');
      expect(html).toContain('Angular');
    });

    it('should apply common options to all chips', () => {
      const labels = ['Tag1', 'Tag2'];
      const html = renderChips(labels, { removable: true });
      
      expect(html.match(/vanila-chip__remove/g)).toHaveLength(2);
    });

    it('should return empty string for empty array', () => {
      const html = renderChips([]);
      
      expect(html).toBe('');
    });
  });

  describe('createChip', () => {
    it('should create chip element', () => {
      const chip = createChip({ label: 'Test' });
      
      expect(chip.tagName).toBe('SPAN');
      expect(chip.classList.contains('vanila-chip')).toBe(true);
      expect(chip.textContent).toContain('Test');
    });

    it('should have getValue method', () => {
      const chip = createChip({ label: 'Test', value: 'test-value' });
      
      expect(chip.getValue).toBeDefined();
      expect(chip.getValue()).toBe('test-value');
    });

    it('should have remove method', () => {
      const chip = createChip({ label: 'Test' });
      
      expect(chip.remove).toBeDefined();
      expect(typeof chip.remove).toBe('function');
    });

    it('should call onRemove callback when remove button clicked', () => {
      const onRemove = vi.fn();
      const chip = createChip({ label: 'Test', value: 'test', removable: true, onRemove });
      
      const removeButton = chip.querySelector('.vanila-chip__remove');
      expect(removeButton).not.toBeNull();
      
      removeButton?.dispatchEvent(new Event('click'));
      
      expect(onRemove).toHaveBeenCalledWith('test');
    });

    it('should remove chip from DOM when remove method called', () => {
      const container = document.createElement('div');
      const chip = createChip({ label: 'Test' });
      container.appendChild(chip);
      
      expect(container.children.length).toBe(1);
      
      chip.remove();
      
      expect(container.children.length).toBe(0);
    });

    it('should stop event propagation on remove button click', () => {
      const onRemove = vi.fn();
      const chip = createChip({ label: 'Test', removable: true, onRemove });
      
      const clickSpy = vi.fn();
      chip.addEventListener('click', clickSpy);
      
      const removeButton = chip.querySelector('.vanila-chip__remove') as HTMLElement;
      const event = new Event('click', { bubbles: true });
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
      
      removeButton.dispatchEvent(event);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });
});


