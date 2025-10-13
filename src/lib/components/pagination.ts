import {
  createElementFromMarkup,
  isBrowser,
  joinClassNames,
  setComponentAttr,
} from "../utils/dom";

const COMPONENT_NAME = "pagination";
const LIST_SELECTOR = "[data-pagination-list]";
const ITEM_SELECTOR = "[data-pagination-target]";

export type PaginationSize = "sm" | "md";

interface PaginationBaseContentOptions {
  totalPages: number;
  currentPage?: number;
  siblingCount?: number;
  boundaryCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  ariaLabel?: string;
  size?: PaginationSize;
  className?: string | string[];
  disabled?: boolean;
  hrefTemplate?: string;
}

export interface PaginationContentOptions extends PaginationBaseContentOptions {
  id?: string;
}

export interface PaginationBehaviorOptions {
  onPageChange?: (page: number, event: MouseEvent | KeyboardEvent) => void;
  preventDefault?: boolean;
}

export type PaginationOptions = PaginationContentOptions &
  PaginationBehaviorOptions;

export interface PaginationMarkupOptions extends PaginationContentOptions {
  includeDataAttributes?: boolean;
}

export type PaginationHydrationOptions = PaginationBehaviorOptions;

export interface PaginationElement extends HTMLElement {
  getCurrentPage: () => number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  update: (options: Partial<PaginationContentOptions>) => void;
}

interface PaginationState {
  totalPages: number;
  currentPage: number;
  siblingCount: number;
  boundaryCount: number;
  showFirstLast: boolean;
  showPrevNext: boolean;
  ariaLabel: string;
  size: PaginationSize;
  disabled: boolean;
  hrefTemplate: string;
}

type PaginationRenderable =
  | { type: "page"; page: number; active: boolean }
  | { type: "ellipsis"; key: string }
  | {
      type: "control";
      role: "prev" | "next" | "first" | "last";
      page: number;
      disabled: boolean;
    };

type PaginationControlRole = "prev" | "next" | "first" | "last";

const DEFAULT_STATE: PaginationState = {
  totalPages: 1,
  currentPage: 1,
  siblingCount: 1,
  boundaryCount: 1,
  showFirstLast: false,
  showPrevNext: true,
  ariaLabel: "Pagination",
  size: "md",
  disabled: false,
  hrefTemplate: "?page=:page",
};

const clampPage = (page: number, total: number): number => {
  if (!Number.isFinite(page) || Number.isNaN(page)) {
    return 1;
  }
  return Math.min(Math.max(page, 1), Math.max(total, 1));
};

