import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  applyTheme,
  applyThemeMode,
  removeTheme,
  getCurrentThemeMode,
  toggleTheme,
  lightTheme,
  darkTheme,
} from '../index';

describe('Theme System', () => {
  let testElement: HTMLDivElement;

  beforeEach(() => {
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    testElement.remove();
    removeTheme();
  });

  describe('applyTheme', () => {
    it('should apply theme tokens to document root', () => {
      applyTheme({ '--vanila-theme-primary': '#ff0000' });
      
      const primaryColor = document.documentElement.style.getPropertyValue('--vanila-theme-primary');
      expect(primaryColor).toBe('#ff0000');
    });

    it('should apply theme tokens to custom element', () => {
      applyTheme({ '--vanila-theme-primary': '#00ff00' }, testElement);
      
      const primaryColor = testElement.style.getPropertyValue('--vanila-theme-primary');
      expect(primaryColor).toBe('#00ff00');
    });

    it('should apply multiple tokens', () => {
      applyTheme({
        '--vanila-theme-primary': '#ff0000',
        '--vanila-theme-success': '#00ff00',
        '--vanila-theme-danger': '#0000ff',
      });
      
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-primary')).toBe('#ff0000');
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-success')).toBe('#00ff00');
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-danger')).toBe('#0000ff');
    });
  });

  describe('applyThemeMode', () => {
    it('should apply light theme', () => {
      applyThemeMode('light');
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-bg')).toBe(lightTheme['--vanila-theme-bg']);
    });

    it('should apply dark theme', () => {
      applyThemeMode('dark');
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-bg')).toBe(darkTheme['--vanila-theme-bg']);
    });

    it('should apply theme with overrides', () => {
      applyThemeMode('light', {
        '--vanila-theme-primary': '#8b5cf6',
      });
      
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-primary')).toBe('#8b5cf6');
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-bg')).toBe(lightTheme['--vanila-theme-bg']);
    });

    it('should apply theme to custom element', () => {
      applyThemeMode('dark', undefined, testElement);
      
      expect(testElement.getAttribute('data-theme')).toBe('dark');
      expect(testElement.style.getPropertyValue('--vanila-theme-bg')).toBe(darkTheme['--vanila-theme-bg']);
    });
  });

  describe('removeTheme', () => {
    it('should remove all theme tokens from document root', () => {
      applyThemeMode('dark');
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-bg')).toBeTruthy();
      
      removeTheme();
      
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-bg')).toBe('');
    });

    it('should remove theme from custom element', () => {
      applyThemeMode('dark', undefined, testElement);
      
      expect(testElement.getAttribute('data-theme')).toBe('dark');
      
      removeTheme(testElement);
      
      expect(testElement.getAttribute('data-theme')).toBeNull();
      expect(testElement.style.getPropertyValue('--vanila-theme-bg')).toBe('');
    });
  });

  describe('getCurrentThemeMode', () => {
    it('should return null when no theme is set', () => {
      expect(getCurrentThemeMode()).toBeNull();
    });

    it('should return light when light theme is set', () => {
      applyThemeMode('light');
      
      expect(getCurrentThemeMode()).toBe('light');
    });

    it('should return dark when dark theme is set', () => {
      applyThemeMode('dark');
      
      expect(getCurrentThemeMode()).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from no theme to dark', () => {
      const newMode = toggleTheme();
      
      expect(newMode).toBe('dark');
      expect(getCurrentThemeMode()).toBe('dark');
    });

    it('should toggle from light to dark', () => {
      applyThemeMode('light');
      
      const newMode = toggleTheme();
      
      expect(newMode).toBe('dark');
      expect(getCurrentThemeMode()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      applyThemeMode('dark');
      
      const newMode = toggleTheme();
      
      expect(newMode).toBe('light');
      expect(getCurrentThemeMode()).toBe('light');
    });

    it('should apply overrides when toggling', () => {
      applyThemeMode('light');
      
      toggleTheme({
        '--vanila-theme-primary': '#custom',
      });
      
      expect(document.documentElement.style.getPropertyValue('--vanila-theme-primary')).toBe('#custom');
    });

    it('should toggle theme on custom element', () => {
      applyThemeMode('light', undefined, testElement);
      
      const newMode = toggleTheme(undefined, testElement);
      
      expect(newMode).toBe('dark');
      expect(testElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Theme tokens', () => {
    it('should have all required light theme tokens', () => {
      expect(lightTheme).toHaveProperty('--vanila-theme-bg');
      expect(lightTheme).toHaveProperty('--vanila-theme-fg');
      expect(lightTheme).toHaveProperty('--vanila-theme-primary');
      expect(lightTheme).toHaveProperty('--vanila-theme-success');
      expect(lightTheme).toHaveProperty('--vanila-theme-warning');
      expect(lightTheme).toHaveProperty('--vanila-theme-danger');
    });

    it('should have all required dark theme tokens', () => {
      expect(darkTheme).toHaveProperty('--vanila-theme-bg');
      expect(darkTheme).toHaveProperty('--vanila-theme-fg');
      expect(darkTheme).toHaveProperty('--vanila-theme-primary');
      expect(darkTheme).toHaveProperty('--vanila-theme-success');
      expect(darkTheme).toHaveProperty('--vanila-theme-warning');
      expect(darkTheme).toHaveProperty('--vanila-theme-danger');
    });

    it('should have different colors for light and dark themes', () => {
      expect(lightTheme['--vanila-theme-bg']).not.toBe(darkTheme['--vanila-theme-bg']);
      expect(lightTheme['--vanila-theme-fg']).not.toBe(darkTheme['--vanila-theme-fg']);
    });
  });
});


