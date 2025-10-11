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

export type MountTarget = string | HTMLElement;

export const isElement = (value: unknown): value is HTMLElement => {
  if (!isBrowser || typeof HTMLElement === "undefined") {
    return false;
  }

  return value instanceof HTMLElement;
};

export const resolveTargetElement = (target: MountTarget | null | undefined): HTMLElement | null => {
  if (!target) {
    return null;
  }

  if (typeof target === "string") {
    return document.getElementById(target) ?? document.querySelector<HTMLElement>(target);
  }

  return target;
};

export const describeTarget = (target: MountTarget | null | undefined): string => {
  if (!target) {
    return "undefined";
  }

  if (typeof target === "string") {
    return target;
  }

  if ("id" in target && target.id) {
    return `#${target.id}`;
  }

  if ("className" in target && typeof target.className === "string" && target.className.trim()) {
    return `.${target.className.trim().split(/\s+/)[0]}`;
  }

  return target.tagName ? `<${target.tagName.toLowerCase()}>` : "Supplied HTMLElement";
};

export interface EnsureHostElementOptions {
  componentName: string;
  target?: MountTarget | null;
  fallback?: () => HTMLElement | null;
}

export const ensureHostElement = ({ componentName, target, fallback }: EnsureHostElementOptions): HTMLElement => {
  const resolved = resolveTargetElement(target ?? null);
  if (resolved) {
    return resolved;
  }

  if (target != null) {
    const targetDescription = describeTarget(target);
    throw new Error(
      `[vanila-components] Unable to mount ${componentName}. Ensure that "${targetDescription}" exists in the DOM or pass a resolved HTMLElement.`,
    );
  }

  const fallbackElement = fallback?.() ?? null;
  if (fallbackElement) {
    return fallbackElement;
  }

  throw new Error(
    `[vanila-components] Unable to mount ${componentName}. The document.body is not available yet. Call this after DOMContentLoaded or pass a mounting target.`,
  );
};

const toClassList = (value?: string | string[]): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return value
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const joinClassNames = (...values: Array<string | string[] | undefined>): string => {
  const seen = new Set<string>();
  const classes: string[] = [];

  values.forEach((value) => {
    toClassList(value).forEach((item) => {
      if (!seen.has(item)) {
        seen.add(item);
        classes.push(item);
      }
    });
  });

  return classes.join(" ").trim();
};

export interface ApplyRootAttributesOptions {
  id?: string;
  className?: string | string[];
}

export const applyRootAttributes = (element: HTMLElement, { id, className }: ApplyRootAttributesOptions = {}): void => {
  if (id) {
    element.id = id;
  }

  if (className) {
    const classes = joinClassNames(element.className, className);
    element.className = classes;
  }
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
