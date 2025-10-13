import { describe, expect, it, vi } from "vitest";

import {
  createPagination,
  hydratePagination,
  renderPaginationMarkup,
} from "../pagination";

describe("pagination", () => {
  it("invokes onPageChange when a page is clicked", () => {
    const onPageChange = vi.fn();
    const pagination = createPagination({
      totalPages: 5,
      currentPage: 2,
      hrefTemplate: "#page-:page",
      onPageChange,
    });

    document.body.appendChild(pagination);

    const next = pagination.querySelector<HTMLAnchorElement>("[data-pagination-target='next']");
    expect(next).not.toBeNull();

    next?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(3, expect.any(MouseEvent));
    expect(pagination.dataset.currentPage).toBe("3");
  });

  it("hydrates SSR markup and updates current page programmatically", () => {
    const markup = renderPaginationMarkup({
      totalPages: 10,
      currentPage: 1,
      siblingCount: 1,
      boundaryCount: 1,
      hrefTemplate: "#page-:page",
    });

    const container = document.createElement("div");
    container.innerHTML = markup;
    const element = container.firstElementChild as HTMLElement;

    const onPageChange = vi.fn();
    const hydrated = hydratePagination(element, { onPageChange });

    (hydrated as any).setCurrentPage(5);
    expect(hydrated.dataset.currentPage).toBe("5");

    const prev = hydrated.querySelector<HTMLAnchorElement>("[data-pagination-target='prev']");
    prev?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(onPageChange).toHaveBeenCalledWith(4, expect.any(MouseEvent));
  });
});
