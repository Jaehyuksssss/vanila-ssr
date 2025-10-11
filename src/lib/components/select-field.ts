import {
  createElementFromMarkup,
  createId,
  isBrowser,
  setComponentAttr,
} from "../utils/dom";

const COMPONENT_NAME = "select-field";
const SELECT_SELECTOR = "[data-select-element]";
const ERROR_SELECTOR = "[data-select-error]";

export type SelectFieldSize = "sm" | "md" | "lg";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectFieldContentOptions {
  name: string;
  label: string;
  options: SelectOption[];
  value?: string | string[];
  placeholder?: string;
  helperText?: string;
  size?: SelectFieldSize;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  id?: string;
}

export interface SelectFieldBehaviorOptions {
  onChange?: (value: string | string[], event: Event) => void;
  onBlur?: (value: string | string[], event: FocusEvent) => void;
  onFocus?: (event: FocusEvent) => void;
}

export type SelectFieldOptions = SelectFieldContentOptions & SelectFieldBehaviorOptions;

export interface SelectFieldMarkupOptions extends SelectFieldContentOptions {
  includeDataAttributes?: boolean;
}

export type SelectFieldHydrationOptions = SelectFieldBehaviorOptions;

export interface SelectFieldElement extends HTMLDivElement {
  getValue: () => string | string[];
  setValue: (value: string | string[]) => void;
  setOptions: (options: SelectOption[]) => void;
  setError: (message: string | null) => void;
  focusField: () => void;
}

const toSizeClass = (size: SelectFieldSize | undefined): string => {
  switch (size) {
    case "sm":
      return "select-field--sm";
    case "lg":
      return "select-field--lg";
    default:
      return "select-field--md";
  }
};

const resolveSelectId = (options: SelectFieldContentOptions): string => {
  if (options.id) {
    return options.id;
  }
  return createId("vanila-select");
};

const renderOptionsMarkup = (
  options: SelectOption[],
  value: string | string[] | undefined,
): string => {
  const selectedValues = value === undefined ? [] : Array.isArray(value) ? value.map(String) : [String(value)];
  const valueSet = new Set(selectedValues);

  return options
    .map((option) => {
      const disabledAttr = option.disabled ? " disabled" : "";
      const selectedAttr = valueSet.has(option.value) ? " selected" : "";
      return `<option value="${option.value}"${disabledAttr}${selectedAttr}>${option.label}</option>`;
    })
    .join("");
};

export const renderSelectFieldMarkup = ({
  name,
  label,
  options,
  value,
  placeholder,
  helperText,
  size,
  required,
  disabled,
  multiple,
  includeDataAttributes = true,
  id,
}: SelectFieldMarkupOptions): string => {
  const selectId = resolveSelectId({ name, label, options, id });
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";
  const describedById = helperText ? `${selectId}-helper` : undefined;
  const requiredAttr = required ? " required" : "";
  const disabledAttr = disabled ? " disabled" : "";
  const multipleAttr = multiple ? " multiple" : "";
  const placeholderOption = placeholder && !multiple ? `<option value=""${value === "" || value === undefined ? " selected" : ""}>${placeholder}</option>` : "";
  const helperMarkup = helperText
    ? `<p class="select-field__helper" id="${describedById}" data-select-helper>${helperText}</p>`
    : "";

  const sizeClass = toSizeClass(size);

  return `
  <div class="select-field ${sizeClass}"${dataAttr} data-size="${size ?? "md"}">
    <label class="select-field__label" for="${selectId}">${label}${required ? " <span class=\"select-field__required\">*</span>" : ""}</label>
    <div class="select-field__control">
      <select
        id="${selectId}"
        class="select-field__select"
        name="${name}${multiple ? "[]" : ""}"
        data-select-element
        ${describedById ? `aria-describedby="${describedById}"` : ""}
        ${requiredAttr}
        ${disabledAttr}
        ${multipleAttr}
      >
        ${placeholderOption}
        ${renderOptionsMarkup(options, value)}
      </select>
    </div>
    ${helperMarkup}
    <p class="select-field__error" data-select-error hidden></p>
  </div>
  `;
};

const applySelection = (select: HTMLSelectElement, value?: string | string[]) => {
  if (value === undefined) {
    return;
  }

  const values = Array.isArray(value) ? value.map(String) : [String(value)];
  const valueSet = new Set(values);

  Array.from(select.options).forEach((option) => {
    option.selected = valueSet.has(option.value);
  });
};

