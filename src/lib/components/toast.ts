import { createElementFromMarkup, isBrowser, setComponentAttr } from "../utils/dom";

export type ToastType = "success" | "error" | "info";
export type ToastAriaLive = "polite" | "assertive";
export type ToastPosition = "top" | "bottom";

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  container?: string | HTMLElement;
  dismissible?: boolean;
  ariaLive?: ToastAriaLive;
  position?: ToastPosition;
  onClose?: () => void;
}

export interface ToastMarkupOptions extends Omit<ToastOptions, "container" | "dismissible" | "duration" | "position" | "onClose"> {
  dismissible?: boolean;
  includeDataAttributes?: boolean;
}

export interface ToastElement extends HTMLDivElement {
  close: () => void;
}

export type ToastHydrationOptions = Omit<ToastOptions, "message" | "container" | "duration">;

const COMPONENT_NAME = "toast";
const CONTAINER_COMPONENT_NAME = "toast-container";
const DEFAULT_DURATION = 3000;

let defaultContainer: HTMLElement | null = null;

const resolveContainer = (target: string | HTMLElement | undefined): HTMLElement | null => {
  if (!target) {
    return null;
  }

  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target);
  }

  return target;
};

const ensureContainer = (options: { container?: string | HTMLElement; position: ToastPosition }): HTMLElement => {
  if (!isBrowser) {
    throw new Error("Toast container cannot be resolved outside of the browser.");
  }

  const existing = resolveContainer(options.container);
  if (existing) {
    existing.classList.add("toast-container");
    existing.setAttribute("data-vanila-component", CONTAINER_COMPONENT_NAME);
    existing.setAttribute("data-position", options.position);
    return existing;
  }

  if (!defaultContainer || !defaultContainer.isConnected) {
    defaultContainer = document.createElement("div");
    defaultContainer.className = "toast-container";
    defaultContainer.setAttribute("data-vanila-component", CONTAINER_COMPONENT_NAME);
    document.body.appendChild(defaultContainer);
  }

  defaultContainer.setAttribute("data-position", options.position);
  return defaultContainer;
};

const renderCloseButton = (dismissible?: boolean): string => {
  if (!dismissible) {
    return "";
  }

  return '<button type="button" class="toast-dismiss" aria-label="닫기">×</button>';
};

export const renderToastMarkup = ({
  message,
  type = "info",
  dismissible,
  ariaLive = "polite",
  includeDataAttributes = true,
}: ToastMarkupOptions): string => {
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";

  return `
  <div class="toast ${type}"${dataAttr} role="status" aria-live="${ariaLive}">
    <span class="toast-message">${message}</span>
    ${renderCloseButton(dismissible)}
  </div>
  `;
};

const activeToasts = new Set<ToastElement>();

const attachBehavior = (
  toast: HTMLDivElement,
  options: Pick<ToastOptions, "onClose">,
  clearTimer: () => void,
): { close: () => void } => {
  setComponentAttr(toast, COMPONENT_NAME);

  const dismissButton = toast.querySelector<HTMLButtonElement>(".toast-dismiss");
  let isClosed = false;

  const close = () => {
    if (isClosed) {
      return;
    }
    isClosed = true;

    clearTimer();
    dismissButton?.removeEventListener("click", close);
    toast.classList.add("toast-closing");

    const remove = () => {
      activeToasts.delete(toast as ToastElement);
      toast.remove();
      options.onClose?.();
    };

    toast.addEventListener("transitionend", remove, { once: true });
    // Fallback in case transitionend does not fire
    setTimeout(remove, 250);
  };

  if (dismissButton) {
    dismissButton.addEventListener("click", close);
  }

  return { close };
};

const defineCloseProperty = (toast: HTMLDivElement, close: () => void) => {
  Object.defineProperty(toast, "close", {
    value: close,
    configurable: true,
    enumerable: false,
    writable: false,
  });
};

export const createToast = (options: ToastOptions): ToastElement => {
  if (!isBrowser) {
    throw new Error("createToast requires a browser environment.");
  }

  const markup = renderToastMarkup(options);
  const toast = createElementFromMarkup<HTMLDivElement>(markup) as ToastElement;

  let timerId: number | null = null;
  const clearTimer = () => {
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
  };

  const { close } = attachBehavior(toast, options, clearTimer);

  defineCloseProperty(toast, close);

  const duration = options.duration ?? DEFAULT_DURATION;
  if (duration > 0) {
    timerId = window.setTimeout(() => {
      toast.close();
    }, duration);
  }

  return toast;
};

export const showToast = (options: ToastOptions): ToastElement => {
  if (!isBrowser) {
    throw new Error("showToast can only be used in a browser environment.");
  }

  const position = options.position ?? "bottom";
  const container = ensureContainer({ container: options.container, position });
  const toast = createToast(options);

  activeToasts.add(toast);
  container.appendChild(toast);

  // Force reflow to enable transition
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  toast.offsetHeight;
  toast.classList.add("toast-entered");

  return toast;
};

export const hydrateToast = (toast: HTMLDivElement, options: ToastHydrationOptions = {}): ToastElement => {
  const { close } = attachBehavior(toast, options, () => {});
  defineCloseProperty(toast, close);

  return toast as ToastElement;
};
