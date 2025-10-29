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

const MODAL_COMPONENT_NAME = "modal";
const DEFAULT_PRIMARY_TEXT = "확인";

interface ModalContent {
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export interface ModalBehaviorOptions {
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export interface ModalPresentationOptions {
  id?: string;
  className?: string | string[];
  target?: string | HTMLElement;
}

export type ModalOptions = ModalContent & ModalBehaviorOptions & ModalPresentationOptions;

export interface ModalMarkupOptions extends ModalContent {
  idPrefix?: string;
  includeDataAttributes?: boolean;
  id?: string;
  className?: string | string[];
}

export type ModalHydrationOptions = ModalBehaviorOptions;

export interface ModalElement extends HTMLDivElement {
  close: () => void;
}

const renderSecondaryButton = (text?: string): string => {
  if (!text) {
    return "";
  }

  return `<button type="button" class="btn-secondary" data-vanila-modal-secondary>${text}</button>`;
};

const getTitleId = (base?: string): string =>
  base ?? createId("vanila-modal-title");
const getMessageId = (base?: string): string =>
  base ?? createId("vanila-modal-message");

export const renderModalMarkup = ({
  title,
  message,
  primaryButtonText,
  secondaryButtonText,
  idPrefix,
  includeDataAttributes = true,
  id,
  className,
}: ModalMarkupOptions): string => {
  const titleId = getTitleId(idPrefix ? `${idPrefix}-title` : undefined);
  const messageId = getMessageId(idPrefix ? `${idPrefix}-message` : undefined);
  const dataAttr = includeDataAttributes
    ? ` data-vanila-component="${MODAL_COMPONENT_NAME}"`
    : "";
  const idAttr = id ? ` id="${id}"` : "";
  const wrapperClass = joinClassNames("modal-wrapper", "dimmed", className);

  return `
  <div class="${wrapperClass}"${idAttr}${dataAttr} tabindex="-1">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${titleId}" aria-describedby="${messageId}">
      <h2 class="modal-title" id="${titleId}">${title}</h2>
      <p class="modal-message" id="${messageId}">${message}</p>
      <div class="modal-actions">
        <button type="button" class="btn-primary" data-vanila-modal-primary>${
          primaryButtonText ?? DEFAULT_PRIMARY_TEXT
        }</button>
        ${renderSecondaryButton(secondaryButtonText)}
      </div>
    </div>
  </div>
  `;
};

const ensureAriaAttributes = (wrapper: HTMLDivElement): void => {
  const dialog = wrapper.querySelector<HTMLElement>(".modal");
  if (!dialog) {
    return;
  }

  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const titleElement = dialog.querySelector<HTMLElement>(".modal-title");
  const messageElement = dialog.querySelector<HTMLElement>(".modal-message");

  if (titleElement) {
    if (!titleElement.id) {
      titleElement.id = createId("vanila-modal-title");
    }
    dialog.setAttribute("aria-labelledby", titleElement.id);
  }

  if (messageElement) {
    if (!messageElement.id) {
      messageElement.id = createId("vanila-modal-message");
    }
    dialog.setAttribute("aria-describedby", messageElement.id);
  }
};

type Teardown = () => void;

const attachModalBehavior = (
  wrapper: HTMLDivElement,
  options: ModalBehaviorOptions
): { close: () => void; teardown: Teardown } => {
  ensureAriaAttributes(wrapper);
  setComponentAttr(wrapper, MODAL_COMPONENT_NAME);

  const restoreFocus = preserveActiveElement();
  let isClosed = false;

  const primaryButton = wrapper.querySelector<HTMLButtonElement>(
    "[data-vanila-modal-primary]"
  );
  const secondaryButton = wrapper.querySelector<HTMLButtonElement>(
    "[data-vanila-modal-secondary]"
  );

  const close = () => {
    if (isClosed) {
      return;
    }
    isClosed = true;

    teardown();

    if (wrapper.isConnected) {
      wrapper.remove();
    }

    options.onClose?.();
    restoreFocus();
  };

  const handlePrimary = () => {
    options.onPrimaryAction?.();
    close();
  };

  const handleSecondary = () => {
    options.onSecondaryAction?.();
    close();
  };

  primaryButton?.addEventListener("click", handlePrimary);
  secondaryButton?.addEventListener("click", handleSecondary);

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === wrapper && options.closeOnBackdrop !== false) {
      close();
    }
  };

  wrapper.addEventListener("mousedown", handleBackdropClick);

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
    secondaryButton?.removeEventListener("click", handleSecondary);
    wrapper.removeEventListener("mousedown", handleBackdropClick);
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

export const createModal = (options: ModalOptions): ModalElement => {
  if (!isBrowser) {
    throw new Error("createModal requires a browser environment.");
  }

  const markup = renderModalMarkup(options);
  const wrapper = createElementFromMarkup<HTMLDivElement>(
    markup
  ) as ModalElement;
  applyRootAttributes(wrapper, { id: options.id, className: options.className });
  const { close } = attachModalBehavior(wrapper, options);

  defineCloseProperty(wrapper, close);

  return wrapper;
};

export const showModal = (options: ModalOptions): ModalElement => {
  if (!isBrowser) {
    throw new Error("showModal can only be used in a browser environment.");
  }

  const modal = createModal(options);
  const host = ensureHostElement({
    componentName: "modal",
    target: options.target,
    fallback: () => document.body,
  });
  host.appendChild(modal);
  focusFirstDescendant(modal);
  return modal;
};

export const hydrateModal = (
  wrapper: HTMLDivElement,
  options: ModalHydrationOptions = {}
): ModalElement => {
  const { close } = attachModalBehavior(wrapper, options);
  defineCloseProperty(wrapper, close);
  return wrapper as ModalElement;
};

// Promise-based confirm helper to reduce boilerplate in apps
export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  target?: string | HTMLElement;
}

export const confirm = ({
  title = "확인",
  message = "이 작업을 진행하시겠습니까?",
  confirmText = "확인",
  cancelText = "취소",
  target,
}: ConfirmOptions = {}): Promise<boolean> => {
  if (!isBrowser) {
    throw new Error("confirm() can only be used in a browser environment.");
  }

  return new Promise<boolean>((resolve) => {
    const modal = showModal({
      title,
      message,
      primaryButtonText: confirmText,
      secondaryButtonText: cancelText,
      target,
      onPrimaryAction: () => resolve(true),
      onSecondaryAction: () => resolve(false),
      onClose: () => resolve(false),
    });

    // Optional: allow programmatic cancel via Escape/backdrop handled in modal
    // modal.close() is exposed via ModalElement if needed by caller
    return modal;
  });
};
