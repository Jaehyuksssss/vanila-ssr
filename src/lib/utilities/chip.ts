/**
 * Chip utility component
 * Provides interactive chip/tag elements with optional remove functionality
 * @module utilities/chip
 */

import { isBrowser } from "../utils/dom";

export interface ChipOptions {
  label: string;
  value?: string;
  removable?: boolean;
  className?: string;
}

export interface ChipElement extends HTMLSpanElement {
  getValue: () => string | undefined;
  remove: () => void;
}

/**
 * Renders a chip component markup
 * @param options - Chip configuration options
 * @returns HTML string for the chip
 *
 * @example
 * ```typescript
 * renderChip({ label: 'React', removable: true })
 * // <span class="vanila-chip" data-value="">
 * //   <span class="vanila-chip__label">React</span>
 * //   <button class="vanila-chip__remove" aria-label="Remove">×</button>
 * // </span>
 * ```
 */
export function renderChip(options: ChipOptions): string {
  const { label, value = "", removable = false, className = "" } = options;

  const classes = ["vanila-chip", className].filter(Boolean).join(" ");
  const removeButton = removable
    ? '<button class="vanila-chip__remove" type="button" aria-label="Remove">×</button>'
    : "";

  return `<span class="${classes}" data-value="${value}">${removeButton}<span class="vanila-chip__label">${label}</span></span>`;
}

/**
 * Creates an interactive chip element with remove functionality
 * @param options - Chip configuration options with onRemove callback
 * @returns ChipElement with enhanced methods
 *
 * @example
 * ```typescript
 * const chip = createChip({
 *   label: 'TypeScript',
 *   value: 'ts',
 *   removable: true,
 *   onRemove: (value) => console.log('Removed:', value)
 * });
 *
 * document.body.append(chip);
 * ```
 */
export function createChip(
  options: ChipOptions & { onRemove?: (value?: string) => void }
): ChipElement {
  if (!isBrowser) {
    throw new Error("createChip requires a browser environment.");
  }

  const { onRemove } = options;
  const markup = renderChip(options);

  const temp = document.createElement("div");
  temp.innerHTML = markup.trim();
  const chip = temp.firstChild as HTMLSpanElement;

  // Save original remove method
  const originalRemove = chip.remove.bind(chip);

  const removeButton = chip.querySelector(".vanila-chip__remove");
  if (removeButton && onRemove) {
    removeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = chip.getAttribute("data-value") || undefined;
      onRemove(value);
      originalRemove();
    });
  }

  // Enhanced methods
  const getValue = () => chip.getAttribute("data-value") || undefined;
  const removeChip = () => {
    originalRemove();
  };

  Object.defineProperty(chip, "getValue", {
    value: getValue,
    enumerable: false,
    configurable: true,
  });

  Object.defineProperty(chip, "remove", {
    value: removeChip,
    enumerable: false,
    configurable: true,
  });

  return chip as ChipElement;
}

/**
 * Renders multiple chips from an array of labels
 * @param labels - Array of chip labels
 * @param options - Common options for all chips
 * @returns HTML string with all chips
 */
export function renderChips(
  labels: string[],
  options?: Partial<ChipOptions>
): string {
  return labels.map((label) => renderChip({ ...options, label })).join("");
}
