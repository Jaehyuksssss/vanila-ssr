import { createId, isBrowser } from "../utils/dom";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipOptions {
  content: string;
  placement?: TooltipPlacement;
  openDelay?: number;
  closeDelay?: number;
  className?: string | string[];
}

interface AttachedTooltip {
  trigger: HTMLElement;
  tooltip: HTMLDivElement;
  listeners: Array<{ target: EventTarget; type: string; handler: EventListenerOrEventListenerObject; opts?: any }>;
  openTimer?: number;
  closeTimer?: number;
}

const HYDRATED_ATTR = "data-vanila-tooltip-hydrated";

const addListener = (
  store: AttachedTooltip,
  target: EventTarget,
  type: string,
  handler: EventListenerOrEventListenerObject,
  opts?: any
) => {
  target.addEventListener(type, handler as any, opts);
  store.listeners.push({ target, type, handler, opts });
};

const clearTimers = (ctx: AttachedTooltip) => {
  if (ctx.openTimer) {
    clearTimeout(ctx.openTimer);
    ctx.openTimer = undefined;
  }
  if (ctx.closeTimer) {
    clearTimeout(ctx.closeTimer);
    ctx.closeTimer = undefined;
  }
};

const computePosition = (
  trigger: HTMLElement,
  tooltip: HTMLElement,
  placement: TooltipPlacement
) => {
  const rect = trigger.getBoundingClientRect();
  const ttRect = tooltip.getBoundingClientRect();

  let top = 0;
  let left = 0;

  const margin = 8;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const tryPlace = (pos: TooltipPlacement) => {
    switch (pos) {
      case "top":
        top = rect.top - ttRect.height - margin;
        left = rect.left + rect.width / 2 - ttRect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - ttRect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - ttRect.height / 2;
        left = rect.left - ttRect.width - margin;
        break;
      case "right":
        top = rect.top + rect.height / 2 - ttRect.height / 2;
        left = rect.right + margin;
        break;
    }
  };

  // initial
  tryPlace(placement);

  // auto-flip if overflow
  const overflowTop = top < 0;
  const overflowBottom = top + ttRect.height > viewportH;
  const overflowLeft = left < 0;
  const overflowRight = left + ttRect.width > viewportW;

  if (placement === "top" && overflowTop) tryPlace("bottom");
  else if (placement === "bottom" && overflowBottom) tryPlace("top");
  else if (placement === "left" && overflowLeft) tryPlace("right");
  else if (placement === "right" && overflowRight) tryPlace("left");

  // clamp within viewport horizontally
  left = Math.max(8, Math.min(left, viewportW - ttRect.width - 8));
  // clamp vertically
  top = Math.max(8, Math.min(top, viewportH - ttRect.height - 8));

  tooltip.style.top = `${Math.round(top)}px`;
  tooltip.style.left = `${Math.round(left)}px`;
};

const setOpenState = (tooltip: HTMLDivElement, open: boolean) => {
  if (open) {
    tooltip.removeAttribute("hidden");
    tooltip.setAttribute("data-state", "open");
    tooltip.setAttribute("aria-hidden", "false");
  } else {
    tooltip.setAttribute("hidden", "");
    tooltip.setAttribute("data-state", "closed");
    tooltip.setAttribute("aria-hidden", "true");
  }
};

export const attachTooltip = (
  trigger: HTMLElement,
  options: TooltipOptions
): { detach: () => void; tooltip: HTMLDivElement } => {
  if (!isBrowser) {
    throw new Error("attachTooltip requires a browser environment");
  }

  const placement = options.placement ?? "top";
  const openDelay = Math.max(0, options.openDelay ?? 120);
  const closeDelay = Math.max(0, options.closeDelay ?? 80);

  const tooltip = document.createElement("div");
  tooltip.className = `vanila-tooltip${options.className ? ` ${Array.isArray(options.className) ? options.className.join(" ") : options.className}` : ""}`;
  tooltip.setAttribute("role", "tooltip");
  const id = createId("vanila-tooltip");
  tooltip.id = id;
  tooltip.textContent = options.content;
  tooltip.setAttribute("hidden", "");
  tooltip.setAttribute("data-state", "closed");
  tooltip.setAttribute("aria-hidden", "true");

  document.body.appendChild(tooltip);

  const ctx: AttachedTooltip = {
    trigger,
    tooltip,
    listeners: [],
  };

  const show = () => {
    clearTimers(ctx);
    ctx.openTimer = window.setTimeout(() => {
      setOpenState(tooltip, true);
      computePosition(trigger, tooltip, placement);
    }, openDelay);
  };

  const hide = () => {
    clearTimers(ctx);
    ctx.closeTimer = window.setTimeout(() => setOpenState(tooltip, false), closeDelay);
  };

  // link via ARIA
  const prevDesc = trigger.getAttribute("aria-describedby");
  if (!prevDesc || !prevDesc.split(/\s+/).includes(id)) {
    trigger.setAttribute("aria-describedby", prevDesc ? `${prevDesc} ${id}` : id);
  }

  addListener(ctx, trigger, "mouseenter", show);
  addListener(ctx, trigger, "focusin", show, true);
  addListener(ctx, trigger, "mouseleave", hide);
  addListener(ctx, trigger, "blur", hide, true);
  addListener(ctx, trigger, "keydown", (e: Event) => {
    if ((e as KeyboardEvent).key === "Escape") hide();
  });
  addListener(ctx, window, "scroll", () => {
    if (tooltip.getAttribute("data-state") === "open") {
      computePosition(trigger, tooltip, placement);
    }
  }, true);
  addListener(ctx, window, "resize", () => {
    if (tooltip.getAttribute("data-state") === "open") {
      computePosition(trigger, tooltip, placement);
    }
  });

  const detach = () => {
    clearTimers(ctx);
    ctx.listeners.forEach(({ target, type, handler, opts }) => target.removeEventListener(type, handler as any, opts));
    if (tooltip.isConnected) tooltip.remove();
    // clean describedby id only if we added it and it's still present
    const current = trigger.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
    const filtered = current.filter((x) => x && x !== id);
    if (filtered.length > 0) trigger.setAttribute("aria-describedby", filtered.join(" "));
    else trigger.removeAttribute("aria-describedby");
  };

  return { detach, tooltip };
};

export const hydrateTooltipsInRoot = (root: ParentNode = document): void => {
  if (!isBrowser) return;

  root.querySelectorAll<HTMLElement>("[data-vanila-tooltip]").forEach((el) => {
    if (el.getAttribute(HYDRATED_ATTR) === "true") return;

    const content = el.getAttribute("data-vanila-tooltip") || el.getAttribute("title") || "";
    if (!content) return;

    const placement = (el.getAttribute("data-placement") as TooltipPlacement) || "top";
    attachTooltip(el, { content, placement });
    el.setAttribute(HYDRATED_ATTR, "true");
    // prevent native title tooltip if used
    if (el.hasAttribute("title")) el.setAttribute("data-native-title", el.getAttribute("title") || "");
    el.removeAttribute("title");
  });
};