const range = (start: number, end: number): number[] => {
  if (end < start) {
    return [];
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const buildState = (options: PaginationContentOptions): PaginationState => {
  const totalPages = Math.max(1, Math.floor(options.totalPages));
  const siblingCount = Math.max(
    0,
    Math.floor(options.siblingCount ?? DEFAULT_STATE.siblingCount)
  );
  const boundaryCount = Math.max(
    0,
    Math.floor(options.boundaryCount ?? DEFAULT_STATE.boundaryCount)
  );

  return {
    totalPages,
    currentPage: clampPage(
      options.currentPage ?? DEFAULT_STATE.currentPage,
      totalPages
    ),
    siblingCount,
    boundaryCount,
    showFirstLast: options.showFirstLast ?? DEFAULT_STATE.showFirstLast,
    showPrevNext: options.showPrevNext ?? DEFAULT_STATE.showPrevNext,
    ariaLabel: options.ariaLabel ?? DEFAULT_STATE.ariaLabel,
    size: options.size ?? DEFAULT_STATE.size,
    disabled: options.disabled ?? DEFAULT_STATE.disabled,
    hrefTemplate: options.hrefTemplate ?? DEFAULT_STATE.hrefTemplate,
  };
};

const buildHref = (template: string, page: number): string => {
  if (!template.includes(":page")) {
    return template;
  }
  return template.replace(/:page/g, String(page));
};

const buildItems = (state: PaginationState): PaginationRenderable[] => {
  const {
    totalPages,
    currentPage,
    siblingCount,
    boundaryCount,
    showFirstLast,
    showPrevNext,
  } = state;
  const items: PaginationRenderable[] = [];

  const addControl = (
    role: "first" | "prev" | "next" | "last",
    page: number,
    disabled: boolean
  ) => {
    items.push({ type: "control", role, page, disabled });
  };

  if (showFirstLast) {
    addControl("first", 1, currentPage === 1);
  }
  if (showPrevNext) {
    addControl("prev", Math.max(1, currentPage - 1), currentPage === 1);
  }

  const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3;

  if (totalPages <= totalNumbers) {
    range(1, totalPages).forEach((page) => {
      items.push({ type: "page", page, active: page === currentPage });
    });
  } else {
    const leftSiblingIndex = Math.max(
      currentPage - siblingCount,
      boundaryCount + 2
    );
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPages - boundaryCount - 1
    );

    const showLeftEllipsis = leftSiblingIndex > boundaryCount + 2;
    const showRightEllipsis =
      rightSiblingIndex < totalPages - boundaryCount - 1;

    const firstSection = range(1, boundaryCount);
    const lastSection = range(totalPages - boundaryCount + 1, totalPages);

    let middleSection: number[];

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftItemCount = boundaryCount + siblingCount * 2 + 2;
      middleSection = range(boundaryCount + 1, leftItemCount + 1);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      const rightItemCount = boundaryCount + siblingCount * 2 + 2;
      middleSection = range(
        totalPages - (rightItemCount + boundaryCount - 1),
        totalPages - boundaryCount
      );
    } else {
      middleSection = range(leftSiblingIndex, rightSiblingIndex);
    }

    const seen = new Set<number>();

    const pushPages = (pages: number[]) => {
      pages.forEach((page) => {
        if (page < 1 || page > totalPages || seen.has(page)) {
          return;
        }
        seen.add(page);
        items.push({ type: "page", page, active: page === currentPage });
      });
    };

    pushPages(firstSection);

    if (showLeftEllipsis) {
      items.push({ type: "ellipsis", key: "left" });
    }

    pushPages(middleSection);

    if (showRightEllipsis) {
      items.push({ type: "ellipsis", key: "right" });
    }

    pushPages(lastSection);
  }

  if (showPrevNext) {
    addControl(
      "next",
      Math.min(totalPages, currentPage + 1),
      currentPage === totalPages
    );
  }
  if (showFirstLast) {
    addControl("last", totalPages, currentPage === totalPages);
  }

  return items;
};

const renderItem = (
  item: PaginationRenderable,
  state: PaginationState
): string => {
  switch (item.type) {
    case "page": {
      const href = buildHref(state.hrefTemplate, item.page);
      const activeClass = item.active ? " pagination__link--active" : "";
      const ariaCurrent = item.active ? ' aria-current="page"' : "";
      return `
        <li class="pagination__item">
          <a
            href="${href}"
            class="pagination__link${activeClass}"
            data-pagination-target="page"
            data-page="${item.page}"
            ${ariaCurrent}
          >
            ${item.page}
          </a>
        </li>
      `;
    }
    case "ellipsis":
      return `<li class="pagination__item pagination__ellipsis" aria-hidden="true">…</li>`;
    case "control": {
      const labels: Record<PaginationControlRole, string> = {
        prev: "Previous page",
        next: "Next page",
        first: "First page",
        last: "Last page",
      };
      const iconText: Record<PaginationControlRole, string> = {
        prev: "‹",
        next: "›",
        first: "«",
        last: "»",
      };
      const role = item.role;
      const href = buildHref(state.hrefTemplate, item.page);
      const disabledClass = item.disabled ? " pagination__link--disabled" : "";
      const ariaDisabled = item.disabled ? ' aria-disabled="true"' : "";
      const tabIndex = item.disabled ? ' tabindex="-1"' : "";
      return `
        <li class="pagination__item">
          <a
            href="${href}"
            class="pagination__link pagination__link--control${disabledClass}"
            data-pagination-target="${role}"
            data-page="${item.page}"
            aria-label="${labels[role]}"
            ${ariaDisabled}
            ${tabIndex}
          >
            ${iconText[role]}
          </a>
        </li>
      `;
    }
    default:
      return "";
  }
};

