import {
  createElementFromMarkup,
  createId,
  isBrowser,
  joinClassNames,
  setComponentAttr,
} from "../utils/dom";

const COMPONENT_NAME = "file-uploader";
const INPUT_SELECTOR = "[data-uploader-input]";
const DROPZONE_SELECTOR = "[data-uploader-dropzone]";
const LIST_SELECTOR = "[data-uploader-list]";
const ERROR_SELECTOR = "[data-uploader-error]";
const HELPER_SELECTOR = "[data-uploader-helper]";
const REMOVE_SELECTOR = "[data-uploader-remove]";

type FileIdentifier = string;

export type FileUploaderSize = "md" | "lg";

export interface FileUploaderError {
  type: "max-files-exceeded" | "file-too-large" | "duplicate-file";
  file: File;
  message: string;
}

export interface FileUploaderContentOptions {
  name: string;
  label: string;
  helperText?: string;
  dropLabel?: string;
  buttonLabel?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  required?: boolean;
  disabled?: boolean;
  size?: FileUploaderSize;
  className?: string | string[];
  id?: string;
}

export interface FileUploaderBehaviorOptions {
  onFilesChange?: (files: File[], event: Event) => void;
  onFileRemove?: (file: File, index: number, event: Event) => void;
  onError?: (error: FileUploaderError, event: Event) => void;
}

export type FileUploaderOptions = FileUploaderContentOptions & FileUploaderBehaviorOptions;

export interface FileUploaderMarkupOptions extends FileUploaderContentOptions {
  includeDataAttributes?: boolean;
}

export type FileUploaderHydrationOptions = FileUploaderBehaviorOptions;

export interface FileUploaderElement extends HTMLDivElement {
  getFiles: () => File[];
  setFiles: (files: File[] | FileList) => void;
  clear: () => void;
  setDisabled: (disabled: boolean) => void;
  setError: (message: string | null) => void;
  removeFile: (index: number) => void;
}

const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, exponent);
  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const toIdentifier = (file: File): FileIdentifier => {
  return `${file.name}-${file.size}-${file.type}-${file.lastModified}`;
};

const renderFileListItem = (file: File, index: number): string => {
  return `
    <li class="file-uploader__item">
      <div class="file-uploader__file">
        <span class="file-uploader__file-name">${file.name}</span>
        <span class="file-uploader__file-size">${formatFileSize(file.size)}</span>
      </div>
      <button type="button" class="file-uploader__remove" data-uploader-remove="${index}" aria-label="${file.name} 삭제">
        ×
      </button>
    </li>
  `;
};

export const renderFileUploaderMarkup = ({
  includeDataAttributes = true,
  ...options
}: FileUploaderMarkupOptions): string => {
  const {
    label,
    name,
    helperText,
    dropLabel = "파일을 이곳에 드롭하거나 업로드 버튼을 클릭하세요",
    buttonLabel = "파일 선택",
    accept,
    multiple,
    maxFiles,
    maxFileSize,
    required,
    disabled,
    size = "md",
    className,
    id,
  } = options;

  const inputId = id ?? createId("vanila-uploader");
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";
  const wrapperClasses = joinClassNames("file-uploader", `file-uploader--${size}`, className);
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const helperMarkup = helperText
    ? `<p class="file-uploader__helper" id="${helperId}" data-uploader-helper>${helperText}</p>`
    : "";
  const errorMarkup = `<p class="file-uploader__error" data-uploader-error hidden></p>`;

  const acceptAttr = accept ? ` accept="${accept}"` : "";
  const multipleAttr = multiple ? " multiple" : "";
  const requiredAttr = required ? " required" : "";
  const disabledAttr = disabled ? " disabled" : "";
  const describedbyAttr = helperId ? ` aria-describedby="${helperId}"` : "";

  const dataset = `
    data-multiple="${multiple ? "true" : "false"}"
    data-max-files="${maxFiles ?? ""}"
    data-max-file-size="${maxFileSize ?? ""}"
    data-size="${size}"
    data-disabled="${disabled ? "true" : "false"}"
  `;

  return `
    <div class="${wrapperClasses}" ${dataAttr} ${dataset}>
      <label class="file-uploader__label" for="${inputId}">
        ${label}${required ? ' <span class="file-uploader__required">*</span>' : ""}
      </label>
      <div class="file-uploader__dropzone${disabled ? " file-uploader__dropzone--disabled" : ""}" data-uploader-dropzone>
        <input
          type="file"
          id="${inputId}"
          class="file-uploader__input"
          name="${name}${multiple ? "[]" : ""}"
          data-uploader-input
          ${acceptAttr}
          ${multipleAttr}
          ${requiredAttr}
          ${disabledAttr}
          ${describedbyAttr}
        />
        <div class="file-uploader__prompt">
          <span class="file-uploader__drop-label">${dropLabel}</span>
          <button type="button" class="file-uploader__button" data-uploader-trigger ${disabled ? "disabled" : ""}>
            ${buttonLabel}
          </button>
        </div>
      </div>
      <ul class="file-uploader__list" data-uploader-list></ul>
      ${helperMarkup}
      ${errorMarkup}
    </div>
  `;
};

