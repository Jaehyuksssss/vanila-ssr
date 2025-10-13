import {
  createElementFromMarkup,
  isBrowser,
  joinClassNames,
  setComponentAttr,
} from "../utils/dom";

const COMPONENT_NAME = "banner";
const TITLE_SELECTOR = "[data-banner-title]";
const MESSAGE_SELECTOR = "[data-banner-message]";
const ACTION_SELECTOR = "[data-banner-action]";
const DISMISS_SELECTOR = "[data-banner-dismiss]";

export type BannerVariant = "info" | "success" | "warning" | "error";
export type BannerActionVariant = "primary" | "secondary" | "link";

export interface BannerAction {
  label: string;
  href?: string;
  target?: string;
  rel?: string;
  variant?: BannerActionVariant;
  id?: string;
}

export interface BannerContentOptions {
  title?: string;
  message: string;
  description?: string;
  variant?: BannerVariant;
  dismissible?: boolean;
  actions?: BannerAction[];
  className?: string | string[];
  id?: string;
  ariaLive?: "polite" | "assertive";
}

export interface BannerBehaviorOptions {
  onDismiss?: (event: Event) => void;
  onAction?: (action: BannerAction, event: Event) => void;
}

export type BannerOptions = BannerContentOptions & BannerBehaviorOptions;

export interface BannerMarkupOptions extends BannerContentOptions {
  includeDataAttributes?: boolean;
}

export type BannerHydrationOptions = BannerBehaviorOptions;

export interface BannerElement extends HTMLDivElement {
  close: (event?: Event) => void;
  setVariant: (variant: BannerVariant) => void;
  setMessage: (message: string) => void;
  setTitle: (title: string | null) => void;
  setDismissible: (dismissible: boolean) => void;
}

const DEFAULT_VARIANT: BannerVariant = "info";

const resolveRole = (variant: BannerVariant): "status" | "alert" => {
  return variant === "error" || variant === "warning" ? "alert" : "status";
};

const resolveAriaLive = (variant: BannerVariant, explicit?: "polite" | "assertive"): "polite" | "assertive" => {
  if (explicit) {
    return explicit;
  }
  return variant === "error" || variant === "warning" ? "assertive" : "polite";
};

const renderAction = (action: BannerAction, index: number): string => {
  const variant = action.variant ?? "secondary";
  const baseClass = `banner__action banner__action--${variant}`;
  const idAttr = action.id ? ` id="${action.id}"` : "";

  if (action.href) {
    const relAttr = action.rel ? ` rel="${action.rel}"` : "";
    const targetAttr = action.target ? ` target="${action.target}"` : "";
    return `
      <a
        href="${action.href}"
        class="${baseClass}"
        data-banner-action="${index}"
        ${idAttr}
        ${relAttr}
        ${targetAttr}
      >
        ${action.label}
      </a>
    `;
  }

  return `
    <button
      type="button"
      class="${baseClass}"
      data-banner-action="${index}"
      ${idAttr}
    >
      ${action.label}
    </button>
  `;
};

export const renderBannerMarkup = ({
  includeDataAttributes = true,
  ...options
}: BannerMarkupOptions): string => {
  const variant = options.variant ?? DEFAULT_VARIANT;
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";
  const wrapperClass = joinClassNames("banner", `banner--${variant}`, options.className);
  const role = resolveRole(variant);
  const ariaLive = resolveAriaLive(variant, options.ariaLive);
  const idAttr = options.id ? ` id="${options.id}"` : "";
  const dismissibleAttr = options.dismissible ? ` data-dismissible="true"` : ` data-dismissible="false"`;

  const titleMarkup = options.title
    ? `<strong class="banner__title" data-banner-title>${options.title}</strong>`
    : "";

  const descriptionMarkup = options.description
    ? `<p class="banner__description">${options.description}</p>`
    : "";

  const actionsMarkup = options.actions && options.actions.length > 0
    ? `<div class="banner__actions">${options.actions.map((action, index) => renderAction(action, index)).join("")}</div>`
    : "";

  const dismissMarkup = options.dismissible
    ? `<button type="button" class="banner__dismiss" aria-label="닫기" data-banner-dismiss>×</button>`
    : "";

  return `
    <div
      class="${wrapperClass}"
      role="${role}"
      aria-live="${ariaLive}"
      data-variant="${variant}"
      ${dataAttr}
      ${idAttr}
      ${dismissibleAttr}
    >
      <div class="banner__body">
        ${titleMarkup}
        <p class="banner__message" data-banner-message>${options.message}</p>
        ${descriptionMarkup}
      </div>
      ${actionsMarkup}
      ${dismissMarkup}
    </div>
  `;
};

