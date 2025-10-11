import {
  applyRootAttributes,
  createElementFromMarkup,
  describeTarget,
  isBrowser,
  isElement,
  joinClassNames,
  resolveTargetElement,
  setComponentAttr,
} from "../utils/dom";

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
  id?: string;
  className?: string | string[];
}

export interface CardMarkupOptions extends CardContentConfig {
  includeDataAttributes?: boolean;
  id?: string;
  className?: string | string[];
}

export type CardHydrationOptions = Pick<CardOptions, "onButtonClick">;

export interface CardElement extends HTMLDivElement {}

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
  id,
  className,
}: CardMarkupOptions): string => {
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";
  const idAttr = id ? ` id="${id}"` : "";
  const classAttr = `class="${joinClassNames("card", className)}"`;

  return `
  <div ${classAttr}${idAttr}${dataAttr}>
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
  applyRootAttributes(card, { id: options.id, className: options.className });
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

  const host = resolveTargetElement(container);
  if (!host) {
    throw new Error(
      `[vanila-components] renderCard could not find a mounting container "${describeTarget(container)}".`,
    );
  }

  const card = createCard(options);
  host.appendChild(card);
  return card;
};

export interface RenderCardsOptions {
  cards: CardOptions[];
  container: string | HTMLElement;
  clearContainer?: boolean;
}

type RenderCardsFirstArgument = CardOptions[] | RenderCardsOptions | string | HTMLElement;
type RenderCardsSecondArgument = CardOptions[] | string | HTMLElement | undefined;

const isRenderCardsConfig = (value: unknown): value is RenderCardsOptions =>
  typeof value === "object" && value !== null && "cards" in value && "container" in value;

const isMountTarget = (value: unknown): value is string | HTMLElement =>
  typeof value === "string" || isElement(value);

const normalizeRenderCardsArgs = (
  first: RenderCardsFirstArgument,
  second?: RenderCardsSecondArgument,
): RenderCardsOptions => {
  if (Array.isArray(first) && isMountTarget(second)) {
    return {
      cards: first,
      container: second as string | HTMLElement,
      clearContainer: true,
    };
  }

  if (isRenderCardsConfig(first)) {
    if (!isMountTarget(first.container)) {
      throw new Error(
        "[vanila-components] renderCards options.container must be a selector string or HTMLElement.",
      );
    }
    return {
      cards: first.cards,
      container: first.container,
      clearContainer: first.clearContainer ?? true,
    };
  }

  if (isMountTarget(first) && Array.isArray(second)) {
    return {
      container: first as string | HTMLElement,
      cards: second,
      clearContainer: true,
    };
  }

  throw new Error(
    "[vanila-components] renderCards expects either (cards, container), (container, cards) or an options object { cards, container, clearContainer }.",
  );
};

export function renderCards(container: string | HTMLElement, cards: CardOptions[]): CardElement[];
export function renderCards(cards: CardOptions[], container: string | HTMLElement): CardElement[];
export function renderCards(options: RenderCardsOptions): CardElement[];
export function renderCards(
  first: RenderCardsFirstArgument,
  second?: RenderCardsSecondArgument,
): CardElement[] {
  if (!isBrowser) {
    throw new Error("renderCards can only be used in a browser environment.");
  }

  const { cards, container, clearContainer = true } = normalizeRenderCardsArgs(first, second);

  if (!Array.isArray(cards)) {
    throw new Error(
      "[vanila-components] renderCards expected an array of card options. Wrap a single card with [] or use renderCard instead.",
    );
  }

  const host = resolveTargetElement(container);
  if (!host) {
    throw new Error(
      `[vanila-components] renderCards could not find a mounting container "${describeTarget(container)}".`,
    );
  }

  if (clearContainer) {
    host.innerHTML = "";
  }

  return cards.map((cardOptions) => {
    const card = createCard(cardOptions);
    host.appendChild(card);
    return card;
  });
}

export const bindCardClickEvents = (
  container: string | HTMLElement,
  onClick: (title: string, event: MouseEvent) => void,
): void => {
  if (!isBrowser) {
    return;
  }

  const host = resolveTargetElement(container);
  if (!host) {
    throw new Error(
      `[vanila-components] bindCardClickEvents could not find a container "${describeTarget(container)}".`,
    );
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
