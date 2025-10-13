import {
  createElementFromMarkup,
  createId,
  isBrowser,
  joinClassNames,
  setComponentAttr,
} from "../utils/dom";

const COMPONENT_NAME = "date-picker";
const SINGLE_INPUT_SELECTOR = "[data-date-picker-input]";
const START_INPUT_SELECTOR = "[data-date-picker-start]";
const END_INPUT_SELECTOR = "[data-date-picker-end]";
const HELPER_SELECTOR = "[data-date-picker-helper]";
const ERROR_SELECTOR = "[data-date-picker-error]";

type DatePickerSingleMode = "date" | "time" | "datetime";
type DatePickerRangeMode = "date-range" | "datetime-range" | "time-range";

export type DatePickerMode = DatePickerSingleMode | DatePickerRangeMode;

export type DatePickerSize = "sm" | "md" | "lg";

export interface DatePickerRangeValue {
  start?: string | null;
  end?: string | null;
}

export type DatePickerValue = string | DatePickerRangeValue;

interface DatePickerBaseContentOptions {
  label?: string;
  helperText?: string;
  id?: string;
  className?: string | string[];
  size?: DatePickerSize;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  step?: number;
}

export interface DatePickerSingleContentOptions extends DatePickerBaseContentOptions {
  mode?: DatePickerSingleMode;
  name: string;
  placeholder?: string;
  defaultValue?: string;
}

export interface DatePickerRangeContentOptions extends DatePickerBaseContentOptions {
  mode: DatePickerRangeMode;
  name: string;
  startName?: string;
  endName?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  defaultValue?: DatePickerRangeValue;
}

export type DatePickerContentOptions =
  | DatePickerSingleContentOptions
  | DatePickerRangeContentOptions;

