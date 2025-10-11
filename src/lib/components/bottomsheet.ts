import {
  applyRootAttributes,
  createElementFromMarkup,
  createId,
  ensureHostElement,
  focusFirstDescendant,
  isBrowser,
  joinClassNames,
  preserveActiveElement,
  setComponentAttr,
  setupFocusTrap,
} from "../utils/dom";

const COMPONENT_NAME = "bottom-sheet";
const DEFAULT_PRIMARY_TEXT = "확인";

interface BottomSheetContentConfig {
  title: string;
  content: string | HTMLElement;
  primaryButtonText?: string;
}

export interface BottomSheetBehaviorOptions {
  onPrimaryAction?: () => void;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export interface BottomSheetPresentationOptions {
  id?: string;
  className?: string | string[];
  target?: string | HTMLElement;
}

export type BottomSheetOptions = BottomSheetContentConfig &
  BottomSheetBehaviorOptions &
  BottomSheetPresentationOptions;

export interface BottomSheetMarkupOptions extends Omit<BottomSheetContentConfig, "content"> {
  content: string;
  idPrefix?: string;
  includeDataAttributes?: boolean;
  id?: string;
  className?: string | string[];
}

export type BottomSheetHydrationOptions = BottomSheetBehaviorOptions;

export interface BottomSheetElement extends HTMLDivElement {
  close: () => void;
}

const renderContent = (content: string): string => `<div class="bottom-sheet-content" data-role="content">${content}</div>`;

export const renderBottomSheetMarkup = ({
  title,
  content,
  primaryButtonText,
  idPrefix,
  includeDataAttributes = true,
  id,
  className,
}: BottomSheetMarkupOptions): string => {
  const headingId = idPrefix ? `${idPrefix}-title` : createId("vanila-bottom-sheet-title");
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";
  const idAttr = id ? ` id="${id}"` : "";
  const wrapperClass = joinClassNames("bottom-sheet-wrapper", "dimmed", className);

  return `
  <div class="${wrapperClass}"${idAttr}${dataAttr} tabindex="-1">
    <div class="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="${headingId}">
      <div class="bottom-sheet-header">
        <h2 id="${headingId}">${title}</h2>
        <button type="button" class="btn-close" data-vanila-sheet-close aria-label="닫기">×</button>
      </div>
      ${renderContent(content)}
      <div class="bottom-sheet-actions">
        <button type="button" class="btn-primary" data-vanila-sheet-primary>
          ${primaryButtonText ?? DEFAULT_PRIMARY_TEXT}
        </button>
      </div>
    </div>
  </div>
  `;
};

type Teardown = () => void;

const populateContent = (wrapper: HTMLDivElement, content: string | HTMLElement): void => {
  const container = wrapper.querySelector<HTMLDivElement>('[data-role="content"]');
  if (!container) {
    return;
  }

  if (typeof content === "string") {
    container.innerHTML = content;
  } else {
    container.innerHTML = "";
    container.appendChild(content);
  }
};

const attachBehavior = (
  wrapper: HTMLDivElement,
  options: BottomSheetBehaviorOptions,
): { close: () => void; teardown: Teardown } => {
  setComponentAttr(wrapper, COMPONENT_NAME);

  const restoreFocus = preserveActiveElement();
  let isClosed = false;

  const primaryButton = wrapper.querySelector<HTMLButtonElement>("[data-vanila-sheet-primary]");
  const closeButton = wrapper.querySelector<HTMLButtonElement>("[data-vanila-sheet-close]");

  const close = () => {
    if (isClosed) {
      return;
    }
    isClosed = true;

    wrapper.classList.add("closing");

    setTimeout(() => {
      teardown();

      if (wrapper.isConnected) {
        wrapper.remove();
      }

      options.onClose?.();
      restoreFocus();
    }, 300);
  };

  const handlePrimary = () => {
    options.onPrimaryAction?.();
    close();
  };

  primaryButton?.addEventListener("click", handlePrimary);
  closeButton?.addEventListener("click", close);

  const handleBackdrop = (event: MouseEvent) => {
    if (event.target === wrapper && options.closeOnBackdrop !== false) {
      close();
    }
  };

  wrapper.addEventListener("mousedown", handleBackdrop);

  const removeFocusTrap = setupFocusTrap(wrapper, {
    enableTrap: true,
    onEscape: () => {
      if (options.closeOnEscape !== false) {
        close();
      }
    },
  });

  queueMicrotask(() => {
    if (wrapper.isConnected) {
      focusFirstDescendant(wrapper);
    }
  });

  const teardown = () => {
    primaryButton?.removeEventListener("click", handlePrimary);
    closeButton?.removeEventListener("click", close);
    wrapper.removeEventListener("mousedown", handleBackdrop);
    removeFocusTrap();
  };

  return { close, teardown };
};

const defineCloseProperty = (element: HTMLDivElement, close: () => void) => {
  Object.defineProperty(element, "close", {
    value: close,
    configurable: true,
    enumerable: false,
    writable: false,
  });
};

export const createBottomSheet = (options: BottomSheetOptions): BottomSheetElement => {
  if (!isBrowser) {
    throw new Error("createBottomSheet requires a browser environment.");
  }

  const markup = renderBottomSheetMarkup({
    title: options.title,
    content: typeof options.content === "string" ? options.content : "",
    primaryButtonText: options.primaryButtonText,
    id: options.id,
    className: options.className,
  });

  const wrapper = createElementFromMarkup<HTMLDivElement>(markup) as BottomSheetElement;
  applyRootAttributes(wrapper, { id: options.id, className: options.className });
  populateContent(wrapper, options.content);

  const { close } = attachBehavior(wrapper, options);
  defineCloseProperty(wrapper, close);

  return wrapper;
};

export const showBottomSheet = (options: BottomSheetOptions): BottomSheetElement => {
  if (!isBrowser) {
    throw new Error("showBottomSheet can only be used in a browser environment.");
  }

  const sheet = createBottomSheet(options);
  const host = ensureHostElement({
    componentName: "bottom-sheet",
    target: options.target,
    fallback: () => document.body,
  });
  host.appendChild(sheet);
  focusFirstDescendant(sheet);
  return sheet;
};

export const hydrateBottomSheet = (
  wrapper: HTMLDivElement,
  options: BottomSheetHydrationOptions = {},
): BottomSheetElement => {
  const { close } = attachBehavior(wrapper, options);
  defineCloseProperty(wrapper, close);
  return wrapper as BottomSheetElement;
};
