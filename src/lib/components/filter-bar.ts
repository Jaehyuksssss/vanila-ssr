import { createElementFromMarkup, isBrowser, setComponentAttr } from "../utils/dom";

const COMPONENT_NAME = "filter-bar";

export type FilterLayout = "inline" | "stacked";

interface FilterFieldBase {
  name: string;
  label: string;
  width?: string;
  helperText?: string;
  placeholder?: string;
}

export interface TextFilterField extends FilterFieldBase {
  type: "text" | "search";
  placeholder?: string;
  defaultValue?: string;
  maxLength?: number;
}

export interface NumberFilterField extends FilterFieldBase {
  type: "number";
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface DateFilterField extends FilterFieldBase {
  type: "date" | "datetime-local";
  defaultValue?: string;
  min?: string;
  max?: string;
}

export interface SelectFilterField extends FilterFieldBase {
  type: "select";
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  defaultValue?: string | string[];
  multiple?: boolean;
}

export type FilterField = TextFilterField | NumberFilterField | DateFilterField | SelectFilterField;

export interface FilterBarAppearanceOptions {
  layout?: FilterLayout;
  gap?: string;
  submitLabel?: string;
  resetLabel?: string;
}

export interface FilterBarBehaviorOptions {
  autoSubmit?: boolean;
  onSubmit?: (values: Record<string, unknown>, event: SubmitEvent) => void;
  onReset?: (event: Event) => void;
}

export type FilterBarOptions = {
  fields: FilterField[];
} & FilterBarAppearanceOptions &
  FilterBarBehaviorOptions;

export interface FilterBarMarkupOptions extends FilterBarAppearanceOptions {
  fields: FilterField[];
  includeDataAttributes?: boolean;
}

export type FilterBarHydrationOptions = FilterBarAppearanceOptions & FilterBarBehaviorOptions;

export interface FilterBarElement extends HTMLFormElement {
  getValues: () => Record<string, unknown>;
  setValues: (values: Record<string, unknown>) => void;
}

const escapeAttribute = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).replace(/"/g, "&quot;");
};

const renderHelperText = (helper?: string): string => {
  if (!helper) {
    return "";
  }
  return `<span class="filter-field__helper">${helper}</span>`;
};

const renderTextInput = (field: TextFilterField | NumberFilterField | DateFilterField): string => {
  const attributes: string[] = [
    `name="${field.name}"`,
    `id="filter-${field.name}"`,
    `type="${field.type}"`,
  ];

  if (field.placeholder) {
    attributes.push(`placeholder="${escapeAttribute(field.placeholder)}"`);
  }

  if (field.defaultValue !== undefined) {
    attributes.push(`value="${escapeAttribute(field.defaultValue)}"`);
  }

  if ("maxLength" in field && field.maxLength !== undefined) {
    attributes.push(`maxlength="${field.maxLength}"`);
  }

  if (field.type === "number") {
    if (field.min !== undefined) {
      attributes.push(`min="${field.min}"`);
    }
    if (field.max !== undefined) {
      attributes.push(`max="${field.max}"`);
    }
    if (field.step !== undefined) {
      attributes.push(`step="${field.step}"`);
    }
  }

  if (field.type === "date" || field.type === "datetime-local") {
    if (field.min) {
      attributes.push(`min="${field.min}"`);
    }
    if (field.max) {
      attributes.push(`max="${field.max}"`);
    }
  }

  return `<input ${attributes.join(" ")} />`;
};