const renderList = (state: PaginationState): string => {
  return buildItems(state)
    .map((item) => renderItem(item, state))
    .join("");
};

export const renderPaginationMarkup = ({
  includeDataAttributes = true,
  ...options
}: PaginationMarkupOptions): string => {
  const state = buildState(options);
  const dataAttr = includeDataAttributes
    ? ` data-vanila-component="${COMPONENT_NAME}"`
    : "";
  const wrapperClass = joinClassNames(
    "pagination",
    `pagination--${state.size}`,
    options.className
  );

  const dataset = `
    data-total-pages="${state.totalPages}"
    data-current-page="${state.currentPage}"
    data-sibling-count="${state.siblingCount}"
    data-boundary-count="${state.boundaryCount}"
    data-show-first-last="${state.showFirstLast}"
    data-show-prev-next="${state.showPrevNext}"
    data-disabled="${state.disabled}"
    data-size="${state.size}"
    data-href-template="${state.hrefTemplate.replace(/"/g, "&quot;")}"
  `;

  const idAttr = options.id ? `id="${options.id}"` : "";
  const idAttrLine = idAttr ? `      ${idAttr}\n` : "";

  return `
    <nav
      class="${wrapperClass}"
${idAttrLine}      aria-label="${state.ariaLabel}"
      ${dataAttr}
      ${dataset}
    >
      <ul class="pagination__list" data-pagination-list>
        ${renderList(state)}
      </ul>
    </nav>
  `;
};

