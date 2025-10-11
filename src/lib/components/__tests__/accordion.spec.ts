import { describe, expect, it, beforeEach, afterEach, vi, type Mock } from "vitest";

vi.mock("../modal", () => {
  return {
    showModal: vi.fn(),
  };
});

import { showModal } from "../modal";
import { createAccordion } from "../accordion";

const mockedShowModal = showModal as unknown as Mock;

describe("accordion delete customization", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mockedShowModal.mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  const getDeleteButton = (root: HTMLElement) => root.querySelector<HTMLButtonElement>(".delete-btn");

  it("uses default modal when no custom handler is provided", () => {
    const accordion = createAccordion({
      title: "Title",
      content: "Content",
    });

    document.body.appendChild(accordion);

    const deleteButton = getDeleteButton(accordion);
    expect(deleteButton).not.toBeNull();
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockedShowModal).toHaveBeenCalledTimes(1);
  });

  it("invokes custom delete request callback instead of modal", () => {
    const onDeleteConfirm = vi.fn();
    const onDeleteCancel = vi.fn();
    const onModalClose = vi.fn();
    const onDeleteRequest = vi.fn();

    const accordion = createAccordion({
      title: "Title",
      content: "Content",
      onDeleteConfirm,
      onDeleteCancel,
      onModalClose,
      onDeleteRequest,
    });

    document.body.appendChild(accordion);
    const deleteButton = getDeleteButton(accordion);
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onDeleteRequest).toHaveBeenCalledTimes(1);
    expect(mockedShowModal).not.toHaveBeenCalled();

    const context = onDeleteRequest.mock.calls[0][0];

    // Simulate a cancel action
    context.cancel();
    expect(onDeleteCancel).toHaveBeenCalledTimes(1);
    expect(onModalClose).toHaveBeenCalledTimes(1);

    // Simulate a remove action
    document.body.appendChild(accordion);
    context.remove();
    expect(onDeleteConfirm).toHaveBeenCalledTimes(1);
    expect(onModalClose).toHaveBeenCalledTimes(2);
    expect(document.body.contains(accordion)).toBe(false);
  });

  it("allows custom handler to trigger default modal", () => {
    const onDeleteRequest = vi.fn((ctx) => ctx.defaultHandler());

    const accordion = createAccordion({
      title: "Title",
      content: "Content",
      onDeleteRequest,
    });

    document.body.appendChild(accordion);
    const deleteButton = getDeleteButton(accordion);
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onDeleteRequest).toHaveBeenCalledTimes(1);
    expect(mockedShowModal).toHaveBeenCalledTimes(1);
  });
});