const attachBehavior = (
  element: HTMLDivElement,
  content: BannerContentOptions,
  behavior: BannerHydrationOptions = {},
): BannerElement => {
  const variant = content.variant ?? DEFAULT_VARIANT;
  setComponentAttr(element, COMPONENT_NAME);
  element.dataset.variant = variant;
  element.dataset.dismissible = content.dismissible ? "true" : "false";
  element.classList.add("banner", `banner--${variant}`);

  const titleElement = element.querySelector<HTMLElement>(TITLE_SELECTOR);
  const messageElement = element.querySelector<HTMLElement>(MESSAGE_SELECTOR);
  const dismissButton = element.querySelector<HTMLButtonElement>(DISMISS_SELECTOR);

  const actions = Array.from(element.querySelectorAll<HTMLElement>(ACTION_SELECTOR));
  let isClosed = false;

  const finalizeDismiss = (event?: Event) => {
    if (isClosed) {
      return;
    }
    isClosed = true;
    behavior.onDismiss?.(event ?? new Event("dismiss"));
  };

  const close = (event?: Event) => {
    if (isClosed) {
      return;
    }
    element.classList.add("banner--closing");
    const remove = () => {
      finalizeDismiss(event);
      element.remove();
      element.removeEventListener("transitionend", remove);
    };
    element.addEventListener("transitionend", remove, { once: true });
    window.setTimeout(remove, 250);
  };

  actions.forEach((actionElement, index) => {
    const handleAction = (event: Event) => {
      behavior.onAction?.(content.actions?.[index] ?? { label: actionElement.textContent ?? "" }, event);
      if (content.dismissible && actionElement.tagName === "A") {
        // allow anchor navigation unless preventDefault externally
        // no-op
      }
    };
    actionElement.addEventListener("click", handleAction);
  });

  if (dismissButton) {
    dismissButton.addEventListener("click", close);
  }

  const setVariant = (nextVariant: BannerVariant) => {
    ["info", "success", "warning", "error"].forEach((value) => {
      element.classList.remove(`banner--${value}`);
    });
    element.classList.add(`banner--${nextVariant}`);
    element.dataset.variant = nextVariant;
    element.setAttribute("role", resolveRole(nextVariant));
    element.setAttribute("aria-live", resolveAriaLive(nextVariant, content.ariaLive));
  };

  const setMessage = (message: string) => {
    if (messageElement) {
      messageElement.textContent = message;
    }
  };

  const setTitle = (title: string | null) => {
    if (!titleElement) {
      if (title) {
        const body = element.querySelector(".banner__body");
        if (body) {
          const strong = document.createElement("strong");
          strong.className = "banner__title";
          strong.setAttribute("data-banner-title", "");
          strong.textContent = title;
          body.prepend(strong);
        }
      }
      return;
    }
    if (title) {
      titleElement.textContent = title;
      titleElement.hidden = false;
    } else {
      titleElement.textContent = "";
      titleElement.hidden = true;
    }
  };

  const setDismissible = (dismissible: boolean) => {
    element.dataset.dismissible = dismissible ? "true" : "false";
    if (dismissible && !element.querySelector(DISMISS_SELECTOR)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "banner__dismiss";
      button.setAttribute("aria-label", "닫기");
      button.dataset.bannerDismiss = "";
      button.textContent = "×";
      button.addEventListener("click", close);
      element.appendChild(button);
    } else if (!dismissible) {
      element.querySelector(DISMISS_SELECTOR)?.remove();
    }
  };

  Object.defineProperties(element, {
    close: {
      value: close,
      configurable: true,
      enumerable: false,
    },
    setVariant: {
      value: setVariant,
      configurable: true,
      enumerable: false,
    },
    setMessage: {
      value: setMessage,
      configurable: true,
      enumerable: false,
    },
    setTitle: {
      value: setTitle,
      configurable: true,
      enumerable: false,
    },
    setDismissible: {
      value: setDismissible,
      configurable: true,
      enumerable: false,
    },
  });

  return element as BannerElement;
};

export const createBanner = (options: BannerOptions): BannerElement => {
  if (!isBrowser) {
    throw new Error("createBanner requires a browser environment.");
  }

  const { onDismiss, onAction, ...content } = options;
  const markup = renderBannerMarkup(content);
  const element = createElementFromMarkup<HTMLDivElement>(markup);
  return attachBehavior(element, content, { onDismiss, onAction });
};

const inferContentOptions = (element: HTMLDivElement): BannerContentOptions => {
  const variant = (element.dataset.variant as BannerVariant | undefined) ?? DEFAULT_VARIANT;
  const dismissible = element.dataset.dismissible === "true";
  const title = element.querySelector<HTMLElement>(TITLE_SELECTOR)?.textContent ?? undefined;
  const message = element.querySelector<HTMLElement>(MESSAGE_SELECTOR)?.textContent ?? "";
  const actions = Array.from(element.querySelectorAll<HTMLElement>(ACTION_SELECTOR)).map<BannerAction>((action) => ({
    label: action.textContent?.trim() ?? "",
    href: action instanceof HTMLAnchorElement ? action.getAttribute("href") ?? undefined : undefined,
    target: action instanceof HTMLAnchorElement ? action.getAttribute("target") ?? undefined : undefined,
    rel: action instanceof HTMLAnchorElement ? action.getAttribute("rel") ?? undefined : undefined,
    variant: (Array.from(action.classList).find((className) => className.startsWith("banner__action--"))?.replace("banner__action--", "") as BannerActionVariant | undefined) ?? "secondary",
  }));

  return {
    title,
    message,
    variant,
    dismissible,
    actions,
    ariaLive: (element.getAttribute("aria-live") as "polite" | "assertive" | null) ?? undefined,
  };
};

export const hydrateBanner = (
  element: HTMLDivElement,
  options: BannerHydrationOptions = {},
  content: BannerContentOptions | undefined = undefined,
): BannerElement => {
  const resolvedContent = content ?? inferContentOptions(element);
  return attachBehavior(element, resolvedContent, options);
};