const attachBehavior = (
  element: HTMLElement,
  content: PaginationContentOptions,
  behavior: PaginationHydrationOptions = {}
): PaginationElement => {
  const state = buildState(content);
  setComponentAttr(element, COMPONENT_NAME);
  element.classList.add("pagination");

  const list = element.querySelector<HTMLUListElement>(LIST_SELECTOR);
  if (!list) {
    throw new Error("Pagination markup is missing a list container.");
  }

  const applySizeClass = () => {
    Array.from(element.classList)
      .filter((className) => className.startsWith("pagination--"))
      .forEach((className) => element.classList.remove(className));
    element.classList.add(`pagination--${state.size}`);
  };

  const applyStateToDataset = () => {
    element.dataset.totalPages = String(state.totalPages);
    element.dataset.currentPage = String(state.currentPage);
    element.dataset.siblingCount = String(state.siblingCount);
    element.dataset.boundaryCount = String(state.boundaryCount);
    element.dataset.showFirstLast = String(state.showFirstLast);
    element.dataset.showPrevNext = String(state.showPrevNext);
    element.dataset.disabled = String(state.disabled);
    element.dataset.size = state.size;
    element.dataset.hrefTemplate = state.hrefTemplate;
    element.setAttribute("aria-label", state.ariaLabel);
  };

  const rerender = () => {
    list.innerHTML = renderList(state);
    applyStateToDataset();
    applySizeClass();
  };

  applyStateToDataset();
  applySizeClass();

  const preventDefault = behavior.preventDefault ?? true;

  const handleActivate = (page: number, event: MouseEvent | KeyboardEvent) => {
    if (state.disabled || page === state.currentPage) {
      return;
    }
    state.currentPage = clampPage(page, state.totalPages);
    rerender();
    behavior.onPageChange?.(state.currentPage, event);
  };

  const handleClick = (event: Event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      ITEM_SELECTOR
    );
    if (!target) {
      return;
    }

    const role = target.dataset.paginationTarget;
    const page = Number.parseInt(target.dataset.page ?? "", 10);

    if (Number.isNaN(page)) {
      return;
    }

    if (preventDefault && target.tagName === "A") {
      event.preventDefault();
    }

    switch (role) {
      case "page":
      case "prev":
      case "next":
      case "first":
      case "last":
        handleActivate(page, event as MouseEvent);
        break;
      default:
        break;
    }
  };

  element.addEventListener("click", handleClick);

  const getCurrentPage = () => state.currentPage;

  const setCurrentPage = (page: number) => {
    const next = clampPage(page, state.totalPages);
    if (next === state.currentPage) {
      return;
    }
    state.currentPage = next;
    rerender();
  };

  const setTotalPages = (total: number) => {
    const nextTotal = Math.max(1, Math.floor(total));
    if (nextTotal === state.totalPages) {
      return;
    }
    state.totalPages = nextTotal;
    state.currentPage = clampPage(state.currentPage, state.totalPages);
    rerender();
  };

  const update = (options: Partial<PaginationContentOptions>) => {
    const nextState = buildState({
      ...state,
      ...options,
    });

    state.totalPages = nextState.totalPages;
    state.currentPage = nextState.currentPage;
    state.siblingCount = nextState.siblingCount;
    state.boundaryCount = nextState.boundaryCount;
    state.showFirstLast = nextState.showFirstLast;
    state.showPrevNext = nextState.showPrevNext;
    state.ariaLabel = nextState.ariaLabel;
    state.size = nextState.size;
    state.disabled = nextState.disabled;
    state.hrefTemplate = nextState.hrefTemplate;

    rerender();
  };

  Object.defineProperties(element, {
    getCurrentPage: {
      value: getCurrentPage,
      configurable: true,
      enumerable: false,
    },
    setCurrentPage: {
      value: setCurrentPage,
      configurable: true,
      enumerable: false,
    },
    setTotalPages: {
      value: setTotalPages,
      configurable: true,
      enumerable: false,
    },
    update: {
      value: update,
      configurable: true,
      enumerable: false,
    },
  });

  return element as PaginationElement;
};

export const createPagination = (
  options: PaginationOptions
): PaginationElement => {
  if (!isBrowser) {
    throw new Error("createPagination requires a browser environment.");
  }

  const { onPageChange, preventDefault, ...content } = options;
  const markup = renderPaginationMarkup(content);
  const element = createElementFromMarkup<HTMLElement>(markup);
  return attachBehavior(element, content, { onPageChange, preventDefault });
};

const inferContent = (element: HTMLElement): PaginationContentOptions => {
  const dataset = element.dataset;
  return {
    totalPages: Number.parseInt(dataset.totalPages ?? "1", 10) || 1,
    currentPage: Number.parseInt(dataset.currentPage ?? "1", 10) || 1,
    siblingCount:
      Number.parseInt(
        dataset.siblingCount ?? `${DEFAULT_STATE.siblingCount}`,
        10
      ) || DEFAULT_STATE.siblingCount,
    boundaryCount:
      Number.parseInt(
        dataset.boundaryCount ?? `${DEFAULT_STATE.boundaryCount}`,
        10
      ) || DEFAULT_STATE.boundaryCount,
    showFirstLast: dataset.showFirstLast === "true",
    showPrevNext: dataset.showPrevNext === "false" ? false : true,
    ariaLabel: element.getAttribute("aria-label") ?? DEFAULT_STATE.ariaLabel,
    size: (dataset.size as PaginationSize | undefined) ?? DEFAULT_STATE.size,
    disabled: dataset.disabled === "true",
    hrefTemplate: dataset.hrefTemplate ?? DEFAULT_STATE.hrefTemplate,
  };
};

export const hydratePagination = (
  element: HTMLElement,
  options: PaginationHydrationOptions = {},
  content: PaginationContentOptions | undefined = undefined
): PaginationElement => {
  const inferred = content ?? inferContent(element);
  return attachBehavior(element, inferred, options);
};