const syncInputFiles = (input: HTMLInputElement, files: File[]) => {
  if (typeof DataTransfer === "undefined") {
    return;
  }
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
};

const attachBehavior = (
  element: HTMLDivElement,
  content: FileUploaderContentOptions,
  behavior: FileUploaderHydrationOptions = {},
): FileUploaderElement => {
  setComponentAttr(element, COMPONENT_NAME);

  const input = element.querySelector<HTMLInputElement>(INPUT_SELECTOR);
  const dropzone = element.querySelector<HTMLDivElement>(DROPZONE_SELECTOR);
  const list = element.querySelector<HTMLUListElement>(LIST_SELECTOR);
  const errorElement = element.querySelector<HTMLParagraphElement>(ERROR_SELECTOR);
  const triggerButton = element.querySelector<HTMLButtonElement>("[data-uploader-trigger]");

  if (!input || !dropzone || !list) {
    throw new Error("File uploader markup is invalid.");
  }

  const multiple = content.multiple ?? false;
  const maxFiles = content.maxFiles;
  const maxFileSize = content.maxFileSize;

  let files: File[] = [];
  const fileIds = new Set<FileIdentifier>();

  const renderList = () => {
    list.innerHTML = files.map((file, index) => renderFileListItem(file, index)).join("");
  };

  const emitChange = (event: Event) => {
    behavior.onFilesChange?.([...files], event);
  };

  const emitRemove = (file: File, index: number, event: Event) => {
    behavior.onFileRemove?.(file, index, event);
  };

  const emitError = (file: File, type: FileUploaderError["type"], event: Event) => {
    const messages: Record<FileUploaderError["type"], string> = {
      "max-files-exceeded": "업로드 가능한 파일 수를 초과했습니다.",
      "file-too-large": "허용된 파일 크기를 초과했습니다.",
      "duplicate-file": "이미 추가된 파일입니다.",
    };
    behavior.onError?.(
      {
        file,
        type,
        message: messages[type],
      },
      event,
    );
    setError(messages[type]);
  };

  const clearError = () => {
    setError(null);
  };

  const addFiles = (candidates: Iterable<File>, event: Event) => {
    clearError();

    let updated = false;

    for (const file of candidates) {
      const identifier = toIdentifier(file);

      if (fileIds.has(identifier)) {
        emitError(file, "duplicate-file", event);
        continue;
      }

      if (maxFileSize && file.size > maxFileSize) {
        emitError(file, "file-too-large", event);
        continue;
      }

      if (!multiple && files.length >= 1) {
        files = [file];
        fileIds.clear();
        fileIds.add(identifier);
        updated = true;
        break;
      }

      if (maxFiles && files.length >= maxFiles) {
        emitError(file, "max-files-exceeded", event);
        continue;
      }

      files.push(file);
      fileIds.add(identifier);
      updated = true;
    }

    if (updated) {
      syncInputFiles(input, files);
      renderList();
      emitChange(event);
    } else {
      syncInputFiles(input, files);
      renderList();
    }
  };

  const handleInputChange = (event: Event) => {
    const selected = Array.from(input.files ?? []);
    addFiles(selected, event);
    input.value = "";
  };

  const handleRemove = (event: Event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(REMOVE_SELECTOR);
    if (!target) {
      return;
    }
    const index = Number.parseInt(target.dataset.uploaderRemove ?? "", 10);
    if (Number.isNaN(index) || index < 0 || index >= files.length) {
      return;
    }
    const [removed] = files.splice(index, 1);
    fileIds.delete(toIdentifier(removed));
    syncInputFiles(input, files);
    renderList();
    emitRemove(removed, index, event);
    emitChange(event);
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (element.dataset.disabled === "true") {
      return;
    }
    dropzone.classList.add("file-uploader__dropzone--active");
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    dropzone.classList.remove("file-uploader__dropzone--active");
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    dropzone.classList.remove("file-uploader__dropzone--active");
    if (element.dataset.disabled === "true") {
      return;
    }
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    if (dropped.length > 0) {
      addFiles(dropped, event);
    }
  };

  const handleTriggerClick = () => {
    if (element.dataset.disabled === "true") {
      return;
    }
    input.click();
  };

  input.addEventListener("change", handleInputChange);
  list.addEventListener("click", handleRemove);
  dropzone.addEventListener("dragover", handleDragOver);
  dropzone.addEventListener("dragleave", handleDragLeave);
  dropzone.addEventListener("drop", handleDrop);
  triggerButton?.addEventListener("click", handleTriggerClick);

  if (content.disabled) {
    element.dataset.disabled = "true";
    input.disabled = true;
    triggerButton?.setAttribute("disabled", "true");
  }

  const getFiles = () => [...files];

  const setFiles = (value: File[] | FileList) => {
    files = Array.from(value);
    fileIds.clear();
    files.forEach((file) => fileIds.add(toIdentifier(file)));
    syncInputFiles(input, files);
    renderList();
    emitChange(new Event("change"));
  };

  const clear = () => {
    files = [];
    fileIds.clear();
    input.value = "";
    syncInputFiles(input, files);
    renderList();
    emitChange(new Event("change"));
    clearError();
  };

  const setDisabled = (disabled: boolean) => {
    element.dataset.disabled = disabled ? "true" : "false";
    input.disabled = disabled;
    if (disabled) {
      dropzone.classList.add("file-uploader__dropzone--disabled");
      triggerButton?.setAttribute("disabled", "true");
    } else {
      dropzone.classList.remove("file-uploader__dropzone--disabled");
      triggerButton?.removeAttribute("disabled");
    }
  };

  const setError = (message: string | null) => {
    if (!errorElement) {
      return;
    }
    if (message) {
      errorElement.textContent = message;
      errorElement.hidden = false;
      dropzone.classList.add("file-uploader__dropzone--error");
      input.setAttribute("aria-invalid", "true");
    } else {
      errorElement.textContent = "";
      errorElement.hidden = true;
      dropzone.classList.remove("file-uploader__dropzone--error");
      input.removeAttribute("aria-invalid");
    }
  };

  const removeFile = (index: number) => {
    if (index < 0 || index >= files.length) {
      return;
    }
    const [removed] = files.splice(index, 1);
    fileIds.delete(toIdentifier(removed));
    syncInputFiles(input, files);
    renderList();
    emitRemove(removed, index, new Event("remove"));
    emitChange(new Event("change"));
  };

  Object.defineProperties(element, {
    getFiles: {
      value: getFiles,
      configurable: true,
      enumerable: false,
    },
    setFiles: {
      value: setFiles,
      configurable: true,
      enumerable: false,
    },
    clear: {
      value: clear,
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
    removeFile: {
      value: removeFile,
      configurable: true,
      enumerable: false,
    },
  });

  return element as FileUploaderElement;
};

export const createFileUploader = (options: FileUploaderOptions): FileUploaderElement => {
  if (!isBrowser) {
    throw new Error("createFileUploader requires a browser environment.");
  }
  const { onFilesChange, onFileRemove, onError, ...content } = options;
  const markup = renderFileUploaderMarkup(content);
  const element = createElementFromMarkup<HTMLDivElement>(markup);
  return attachBehavior(element, content, { onFilesChange, onFileRemove, onError });
};

const inferContentOptions = (element: HTMLDivElement): FileUploaderContentOptions => {
  const input = element.querySelector<HTMLInputElement>(INPUT_SELECTOR);
  return {
    name: input?.name?.replace(/\[\]$/, "") ?? "files",
    label: element.querySelector<HTMLLabelElement>(".file-uploader__label")?.textContent?.trim() ?? "파일 업로드",
    helperText: element.querySelector<HTMLParagraphElement>(HELPER_SELECTOR)?.textContent ?? undefined,
    dropLabel: element.querySelector<HTMLSpanElement>(".file-uploader__drop-label")?.textContent ?? undefined,
    buttonLabel: element.querySelector<HTMLButtonElement>("[data-uploader-trigger]")?.textContent ?? undefined,
    accept: input?.getAttribute("accept") ?? undefined,
    multiple: element.dataset.multiple === "true",
    maxFiles: element.dataset.maxFiles ? Number.parseInt(element.dataset.maxFiles, 10) : undefined,
    maxFileSize: element.dataset.maxFileSize ? Number.parseInt(element.dataset.maxFileSize, 10) : undefined,
    required: input?.required,
    disabled: element.dataset.disabled === "true",
    size: (element.dataset.size as FileUploaderSize | undefined) ?? "md",
  };
};

export const hydrateFileUploader = (
  element: HTMLDivElement,
  options: FileUploaderHydrationOptions = {},
  content: FileUploaderContentOptions | undefined = undefined,
): FileUploaderElement => {
  const resolved = content ?? inferContentOptions(element);
  return attachBehavior(element, resolved, options);
};