export interface DatePickerBehaviorOptions {
  onChange?: (value: DatePickerValue, event: Event) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

export type DatePickerOptions = DatePickerContentOptions & DatePickerBehaviorOptions;

type DatePickerSingleMarkupOptions = DatePickerSingleContentOptions & { includeDataAttributes?: boolean };
type DatePickerRangeMarkupOptions = DatePickerRangeContentOptions & { includeDataAttributes?: boolean };

export type DatePickerMarkupOptions = DatePickerSingleMarkupOptions | DatePickerRangeMarkupOptions;

export type DatePickerHydrationOptions = DatePickerBehaviorOptions;

export interface DatePickerElement extends HTMLDivElement {
  getValue: () => DatePickerValue;
  setValue: (value: DatePickerValue) => void;
  focusField: (target?: "start" | "end") => void;
  setDisabled: (disabled: boolean) => void;
  setError: (message: string | null) => void;
  setMin: (value: string | null) => void;
  setMax: (value: string | null) => void;
}

const DEFAULT_SIZE: DatePickerSize = "md";

const toInputType = (mode: DatePickerMode): string => {
  switch (mode) {
    case "datetime":
    case "datetime-range":
      return "datetime-local";
    case "time":
    case "time-range":
      return "time";
    case "date":
    case "date-range":
    default:
      return "date";
  }
};

const isRangeMode = (mode: DatePickerMode): boolean => {
  return mode.endsWith("range") || mode === "date-range" || mode === "datetime-range" || mode === "time-range";
};

const resolveMode = (mode: DatePickerMode | undefined): DatePickerMode => {
  return mode ?? "date";
};

const resolveSizeClass = (size: DatePickerSize | undefined): string => {
  switch (size) {
    case "sm":
      return "date-picker--sm";
    case "lg":
      return "date-picker--lg";
    default:
      return "date-picker--md";
  }
};

const buildDatasetAttributes = (
  options: DatePickerMarkupOptions,
  mode: DatePickerMode,
): Record<string, string> => {
  const dataset: Record<string, string> = {
    mode,
    size: options.size ?? DEFAULT_SIZE,
    required: options.required ? "true" : "false",
    disabled: options.disabled ? "true" : "false",
  };

  dataset.name = options.name;

  if ("placeholder" in options && options.placeholder) {
    dataset.placeholder = options.placeholder;
  }

  if (options.min) {
    dataset.min = options.min;
  }

  if (options.max) {
    dataset.max = options.max;
  }

  if (options.step !== undefined) {
    dataset.step = String(options.step);
  }

  if (isRangeMode(mode)) {
    const rangeOptions = options as DatePickerRangeContentOptions;
    dataset.startName = rangeOptions.startName ?? `${options.name}_start`;
    dataset.endName = rangeOptions.endName ?? `${options.name}_end`;
    if (rangeOptions.startPlaceholder) {
      dataset.startPlaceholder = rangeOptions.startPlaceholder;
    }
    if (rangeOptions.endPlaceholder) {
      dataset.endPlaceholder = rangeOptions.endPlaceholder;
    }
  }

  return dataset;
};

const renderHelper = (helper?: string, id?: string): string => {
  if (!helper) {
    return "";
  }
  const idAttr = id ? ` id="${id}"` : "";
  return `<p class="date-picker__helper"${idAttr} data-date-picker-helper>${helper}</p>`;
};

const renderRangeInputs = (
  options: DatePickerRangeContentOptions,
  inputType: string,
  ids: { startId: string; endId: string },
  describedBy?: string,
): string => {
  const startName = options.startName ?? `${options.name}_start`;
  const endName = options.endName ?? `${options.name}_end`;
  const startValue = options.defaultValue?.start ?? "";
  const endValue = options.defaultValue?.end ?? "";
  const minAttr = options.min ? ` min="${options.min}"` : "";
  const maxAttr = options.max ? ` max="${options.max}"` : "";
  const stepAttr = options.step !== undefined ? ` step="${options.step}"` : "";
  const requiredAttr = options.required ? " required" : "";
  const disabledAttr = options.disabled ? " disabled" : "";

  const startPlaceholderAttr = options.startPlaceholder
    ? ` placeholder="${options.startPlaceholder}"`
    : "";
  const endPlaceholderAttr = options.endPlaceholder ? ` placeholder="${options.endPlaceholder}"` : "";
  const describedByAttr = describedBy ? ` aria-describedby="${describedBy}"` : "";

  return `
    <div class="date-picker__range">
      <input
        type="${inputType}"
        class="date-picker__input"
        name="${startName}"
        id="${ids.startId}"
        data-date-picker-start
        value="${startValue}"
        ${minAttr}
        ${maxAttr}
        ${stepAttr}
        ${requiredAttr}
        ${disabledAttr}
        ${startPlaceholderAttr}
        ${describedByAttr}
      />
      <span class="date-picker__divider">~</span>
      <input
        type="${inputType}"
        class="date-picker__input"
        name="${endName}"
        id="${ids.endId}"
        data-date-picker-end
        value="${endValue}"
        ${minAttr}
        ${maxAttr}
        ${stepAttr}
        ${requiredAttr}
        ${disabledAttr}
        ${endPlaceholderAttr}
        ${describedByAttr}
      />
    </div>
  `;
};

const renderSingleInput = (
  options: DatePickerSingleContentOptions,
  inputType: string,
  inputId: string,
  describedBy?: string,
): string => {
  const value = options.defaultValue ?? "";
  const minAttr = options.min ? ` min="${options.min}"` : "";
  const maxAttr = options.max ? ` max="${options.max}"` : "";
  const stepAttr = options.step !== undefined ? ` step="${options.step}"` : "";
  const requiredAttr = options.required ? " required" : "";
  const disabledAttr = options.disabled ? " disabled" : "";
  const placeholderAttr = options.placeholder ? ` placeholder="${options.placeholder}"` : "";
  const describedByAttr = describedBy ? ` aria-describedby="${describedBy}"` : "";

  return `
    <input
      type="${inputType}"
      class="date-picker__input"
      name="${options.name}"
      id="${inputId}"
      data-date-picker-input
      value="${value}"
      ${minAttr}
      ${maxAttr}
      ${stepAttr}
      ${requiredAttr}
      ${disabledAttr}
      ${placeholderAttr}
      ${describedByAttr}
    />
  `;
};

export const renderDatePickerMarkup = (options: DatePickerMarkupOptions): string => {
  const includeDataAttributes = options.includeDataAttributes ?? true;
  const mode = resolveMode(options.mode);
  const inputType = toInputType(mode);
  const sizeClass = resolveSizeClass(options.size);
  const range = isRangeMode(mode);

  const datasetAttributes = buildDatasetAttributes(options, mode);

  const datasetString = Object.entries(datasetAttributes)
    .map(([key, value]) => ` data-${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}="${value}"`)
    .join("");

  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";
  const baseInputId = options.id ?? createId("vanila-date-picker");
  const helperId = options.helperText ? `${baseInputId}-helper` : undefined;
  const helperMarkup = renderHelper(options.helperText, helperId);
  const wrapperClasses = joinClassNames("date-picker", sizeClass, options.className);

  let controlMarkup: string;
  let labelForId: string | undefined;

  if (range) {
    const startId = baseInputId;
    const endId = `${baseInputId}-end`;
    labelForId = startId;
    const { includeDataAttributes: _omit, ...rangeOptions } = options as DatePickerRangeMarkupOptions;
    const rangeConfig: DatePickerRangeContentOptions = {
      ...rangeOptions,
      mode: rangeOptions.mode ?? (mode as DatePickerRangeMode),
    };
    controlMarkup = renderRangeInputs(rangeConfig, inputType, { startId, endId }, helperId);
  } else {
    labelForId = baseInputId;
    const { includeDataAttributes: _omit, ...singleOptions } = options as DatePickerSingleMarkupOptions;
    const singleConfig: DatePickerSingleContentOptions = {
      ...singleOptions,
      mode: singleOptions.mode ?? (mode as DatePickerSingleMode),
    };
    controlMarkup = renderSingleInput(
      singleConfig,
      inputType,
      baseInputId,
      helperId,
    );
  }

  const labelMarkup = options.label
    ? `<label class="date-picker__label" for="${labelForId}">${options.label}${options.required ? ' <span class="date-picker__required">*</span>' : ""}</label>`
    : "";

  return `
  <div class="${wrapperClasses}"${dataAttr}${datasetString} data-mode="${mode}">
    ${labelMarkup}
    <div class="date-picker__control">
      ${controlMarkup}
    </div>
    ${helperMarkup}
    <p class="date-picker__error" data-date-picker-error hidden></p>
  </div>
  `;
};

const coerceRangeValue = (value: DatePickerValue): DatePickerRangeValue => {
  if (typeof value === "string") {
    return { start: value, end: value };
  }
  return {
    start: value?.start ?? "",
    end: value?.end ?? "",
  };
};

const collectValue = (wrapper: HTMLDivElement, mode: DatePickerMode): DatePickerValue => {
  if (isRangeMode(mode)) {
    const startInput = wrapper.querySelector<HTMLInputElement>(START_INPUT_SELECTOR);
    const endInput = wrapper.querySelector<HTMLInputElement>(END_INPUT_SELECTOR);
    return {
      start: startInput?.value ?? "",
      end: endInput?.value ?? "",
    };
  }
  const input = wrapper.querySelector<HTMLInputElement>(SINGLE_INPUT_SELECTOR);
  return input?.value ?? "";
};

const setInputValue = (
  wrapper: HTMLDivElement,
  mode: DatePickerMode,
  value: DatePickerValue,
) => {
  if (isRangeMode(mode)) {
    const rangeValue = coerceRangeValue(value);
    const startInput = wrapper.querySelector<HTMLInputElement>(START_INPUT_SELECTOR);
    const endInput = wrapper.querySelector<HTMLInputElement>(END_INPUT_SELECTOR);
    if (startInput) {
      startInput.value = rangeValue.start ?? "";
    }
    if (endInput) {
      endInput.value = rangeValue.end ?? "";
    }
    return;
  }
  const input = wrapper.querySelector<HTMLInputElement>(SINGLE_INPUT_SELECTOR);
  if (input) {
    input.value = typeof value === "string" ? value : value?.start ?? "";
  }
};

const setDisabledState = (wrapper: HTMLDivElement, mode: DatePickerMode, disabled: boolean) => {
  const inputs = isRangeMode(mode)
    ? [
        wrapper.querySelector<HTMLInputElement>(START_INPUT_SELECTOR),
        wrapper.querySelector<HTMLInputElement>(END_INPUT_SELECTOR),
      ]
    : [wrapper.querySelector<HTMLInputElement>(SINGLE_INPUT_SELECTOR)];

  inputs.forEach((input) => {
    if (input) {
      input.disabled = disabled;
    }
  });
};

const setMinMaxAttributes = (
  wrapper: HTMLDivElement,
  mode: DatePickerMode,
  type: "min" | "max",
  value: string | null,
) => {
  const inputs = isRangeMode(mode)
    ? [
        wrapper.querySelector<HTMLInputElement>(START_INPUT_SELECTOR),
        wrapper.querySelector<HTMLInputElement>(END_INPUT_SELECTOR),
      ]
    : [wrapper.querySelector<HTMLInputElement>(SINGLE_INPUT_SELECTOR)];

  inputs.forEach((input) => {
    if (!input) {
      return;
    }
    if (value === null) {
      input.removeAttribute(type);
    } else {
      input.setAttribute(type, value);
    }
  });
};

const attachBehavior = (
  wrapper: HTMLDivElement,
  content: DatePickerContentOptions,
  options: DatePickerHydrationOptions = {},
): DatePickerElement => {
  const mode = resolveMode(content.mode);
  setComponentAttr(wrapper, COMPONENT_NAME);
  wrapper.dataset.mode = mode;
  wrapper.dataset.size = content.size ?? DEFAULT_SIZE;

  const errorElement = wrapper.querySelector<HTMLParagraphElement>(ERROR_SELECTOR);

  const inputs = isRangeMode(mode)
    ? [
        wrapper.querySelector<HTMLInputElement>(START_INPUT_SELECTOR),
        wrapper.querySelector<HTMLInputElement>(END_INPUT_SELECTOR),
      ]
    : [wrapper.querySelector<HTMLInputElement>(SINGLE_INPUT_SELECTOR)];

  inputs.forEach((input) => {
    if (!input) {
      return;
    }
    if (content.min) {
      input.min = content.min;
    }
    if (content.max) {
      input.max = content.max;
    }
    if (content.step !== undefined) {
      input.step = String(content.step);
    }
    if (content.disabled) {
      input.disabled = true;
    }
  });

  if (isRangeMode(mode)) {
    const rangeContent = content as DatePickerRangeContentOptions;
    if (rangeContent.defaultValue) {
      setInputValue(wrapper, mode, rangeContent.defaultValue);
    }
  } else {
    const singleContent = content as DatePickerSingleContentOptions;
    if (singleContent.defaultValue !== undefined) {
      setInputValue(wrapper, mode, singleContent.defaultValue);
    }
  }

  const emitChange = (event: Event) => {
    options.onChange?.(collectValue(wrapper, mode), event);
  };

  const handleFocus = (event: FocusEvent) => {
    options.onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent) => {
    options.onBlur?.(event);
  };

  inputs.forEach((input) => {
    input?.addEventListener("change", emitChange);
    input?.addEventListener("blur", handleBlur);
    input?.addEventListener("focus", handleFocus);
  });

  const getValue = () => collectValue(wrapper, mode);

  const setValue = (value: DatePickerValue) => {
    setInputValue(wrapper, mode, value);
  };

  const focusField = (target: "start" | "end" = "start") => {
    if (isRangeMode(mode)) {
      const startInput = wrapper.querySelector<HTMLInputElement>(START_INPUT_SELECTOR);
      const endInput = wrapper.querySelector<HTMLInputElement>(END_INPUT_SELECTOR);
      if (target === "start") {
        startInput?.focus();
      } else {
        endInput?.focus();
      }
    } else {
      wrapper.querySelector<HTMLInputElement>(SINGLE_INPUT_SELECTOR)?.focus();
    }
  };

  const setDisabled = (disabled: boolean) => {
    setDisabledState(wrapper, mode, disabled);
    wrapper.dataset.disabled = disabled ? "true" : "false";
  };

  const setError = (message: string | null) => {
    if (!errorElement) {
      return;
    }
    if (message) {
      errorElement.textContent = message;
      errorElement.hidden = false;
      wrapper.classList.add("date-picker--error");
      inputs.forEach((input) => input?.setAttribute("aria-invalid", "true"));
    } else {
      errorElement.textContent = "";
      errorElement.hidden = true;
      wrapper.classList.remove("date-picker--error");
      inputs.forEach((input) => input?.removeAttribute("aria-invalid"));
    }
  };

  const setMin = (value: string | null) => {
    setMinMaxAttributes(wrapper, mode, "min", value);
    if (value === null) {
      delete wrapper.dataset.min;
    } else {
      wrapper.dataset.min = value;
    }
  };

  const setMax = (value: string | null) => {
    setMinMaxAttributes(wrapper, mode, "max", value);
    if (value === null) {
      delete wrapper.dataset.max;
    } else {
      wrapper.dataset.max = value;
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
    setDisabled: {
      value: setDisabled,
      configurable: true,
      enumerable: false,
    },
    setError: {
      value: setError,
      configurable: true,
      enumerable: false,
    },
    setMin: {
      value: setMin,
      configurable: true,
      enumerable: false,
    },
    setMax: {
      value: setMax,
      configurable: true,
      enumerable: false,
    },
  });

  return wrapper as DatePickerElement;
};

export const createDatePicker = (options: DatePickerOptions): DatePickerElement => {
  if (!isBrowser) {
    throw new Error("createDatePicker requires a browser environment.");
  }

  const { onChange, onFocus, onBlur, ...content } = options;
  const contentOptions = content as DatePickerContentOptions;
  const markup = renderDatePickerMarkup(contentOptions);
  const element = createElementFromMarkup<HTMLDivElement>(markup);
  return attachBehavior(element, contentOptions, { onChange, onFocus, onBlur });
};

const inferContentOptions = (element: HTMLDivElement): DatePickerContentOptions => {
  const mode = resolveMode((element.dataset.mode as DatePickerMode | undefined) ?? "date");
  const size = (element.dataset.size as DatePickerSize | undefined) ?? DEFAULT_SIZE;
  const required = element.dataset.required === "true";
  const disabled = element.dataset.disabled === "true";
  const min = element.dataset.min;
  const max = element.dataset.max;
  const step = element.dataset.step ? Number(element.dataset.step) : undefined;

  if (isRangeMode(mode)) {
    const rangeMode = mode as DatePickerRangeMode;
    const name = element.dataset.name ?? "date";
    const startName = element.dataset.startName ?? `${name}_start`;
    const endName = element.dataset.endName ?? `${name}_end`;
    const startPlaceholder = element.dataset.startPlaceholder;
    const endPlaceholder = element.dataset.endPlaceholder;
    const startValue = element.querySelector<HTMLInputElement>(START_INPUT_SELECTOR)?.value;
    const endValue = element.querySelector<HTMLInputElement>(END_INPUT_SELECTOR)?.value;

    return {
      mode: rangeMode,
      name,
      startName,
      endName,
      size,
      required,
      disabled,
      min,
      max,
      step,
      startPlaceholder,
      endPlaceholder,
      defaultValue: { start: startValue ?? "", end: endValue ?? "" },
      label: element.querySelector<HTMLLabelElement>(".date-picker__label")?.textContent ?? undefined,
      helperText: element.querySelector<HTMLParagraphElement>(HELPER_SELECTOR)?.textContent ?? undefined,
    };
  }

  const name = element.dataset.name ?? "date";
  const placeholder = element.dataset.placeholder;
  const inputValue = element.querySelector<HTMLInputElement>(SINGLE_INPUT_SELECTOR)?.value;
  const singleMode = mode as DatePickerSingleMode;

  return {
    mode: singleMode,
    name,
    size,
    required,
    disabled,
    min,
    max,
    step,
    placeholder,
    defaultValue: inputValue ?? "",
    label: element.querySelector<HTMLLabelElement>(".date-picker__label")?.textContent ?? undefined,
    helperText: element.querySelector<HTMLParagraphElement>(HELPER_SELECTOR)?.textContent ?? undefined,
  };
};

export const hydrateDatePicker = (
  element: HTMLDivElement,
  options: DatePickerHydrationOptions = {},
  content: DatePickerContentOptions | undefined = undefined,
): DatePickerElement => {
  const inferred = content ?? inferContentOptions(element);
  return attachBehavior(element, inferred, options);
};