const collectValue = (select: HTMLSelectElement): string | string[] => {
  if (select.multiple) {
    return Array.from(select.selectedOptions).map((option) => option.value);
  }
  return select.value;
};

const attachBehavior = (
  wrapper: HTMLDivElement,
  content: SelectFieldContentOptions,
  options: SelectFieldHydrationOptions = {},
): SelectFieldElement => {
  setComponentAttr(wrapper, COMPONENT_NAME);

  const select = wrapper.querySelector<HTMLSelectElement>(SELECT_SELECTOR);
  const errorElement = wrapper.querySelector<HTMLParagraphElement>(ERROR_SELECTOR);

  if (!select) {
    throw new Error("Select element not found in select field markup");
  }

  applySelection(select, content.value);

  const emit = (callback: ((value: string | string[], event: any) => void) | undefined, event: Event | FocusEvent) => {
    if (!callback) {
      return;
    }
    callback(collectValue(select), event);
  };

  const handleChange = (event: Event) => {
    emit(options.onChange, event);
  };

  const handleBlur = (event: FocusEvent) => {
    emit(options.onBlur, event);
  };

  const handleFocus = (event: FocusEvent) => {
    options.onFocus?.(event);
  };

  select.addEventListener("change", handleChange);
  select.addEventListener("blur", handleBlur);
  select.addEventListener("focus", handleFocus);

  const getValue = () => collectValue(select);

  const setValue = (value: string | string[]) => {
    applySelection(select, value);
  };

  const setOptions = (newOptions: SelectOption[]) => {
    const fragment = document.createDocumentFragment();
    newOptions.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      if (option.disabled) {
        optionElement.disabled = true;
      }
      fragment.appendChild(optionElement);
    });
    select.innerHTML = "";
    if (content.placeholder && !select.multiple) {
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = content.placeholder;
      placeholderOption.selected = select.value === "" || select.selectedIndex === -1;
      select.appendChild(placeholderOption);
    }
    select.appendChild(fragment);
    content.options = newOptions;
  };

  const setError = (message: string | null) => {
    if (!errorElement) {
      return;
    }
    if (message) {
      errorElement.textContent = message;
      errorElement.hidden = false;
      wrapper.classList.add("select-field--error");
      select.setAttribute("aria-invalid", "true");
    } else {
      errorElement.textContent = "";
      errorElement.hidden = true;
      wrapper.classList.remove("select-field--error");
      select.removeAttribute("aria-invalid");
    }
  };

  const focusField = () => {
    select.focus();
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
    setOptions: {
      value: setOptions,
      configurable: true,
      enumerable: false,
    },
    setError: {
      value: setError,
      configurable: true,
      enumerable: false,
    },
    focusField: {
      value: focusField,
      configurable: true,
      enumerable: false,
    },
  });

  return wrapper as SelectFieldElement;
};

export const createSelectField = (options: SelectFieldOptions): SelectFieldElement => {
  if (!isBrowser) {
    throw new Error("createSelectField requires a browser environment.");
  }

  const { onChange, onBlur, onFocus, ...contentOptions } = options;
  const markup = renderSelectFieldMarkup(contentOptions);
  const element = createElementFromMarkup<HTMLDivElement>(markup);
  return attachBehavior(element, contentOptions, { onChange, onBlur, onFocus });
};

export const hydrateSelectField = (
  element: HTMLDivElement,
  options: SelectFieldHydrationOptions = {},
  content: SelectFieldContentOptions = {
    name: element.querySelector<HTMLSelectElement>(SELECT_SELECTOR)?.name ?? "",
    label: element.querySelector<HTMLLabelElement>("label")?.textContent ?? "",
    options: [],
  },
): SelectFieldElement => {
  const select = element.querySelector<HTMLSelectElement>(SELECT_SELECTOR);
  const currentOptions = select ? Array.from(select.options).map<SelectOption>((option) => ({
    label: option.label,
    value: option.value,
    disabled: option.disabled,
  })) : [];

  const placeholderFromDom = !select?.multiple && select?.options[0]?.value === "" ? select.options[0].textContent ?? undefined : undefined;

  const inferredContent: SelectFieldContentOptions = {
    ...content,
    options: content.options.length ? content.options : currentOptions,
    value: select?.multiple
      ? Array.from(select?.selectedOptions ?? []).map((option) => option.value)
      : select?.value,
    multiple: select?.multiple,
    placeholder: content.placeholder ?? placeholderFromDom,
  };

  return attachBehavior(element, inferredContent, options);
};
