import { createElementFromMarkup, isBrowser, setComponentAttr } from "../utils/dom";

const COMPONENT_NAME = "card";
const DEFAULT_CARD_BUTTON_TEXT = "자세히 보기";

interface CardContentConfig {
  title: string;
  description: string;
  imageUrl?: string;
  buttonText?: string;
}

export interface CardOptions extends CardContentConfig {
  onButtonClick?: (event: MouseEvent) => void;
}

export interface CardMarkupOptions extends CardContentConfig {
  includeDataAttributes?: boolean;
}

export type CardHydrationOptions = Pick<CardOptions, "onButtonClick">;

export interface CardElement extends HTMLDivElement {}

const resolveContainer = (target: string | HTMLElement): HTMLElement | null => {
  if (typeof target === "string") {
    return document.getElementById(target) ?? document.querySelector<HTMLElement>(target);
  }
  return target;
};

const renderImageMarkup = (imageUrl?: string): string => {
  if (!imageUrl) {
    return '<div class="card-image"></div>';
  }

  return `<div class="card-image" style="background-image: url('${imageUrl}');"></div>`;
};

export const renderCardMarkup = ({
  title,
  description,
  imageUrl,
  buttonText,
  includeDataAttributes = true,
}: CardMarkupOptions): string => {
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";

  return `
  <div class="card"${dataAttr}>
    ${renderImageMarkup(imageUrl)}
    <div class="card-content">
      <h3 class="card-title">${title}</h3>
      <p class="card-description">${description}</p>
      <button type="button" class="card-button" data-vanila-card-button>${buttonText ?? DEFAULT_CARD_BUTTON_TEXT}</button>
    </div>
  </div>
  `;
};

const attachBehavior = (card: HTMLDivElement, options: CardHydrationOptions): void => {
  setComponentAttr(card, COMPONENT_NAME);

  const button = card.querySelector<HTMLButtonElement>('[data-vanila-card-button]');
  if (button && options.onButtonClick) {
    button.addEventListener("click", options.onButtonClick);
  }
};

export const createCard = (options: CardOptions): CardElement => {
  if (!isBrowser) {
    throw new Error("createCard requires a browser environment.");
  }

  const markup = renderCardMarkup(options);
  const card = createElementFromMarkup<HTMLDivElement>(markup) as CardElement;
  attachBehavior(card, options);
  return card;
};

export const hydrateCard = (card: HTMLDivElement, options: CardHydrationOptions = {}): CardElement => {
  attachBehavior(card, options);
  return card as CardElement;
};

export const renderCard = (options: CardOptions, container: string | HTMLElement): CardElement => {
  if (!isBrowser) {
    throw new Error("renderCard can only be used in a browser environment.");
  }

  const host = resolveContainer(container);
  if (!host) {
    throw new Error("Container not found for renderCard.");
  }

  const card = createCard(options);
  host.appendChild(card);
  return card;
};

export const renderCards = (cards: CardOptions[], container: string | HTMLElement): CardElement[] => {
  if (!isBrowser) {
    throw new Error("renderCards can only be used in a browser environment.");
  }

  const host = resolveContainer(container);
  if (!host) {
    throw new Error("Container not found for renderCards.");
  }

  host.innerHTML = "";

  return cards.map((cardOptions) => {
    const card = createCard(cardOptions);
    host.appendChild(card);
    return card;
  });
};

export const bindCardClickEvents = (
  container: string | HTMLElement,
  onClick: (title: string, event: MouseEvent) => void,
): void => {
  if (!isBrowser) {
    return;
  }

  const host = resolveContainer(container);
  if (!host) {
    throw new Error("Container not found for bindCardClickEvents.");
  }

  host.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (!target || !target.matches("[data-vanila-card-button]")) {
      return;
    }

    const card = target.closest("[data-vanila-component='card']") ?? target.closest(".card");
    const title = card?.querySelector<HTMLElement>(".card-title")?.textContent ?? "";
    onClick(title, event as MouseEvent);
  });
};