const renderSelectInput = (field: SelectFilterField): string => {
  const optionsMarkup = field.options
    .map((option) => `<option value="${escapeAttribute(option.value)}">${option.label}</option>`)
    .join("");

  const attrs = [
    `name="${field.name}${field.multiple ? "[]" : ""}"`,
    `id="filter-${field.name}"`,
    field.multiple ? "multiple" : "",
    field.placeholder ? `data-placeholder="${escapeAttribute(field.placeholder)}"` : "",
    field.defaultValue !== undefined ? `data-default-value="${escapeAttribute(JSON.stringify(field.defaultValue))}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const placeholderOption = field.placeholder && !field.multiple ? `<option value="">${field.placeholder}</option>` : "";

  return `<select ${attrs}>${placeholderOption}${optionsMarkup}</select>`;
};

const renderField = (field: FilterField): string => {
  const control =
    field.type === "select" ? renderSelectInput(field) : renderTextInput(field as TextFilterField | NumberFilterField | DateFilterField);

  const widthStyle = field.width ? ` style="--field-width: ${field.width};"` : "";

  return `
    <div class="filter-field" data-field-name="${field.name}"${widthStyle}>
      <label class="filter-field__label" for="filter-${field.name}">${field.label}</label>
      ${control}
      ${renderHelperText(field.helperText)}
    </div>
  `;
};

export const renderFilterBarMarkup = ({
  fields,
  layout = "inline",
  gap,
  submitLabel = "검색",
  resetLabel = "초기화",
  includeDataAttributes = true,
}: FilterBarMarkupOptions): string => {
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";
  const gapStyle = gap ? ` style="--filter-gap: ${gap};"` : "";
  const layoutAttr = ` data-layout="${layout}"`;

  return `
  <form class="filter-bar"${dataAttr}${gapStyle}${layoutAttr}>
    <div class="filter-bar__fields">
      ${fields.map((field) => renderField(field)).join("")}
    </div>
    <div class="filter-bar__actions">
      <button type="submit" class="btn-primary filter-bar__submit">${submitLabel}</button>
      <button type="reset" class="btn-secondary filter-bar__reset">${resetLabel}</button>
    </div>
  </form>
  `;
};

const extractValues = (form: HTMLFormElement): Record<string, unknown> => {
  const formData = new FormData(form);
  const result: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (key.endsWith("[]")) {
      const actualKey = key.slice(0, -2);
      if (!result[actualKey]) {
        result[actualKey] = [] as unknown[];
      }
      (result[actualKey] as unknown[]).push(value);
    } else if (result[key] !== undefined) {
      const current = result[key];
      if (Array.isArray(current)) {
        current.push(value);
      } else {
        result[key] = [current, value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
};

const setFormValues = (form: HTMLFormElement, values: Record<string, unknown>) => {
  Object.entries(values).forEach(([key, value]) => {
    const field = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | null;
    if (!field) {
      return;
    }

    if (field instanceof HTMLSelectElement && field.multiple && Array.isArray(value)) {
      const valueSet = new Set(value.map(String));
      Array.from(field.options).forEach((option) => {
        option.selected = valueSet.has(option.value);
      });
    } else if (field instanceof HTMLSelectElement) {
      field.value = String(value ?? "");
    } else {
      field.value = String(value ?? "");
    }
  });
};

const applyDefaultSelectValues = (form: HTMLFormElement) => {
  const selects = form.querySelectorAll<HTMLSelectElement>("select[data-default-value]");
  selects.forEach((select) => {
    try {
      const raw = select.getAttribute("data-default-value");
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (select.multiple && Array.isArray(parsed)) {
        const valueSet = new Set(parsed.map(String));
        Array.from(select.options).forEach((option) => {
          option.selected = valueSet.has(option.value);
        });
      } else {
        select.value = String(parsed);
      }
    } catch (error) {
      console.warn("Failed to parse default select value", error);
    }
  });
};

const attachBehavior = (form: HTMLFormElement, options: FilterBarHydrationOptions = {}): void => {
  setComponentAttr(form, COMPONENT_NAME);

  if (options.gap) {
    form.style.setProperty("--filter-gap", options.gap);
  }

  if (options.layout) {
    form.dataset.layout = options.layout;
  }

  applyDefaultSelectValues(form);

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    options.onSubmit?.(extractValues(form), event);
  };

  const handleReset = (_event: Event) => {
    setTimeout(() => {
      applyDefaultSelectValues(form);
      options.onReset?.(_event);
    });
  };

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", handleReset);

  if (options.autoSubmit) {
    form.addEventListener("change", (_event) => {
      const submitEvent = new SubmitEvent("submit", { cancelable: true });
      form.dispatchEvent(submitEvent);
      if (!submitEvent.defaultPrevented) {
        options.onSubmit?.(extractValues(form), submitEvent);
      }
    });
  }

  Object.defineProperties(form, {
    getValues: {
      value: () => extractValues(form),
      writable: false,
      enumerable: false,
    },
    setValues: {
      value: (values: Record<string, unknown>) => setFormValues(form, values),
      writable: false,
      enumerable: false,
    },
  });
};

export const createFilterBar = (options: FilterBarOptions): FilterBarElement => {
  if (!isBrowser) {
    throw new Error("createFilterBar requires a browser environment.");
  }

  const markup = renderFilterBarMarkup({
    fields: options.fields,
    layout: options.layout,
    gap: options.gap,
    submitLabel: options.submitLabel,
    resetLabel: options.resetLabel,
  });

  const form = createElementFromMarkup<HTMLFormElement>(markup) as FilterBarElement;
  attachBehavior(form, options);
  return form;
};

export const hydrateFilterBar = (form: HTMLFormElement, options: FilterBarHydrationOptions = {}): FilterBarElement => {
  attachBehavior(form, options);
  return form as FilterBarElement;
};
