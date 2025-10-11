import {
  createElementFromMarkup,
  createId,
  isBrowser,
  setComponentAttr,
} from "../utils/dom";

const COMPONENT_NAME = "input-field";
const INPUT_SELECTOR = "[data-input-element]";
const ERROR_SELECTOR = "[data-input-error]";

export type InputFieldSize = "sm" | "md" | "lg";
export type InputFieldType = "text" | "email" | "password" | "number" | "search" | "tel" | "url";

interface InputFieldContentOptions {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
  helperText?: string;
  size?: InputFieldSize;
  type?: InputFieldType;
  required?: boolean;
  disabled?: boolean;
  prefix?: string;
  suffix?: string;
  id?: string;
}

export interface InputFieldBehaviorOptions {
  onInput?: (value: string, event: Event) => void;
  onChange?: (value: string, event: Event) => void;
  onBlur?: (value: string, event: FocusEvent) => void;
  onFocus?: (event: FocusEvent) => void;
}

export type InputFieldOptions = InputFieldContentOptions & InputFieldBehaviorOptions;

export interface InputFieldMarkupOptions extends InputFieldContentOptions {
  includeDataAttributes?: boolean;
}

export type InputFieldHydrationOptions = InputFieldBehaviorOptions;

export interface InputFieldElement extends HTMLDivElement {
  getValue: () => string;
  setValue: (value: string) => void;
  focusField: () => void;
  setError: (message: string | null) => void;
}

const toSizeClass = (size: InputFieldSize | undefined): string => {
  switch (size) {
    case "sm":
      return "input-field--sm";
    case "lg":
      return "input-field--lg";
    default:
      return "input-field--md";
  }
};

const resolveInputId = (options: InputFieldContentOptions): string => {
  if (options.id) {
    return options.id;
  }
  return createId("vanila-input");
};

export const renderInputFieldMarkup = ({
  name,
  label,
  value,
  placeholder,
  helperText,
  size,
  type = "text",
  required,
  disabled,
  prefix,
  suffix,
  includeDataAttributes = true,
  id,
}: InputFieldMarkupOptions): string => {
  const inputId = resolveInputId({ name, label, id });
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";
  const describedById = helperText ? `${inputId}-helper` : undefined;
  const requiredAttr = required ? " required" : "";
  const disabledAttr = disabled ? " disabled" : "";
  const placeholderAttr = placeholder ? ` placeholder="${placeholder}"` : "";
  const valueAttr = value !== undefined ? ` value="${value}"` : "";
  const prefixMarkup = prefix ? `<span class="input-field__affix input-field__affix--prefix">${prefix}</span>` : "";
  const suffixMarkup = suffix ? `<span class="input-field__affix input-field__affix--suffix">${suffix}</span>` : "";
  const helperMarkup = helperText
    ? `<p class="input-field__helper" id="${describedById}" data-input-helper>${helperText}</p>`
    : "";

  const sizeClass = toSizeClass(size);

  return `
  <div class="input-field ${sizeClass}"${dataAttr} data-size="${size ?? "md"}">
    <label class="input-field__label" for="${inputId}">${label}${required ? " <span class=\"input-field__required\">*</span>" : ""}</label>
    <div class="input-field__control">
      ${prefixMarkup}
      <input
        id="${inputId}"
        class="input-field__input"
        name="${name}"
        type="${type}"
        ${describedById ? `aria-describedby="${describedById}"` : ""}
        data-input-element
        ${placeholderAttr}
        ${valueAttr}
        ${requiredAttr}
        ${disabledAttr}
      />
      ${suffixMarkup}
    </div>
    ${helperMarkup}
    <p class="input-field__error" data-input-error hidden></p>
  </div>
  `;
};

const attachBehavior = (
  wrapper: HTMLDivElement,
  options: InputFieldHydrationOptions = {},
): InputFieldElement => {
  setComponentAttr(wrapper, COMPONENT_NAME);

  const input = wrapper.querySelector<HTMLInputElement>(INPUT_SELECTOR);
  const errorElement = wrapper.querySelector<HTMLParagraphElement>(ERROR_SELECTOR);

  if (!input) {
    throw new Error("Input element not found in input field markup");
  }

  const emitValue = (callback: ((value: string, event: any) => void) | undefined, event: Event | FocusEvent) => {
    if (!callback) {
      return;
    }
    callback(input.value, event);
  };

  const handleInput = (event: Event) => {
    emitValue(options.onInput, event);
  };

  const handleChange = (event: Event) => {
    emitValue(options.onChange, event);
  };

  const handleBlur = (event: FocusEvent) => {
    emitValue(options.onBlur, event);
  };

  const handleFocus = (event: FocusEvent) => {
    options.onFocus?.(event);
  };

  input.addEventListener("input", handleInput);
  input.addEventListener("change", handleChange);
  input.addEventListener("blur", handleBlur);
  input.addEventListener("focus", handleFocus);

  const getValue = () => input.value;
  const setValue = (value: string) => {
    input.value = value;
  };
  const focusField = () => {
    input.focus();
  };
  const setError = (message: string | null) => {
    if (!errorElement) {
      return;
    }
    if (message) {
      errorElement.textContent = message;
      errorElement.hidden = false;
      wrapper.classList.add("input-field--error");
      input.setAttribute("aria-invalid", "true");
    } else {
      errorElement.textContent = "";
      errorElement.hidden = true;
      wrapper.classList.remove("input-field--error");
      input.removeAttribute("aria-invalid");
    }
  };

  Object.defineProperties(wrapper, {
    getValue: {
      value: getValue,
      configurable: true,
      enumerable: false,
    },
    setValue: {
      value: setValue,
      configurable: true,
      enumerable: false,
    },
    focusField: {
      value: focusField,
      configurable: true,
      enumerable: false,
    },
    setError: {
      value: setError,
      configurable: true,
      enumerable: false,
    },
  });

  return wrapper as InputFieldElement;
};

export const createInputField = (options: InputFieldOptions): InputFieldElement => {
  if (!isBrowser) {
    throw new Error("createInputField requires a browser environment.");
  }

  const markup = renderInputFieldMarkup(options);
  const element = createElementFromMarkup<HTMLDivElement>(markup);
  return attachBehavior(element, options);
};

export const hydrateInputField = (
  element: HTMLDivElement,
  options: InputFieldHydrationOptions = {},
): InputFieldElement => attachBehavior(element, options);
