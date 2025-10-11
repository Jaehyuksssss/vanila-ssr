export const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [contenteditable], [tabindex]:not([tabindex="-1"])';

export const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

let idCounter = 0;

export const createId = (prefix: string): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

export const createElementFromMarkup = <T extends HTMLElement>(markup: string): T => {
  if (!isBrowser) {
    throw new Error("createElementFromMarkup can only be used in the browser.");
  }

  const template = document.createElement("template");
  template.innerHTML = markup.trim();

  const element = template.content.firstElementChild;
  if (!element) {
    throw new Error("Markup must contain a single root element.");
  }

  return element as T;
};

export const setComponentAttr = (element: HTMLElement, name: string): void => {
  element.setAttribute("data-vanila-component", name);
};

export const focusFirstDescendant = (root: HTMLElement): void => {
  const candidates = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const target = candidates.length > 0 ? candidates[0] : root;
  target.focus({ preventScroll: true });
};

export const preserveActiveElement = (): (() => void) => {
  if (!isBrowser) {
    return () => {};
  }

  const active = (document.activeElement as HTMLElement | null) ?? null;
  return () => {
    active?.focus?.({ preventScroll: true });
  };
};

export interface FocusTrapOptions {
  enableTrap?: boolean;
  onEscape?: () => void;
}

export const setupFocusTrap = (root: HTMLElement, options: FocusTrapOptions = {}): (() => void) => {
  const { enableTrap = true, onEscape } = options;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onEscape?.();
      return;
    }

    if (!enableTrap || event.key !== "Tab") {
      return;
    }

    const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => element.offsetParent !== null || element === document.activeElement
    );

    if (focusable.length === 0) {
      event.preventDefault();
      root.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || !active) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      }
      return;
    }

    if (active === last || !active) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  root.addEventListener("keydown", handleKeyDown);

  return () => {
    root.removeEventListener("keydown", handleKeyDown);
  };
};
