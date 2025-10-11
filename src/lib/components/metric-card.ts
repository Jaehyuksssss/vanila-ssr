import { createElementFromMarkup, isBrowser, setComponentAttr } from "../utils/dom";

const COMPONENT_NAME = "metric-card";

export type MetricCardVariant = "primary" | "success" | "warning" | "danger" | "neutral";
export type MetricCardSize = "sm" | "md" | "lg";

export interface MetricTrend {
  direction: "up" | "down" | "neutral";
  label?: string;
}

export interface MetricCardOptions {
  label: string;
  value: string | number;
  description?: string;
  variant?: MetricCardVariant;
  size?: MetricCardSize;
  trend?: MetricTrend;
  icon?: string;
}

export interface MetricCardMarkupOptions extends MetricCardOptions {
  includeDataAttributes?: boolean;
}

export interface MetricCardElement extends HTMLDivElement {
  update: (value: Partial<Pick<MetricCardOptions, "value" | "description" | "trend">>) => void;
}

const renderTrend = (trend?: MetricTrend): string => {
  if (!trend) {
    return "";
  }

  const directionClass = `metric-card__trend--${trend.direction}`;
  const label = trend.label ?? "";
  return `<span class="metric-card__trend ${directionClass}" data-trend="${trend.direction}">${label}</span>`;
};

const renderIcon = (icon?: string): string => {
  if (!icon) {
    return "";
  }
  return `<span class="metric-card__icon" aria-hidden="true">${icon}</span>`;
};

export const renderMetricCardMarkup = ({
  label,
  value,
  description,
  variant = "neutral",
  size = "md",
  trend,
  icon,
  includeDataAttributes = true,
}: MetricCardMarkupOptions): string => {
  const dataAttr = includeDataAttributes ? ` data-vanila-component="${COMPONENT_NAME}"` : "";

  return `
  <div class="metric-card metric-card--${variant} metric-card--${size}"${dataAttr}>
    <div class="metric-card__header">
      ${renderIcon(icon)}
      <span class="metric-card__label">${label}</span>
    </div>
    <div class="metric-card__value" data-metric-value>${value}</div>
    ${trend ? renderTrend(trend) : ""}
    ${description ? `<p class="metric-card__description" data-metric-description>${description}</p>` : ""}
  </div>
  `;
};

const attachBehavior = (card: HTMLDivElement): MetricCardElement => {
  setComponentAttr(card, COMPONENT_NAME);

  const valueElement = card.querySelector<HTMLElement>("[data-metric-value]");
  let descriptionElement = card.querySelector<HTMLElement>("[data-metric-description]");
  let trendElement = card.querySelector<HTMLElement>(".metric-card__trend");

  const update = (payload: Partial<Pick<MetricCardOptions, "value" | "description" | "trend">>) => {
    if (payload.value !== undefined && valueElement) {
      valueElement.textContent = String(payload.value);
    }

    if (payload.description !== undefined) {
      if (!descriptionElement && payload.description) {
        descriptionElement = document.createElement("p");
        descriptionElement.className = "metric-card__description";
        descriptionElement.setAttribute("data-metric-description", "");
        card.appendChild(descriptionElement);
      }

      if (descriptionElement) {
        if (payload.description) {
          descriptionElement.textContent = payload.description;
        } else {
          descriptionElement.remove();
          descriptionElement = null;
        }
      }
    }

    if (payload.trend !== undefined) {
      if (!payload.trend) {
        trendElement?.remove();
        trendElement = null;
      } else {
        if (!trendElement) {
          trendElement = document.createElement("span");
          card.appendChild(trendElement);
        }
        trendElement.className = `metric-card__trend metric-card__trend--${payload.trend.direction}`;
        trendElement.setAttribute("data-trend", payload.trend.direction);
        trendElement.textContent = payload.trend.label ?? "";
      }
    }
  };

  Object.defineProperty(card, "update", {
    value: update,
    enumerable: false,
    configurable: true,
  });

  return card as MetricCardElement;
};

export const createMetricCard = (options: MetricCardOptions): MetricCardElement => {
  if (!isBrowser) {
    throw new Error("createMetricCard requires a browser environment.");
  }

  const markup = renderMetricCardMarkup({ ...options });
  const card = createElementFromMarkup<HTMLDivElement>(markup);
  return attachBehavior(card);
};

export const hydrateMetricCard = (card: HTMLDivElement): MetricCardElement => attachBehavior(card);
