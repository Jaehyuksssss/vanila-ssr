/**
 * Accessibility utilities
 * Standardized a11y patterns for all interactive components
 */

export interface FocusTrapOptions {
  initialFocus?: HTMLElement | string;
  returnFocusOnDeactivate?: boolean;
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  onDeactivate?: () => void;
}

/**
 * Focus trap for modals, dialogs, and overlays
 * Ensures keyboard navigation stays within the component
 */
export class FocusTrap {
  private element: HTMLElement;
  private options: FocusTrapOptions;
  private previouslyFocused: HTMLElement | null = null;
  private isActive = false;

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.options.escapeDeactivates) {
      e.preventDefault();
      this.deactivate();
      this.options.onDeactivate?.();
    }

    if (e.key === "Tab") {
      this.handleTabKey(e);
    }
  };

  private handleClickOutside = (e: MouseEvent) => {
    if (
      this.options.clickOutsideDeactivates &&
      !this.element.contains(e.target as Node)
    ) {
      this.deactivate();
      this.options.onDeactivate?.();
    }
  };

  constructor(element: HTMLElement, options: FocusTrapOptions = {}) {
    this.element = element;
    this.options = {
      returnFocusOnDeactivate: true,
      escapeDeactivates: true,
      clickOutsideDeactivates: false,
      ...options,
    };
  }

  activate(): void {
    if (this.isActive) return;

    this.previouslyFocused = document.activeElement as HTMLElement;
    this.isActive = true;

    // Add event listeners
    document.addEventListener("keydown", this.handleKeyDown);
    if (this.options.clickOutsideDeactivates) {
      document.addEventListener("mousedown", this.handleClickOutside);
    }

    // Set initial focus
    this.setInitialFocus();
  }

  deactivate(): void {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove event listeners
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("mousedown", this.handleClickOutside);

    // Return focus
    if (this.options.returnFocusOnDeactivate && this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
  }

  private setInitialFocus(): void {
    let initialElement: HTMLElement | null = null;

    if (typeof this.options.initialFocus === "string") {
      initialElement = this.element.querySelector(this.options.initialFocus);
    } else if (this.options.initialFocus) {
      initialElement = this.options.initialFocus;
    }

    if (!initialElement) {
      // Find first focusable element
      initialElement = this.getFocusableElements()[0] || this.element;
    }

    initialElement?.focus();
  }

  private handleTabKey(e: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();

    if (focusableElements.length === 0) {
      e.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    return Array.from(
      this.element.querySelectorAll<HTMLElement>(selector)
    ).filter((el) => el.offsetParent !== null); // Visible only
  }
}

/**
 * Creates a focus trap for the given element
 * Shorthand for new FocusTrap(element, options).activate()
 */
export function createFocusTrap(
  element: HTMLElement,
  options?: FocusTrapOptions
): FocusTrap {
  return new FocusTrap(element, options);
}

/**
 * Roving tabindex for lists, menus, and toolbars
 * Only one item is tabbable at a time, arrow keys move focus
 */
export class RovingTabindex {
  private items: HTMLElement[];
  private currentIndex = 0;
  private orientation: "horizontal" | "vertical" | "both";

  constructor(
    container: HTMLElement,
    itemSelector: string,
    orientation: "horizontal" | "vertical" | "both" = "vertical"
  ) {
    this.orientation = orientation;
    this.items = Array.from(
      container.querySelectorAll<HTMLElement>(itemSelector)
    );

    this.initialize();
  }

  private initialize(): void {
    // Set initial tabindex
    this.items.forEach((item, index) => {
      item.setAttribute("tabindex", index === 0 ? "0" : "-1");
      item.addEventListener("keydown", this.handleKeyDown);
      item.addEventListener("focus", () => this.setCurrentIndex(index));
    });
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const { key } = e;
    let handled = false;

    if (this.orientation === "vertical" || this.orientation === "both") {
      if (key === "ArrowDown") {
        this.moveFocus(1);
        handled = true;
      } else if (key === "ArrowUp") {
        this.moveFocus(-1);
        handled = true;
      }
    }

    if (this.orientation === "horizontal" || this.orientation === "both") {
      if (key === "ArrowRight") {
        this.moveFocus(1);
        handled = true;
      } else if (key === "ArrowLeft") {
        this.moveFocus(-1);
        handled = true;
      }
    }

    if (key === "Home") {
      this.setCurrentIndex(0);
      handled = true;
    } else if (key === "End") {
      this.setCurrentIndex(this.items.length - 1);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      this.items[this.currentIndex].focus();
    }
  };

  private moveFocus(delta: number): void {
    const newIndex =
      (this.currentIndex + delta + this.items.length) % this.items.length;
    this.setCurrentIndex(newIndex);
  }

  private setCurrentIndex(index: number): void {
    this.items[this.currentIndex]?.setAttribute("tabindex", "-1");
    this.currentIndex = index;
    this.items[this.currentIndex]?.setAttribute("tabindex", "0");
  }

  destroy(): void {
    this.items.forEach((item) => {
      item.removeEventListener("keydown", this.handleKeyDown);
    });
  }
}

/**
 * Announces messages to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  const announcer = getOrCreateAnnouncer(priority);
  announcer.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    announcer.textContent = "";
  }, 1000);
}

function getOrCreateAnnouncer(priority: "polite" | "assertive"): HTMLElement {
  const id = `vanila-announcer-${priority}`;
  let announcer = document.getElementById(id);

  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = id;
    announcer.setAttribute("role", "status");
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(announcer);
  }

  return announcer;
}

/**
 * ARIA attribute helpers
 */
export const aria = {
  /**
   * Sets multiple ARIA attributes at once
   */
  set(
    element: HTMLElement,
    attributes: Record<string, string | boolean>
  ): void {
    Object.entries(attributes).forEach(([key, value]) => {
      const attrName = key.startsWith("aria-") ? key : `aria-${key}`;
      element.setAttribute(attrName, String(value));
    });
  },

  /**
   * Toggles aria-expanded
   */
  toggleExpanded(element: HTMLElement, expanded?: boolean): void {
    const current = element.getAttribute("aria-expanded") === "true";
    const newValue = expanded !== undefined ? expanded : !current;
    element.setAttribute("aria-expanded", String(newValue));
  },

  /**
   * Sets up ARIA dialog pattern
   */
  dialog(
    element: HTMLElement,
    options: { labelledBy?: string; describedBy?: string }
  ): void {
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-modal", "true");

    if (options.labelledBy) {
      element.setAttribute("aria-labelledby", options.labelledBy);
    }
    if (options.describedBy) {
      element.setAttribute("aria-describedby", options.describedBy);
    }
  },
};
