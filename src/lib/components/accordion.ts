import { showModal } from "./modal";
import { createElementFromMarkup, createId, isBrowser, setComponentAttr } from "../utils/dom";

const COMPONENT_NAME = "accordion";

interface AccordionContentConfig {
  title: string;
  content: string;
  editable?: boolean;
}

export interface AccordionBehaviorOptions {
  onDeleteConfirm?: () => void;
  onDeleteCancel?: () => void;
  onModalClose?: () => void;
  onContentChange?: (value: string) => void;
  onDeleteRequest?: (context: AccordionDeleteRequestContext) => void;
}

export type AccordionItemOptions = AccordionContentConfig & AccordionBehaviorOptions;

export interface AccordionMarkupOptions extends AccordionContentConfig {
  idPrefix?: string;
  includeDataAttributes?: boolean;
}

export type AccordionHydrationOptions = AccordionBehaviorOptions & { editable?: boolean };

export interface AccordionElement extends HTMLDivElement {
  toggle: (expand?: boolean) => void;
}

export interface AccordionDeleteRequestContext {
  accordionElement: AccordionElement;
  remove: () => void;
  cancel: () => void;
  defaultHandler: () => void;
  notifyClosed: () => void;
}

const renderEditorMarkup = (content: string): string => `
  <div class="accordion-editor">
    <p class="editable-content" data-vanila-accordion-display>${content}</p>
    <textarea class="accordion-content-input" data-vanila-accordion-input hidden>${content}</textarea>
    <div class="btn-wrapper">
      <button type="button" class="save-btn" data-vanila-accordion-save hidden>저장</button>
      <button type="button" class="delete-btn" data-vanila-accordion-delete>삭제</button>
    </div>
  </div>
`;

export const renderAccordionMarkup = ({
  title,
  content,
  editable = true,
  idPrefix,
  includeDataAttributes = true,
}: AccordionMarkupOptions): string => {
  const titleId = idPrefix ? `${idPrefix}-title` : createId("vanila-accordion-title");
  const contentId = idPrefix ? `${idPrefix}-content` : createId("vanila-accordion-content");
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";
  const editableAttr = editable ? "true" : "false";

  return `
  <div class="accordion-item"${dataAttr} data-vanila-editable="${editableAttr}">
    <div class="accordion-header">
      <h3 class="accordion-title" id="${titleId}">${title}</h3>
      <button
        type="button"
        class="accordion-toggle"
        data-vanila-accordion-toggle
        aria-expanded="false"
        aria-controls="${contentId}"
        aria-labelledby="${titleId}"
      >
        +
      </button>
    </div>
    <div class="accordion-content" id="${contentId}" data-vanila-accordion-content hidden>
      ${renderEditorMarkup(content)}
    </div>
  </div>
  `;
};

const setExpandedState = (toggleButton: HTMLButtonElement, content: HTMLElement, expanded: boolean) => {
  toggleButton.setAttribute("aria-expanded", String(expanded));
  content.toggleAttribute("hidden", !expanded);
  content.classList.toggle("open", expanded);
  toggleButton.textContent = expanded ? "−" : "+";
};

type Teardown = () => void;

