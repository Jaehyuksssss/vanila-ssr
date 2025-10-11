export interface ComponentBaseOptions {
  id?: string;
  className?: string;
  ariaLabel?: string;
}

export const getBaseAttributes = ({ id, className, ariaLabel }: ComponentBaseOptions = {}): string => {
  const attrs: string[] = [];
  if (id) {
    attrs.push(` id="${id}"`);
  }
  if (className) {
    attrs.push(` class="${className}"`);
  }
  if (ariaLabel) {
    attrs.push(` aria-label="${ariaLabel}"`);
  }
  return attrs.join("");
};

export const applyBaseOptions = (
  element: HTMLElement,
  options: ComponentBaseOptions | undefined,
): void => {
  if (!options) {
    return;
  }

  if (options.id) {
    element.id = options.id;
  }

  if (options.className) {
    element.classList.add(...options.className.split(" ").filter(Boolean));
  }

  if (options.ariaLabel) {
    element.setAttribute("aria-label", options.ariaLabel);
  }
};