const attachBehavior = (
  accordion: HTMLDivElement,
  options: AccordionHydrationOptions,
): { toggle: (expand?: boolean) => void; teardown: Teardown } => {
  setComponentAttr(accordion, COMPONENT_NAME);

  const editable = options.editable ?? accordion.dataset.vanilaEditable !== "false";

  const toggleButton = accordion.querySelector<HTMLButtonElement>("[data-vanila-accordion-toggle]");
  const header = accordion.querySelector<HTMLElement>(".accordion-header");
  const content = accordion.querySelector<HTMLElement>("[data-vanila-accordion-content]");
  const display = accordion.querySelector<HTMLElement>("[data-vanila-accordion-display]");
  const textarea = accordion.querySelector<HTMLTextAreaElement>("[data-vanila-accordion-input]");
  const saveButton = accordion.querySelector<HTMLButtonElement>("[data-vanila-accordion-save]");
  const deleteButton = accordion.querySelector<HTMLButtonElement>("[data-vanila-accordion-delete]");

  if (!toggleButton || !content) {
    throw new Error("Accordion markup is missing required elements.");
  }

  let expanded = toggleButton.getAttribute("aria-expanded") === "true";
  setExpandedState(toggleButton, content, expanded);
  accordion.classList.toggle("open", expanded);

  const toggle = (forceExpand?: boolean) => {
    expanded = typeof forceExpand === "boolean" ? forceExpand : !expanded;
    setExpandedState(toggleButton, content, expanded);
    accordion.classList.toggle("open", expanded);
  };

  const handleToggle = () => toggle();
  toggleButton.addEventListener("click", handleToggle);
  const handleHeaderClick = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest("[data-vanila-accordion-toggle]")) {
      return;
    }
    toggle();
  };
  header?.addEventListener("click", handleHeaderClick);

  let isEditing = false;
  let savedValue = textarea?.value ?? display?.textContent ?? "";

  const commitEdit = (nextValue?: string) => {
    if (!display || !textarea || !saveButton) {
      return;
    }

    const value = nextValue ?? textarea.value;

    if (savedValue !== value) {
      savedValue = value;
      display.textContent = value;
      options.onContentChange?.(value);
    }

    textarea.value = value;
    textarea.setAttribute("hidden", "");
    display.hidden = false;
    saveButton.setAttribute("hidden", "");
    isEditing = false;
  };

  const cancelEdit = () => {
    if (!display || !textarea || !saveButton) {
      return;
    }

    textarea.value = savedValue;
    textarea.setAttribute("hidden", "");
    display.hidden = false;
    saveButton.setAttribute("hidden", "");
    isEditing = false;
  };

  const beginEdit = () => {
    if (!editable || !display || !textarea || !saveButton) {
      return;
    }

    if (isEditing) {
      return;
    }

    isEditing = true;
    display.hidden = true;
    textarea.removeAttribute("hidden");
    saveButton.removeAttribute("hidden");
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  };

  display?.addEventListener("click", beginEdit);

  const handleSave = () => {
    commitEdit();
  };

  const handleTextareaKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      commitEdit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
      display?.focus?.();
    }
  };

  const handleTextareaBlur = () => {
    if (!isEditing) {
      return;
    }
    commitEdit();
  };

  const removeAccordion = () => {
    accordion.remove();
    options.onDeleteConfirm?.();
  };

  const cancelDelete = () => {
    options.onDeleteCancel?.();
  };

  const notifyClosed = () => {
    options.onModalClose?.();
  };

  const runDefaultDeleteFlow = () => {
    showModal({
      title: "삭제 확인",
      message: "정말로 이 항목을 삭제하시겠습니까?",
      primaryButtonText: "삭제",
      secondaryButtonText: "취소",
      onPrimaryAction: () => {
        removeAccordion();
      },
      onSecondaryAction: () => {
        cancelDelete();
      },
      onClose: () => {
        notifyClosed();
      },
    });
  };

  const handleDelete = () => {
    if (options.onDeleteRequest) {
      const context: AccordionDeleteRequestContext = {
        accordionElement: accordion as AccordionElement,
        remove: () => {
          removeAccordion();
          notifyClosed();
        },
        cancel: () => {
          cancelDelete();
          notifyClosed();
        },
        defaultHandler: runDefaultDeleteFlow,
        notifyClosed,
      };

      options.onDeleteRequest(context);
      return;
    }

    runDefaultDeleteFlow();
  };

  saveButton?.addEventListener("click", handleSave);
  textarea?.addEventListener("keydown", handleTextareaKeydown);
  textarea?.addEventListener("blur", handleTextareaBlur);
  deleteButton?.addEventListener("click", handleDelete);

  const teardown = () => {
    toggleButton.removeEventListener("click", handleToggle);
    header?.removeEventListener("click", handleHeaderClick);
    display?.removeEventListener("click", beginEdit);
    saveButton?.removeEventListener("click", handleSave);
    textarea?.removeEventListener("keydown", handleTextareaKeydown);
    textarea?.removeEventListener("blur", handleTextareaBlur);
    deleteButton?.removeEventListener("click", handleDelete);
  };

  return { toggle, teardown };
};

const defineToggleProperty = (accordion: AccordionElement, toggle: (expand?: boolean) => void) => {
  Object.defineProperty(accordion, "toggle", {
    value: toggle,
    configurable: true,
    enumerable: false,
    writable: false,
  });
};

export const createAccordion = (options: AccordionItemOptions): AccordionElement => {
  if (!isBrowser) {
    throw new Error("createAccordion requires a browser environment.");
  }

  const markup = renderAccordionMarkup(options);
  const accordion = createElementFromMarkup<HTMLDivElement>(markup) as AccordionElement;
  const { toggle } = attachBehavior(accordion, options);
  defineToggleProperty(accordion, toggle);
  return accordion;
};

export const hydrateAccordion = (
  accordion: HTMLDivElement,
  options: AccordionHydrationOptions = {},
): AccordionElement => {
  const { toggle } = attachBehavior(accordion, options);
  defineToggleProperty(accordion as AccordionElement, toggle);
  return accordion as AccordionElement;
};
