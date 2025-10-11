import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fireEvent } from "@testing-library/dom";

import {
  createSelectField,
  hydrateSelectField,
  renderSelectFieldMarkup,
} from "../select-field";

const cleanup = () => {
  document.body.innerHTML = "";
};

describe("select field component", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  const baseOptions = [
    { label: "대기", value: "pending" },
    { label: "진행중", value: "in-progress" },
    { label: "완료", value: "done" },
  ];

  it("renders SSR markup with options", () => {
    const markup = renderSelectFieldMarkup({
      name: "status",
      label: "상태",
      options: baseOptions,
      value: "in-progress",
    });

    expect(markup).toContain('data-vanila-component="select-field"');
    expect(markup).toContain("in-progress\" selected");
  });

  it("creates interactive select field", () => {
    const handleChange = vi.fn();
    const field = createSelectField({
      name: "status",
      label: "상태",
      options: baseOptions,
      value: "pending",
      onChange: handleChange,
    });

    document.body.appendChild(field);

    const select = field.querySelector<HTMLSelectElement>("select");
    expect(select).not.toBeNull();

    if (!select) return;

    fireEvent.change(select, { target: { value: "done" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0]).toBe("done");

    expect(field.getValue()).toBe("done");
    field.setError("필수 선택 항목입니다");
    expect(field.classList.contains("select-field--error")).toBe(true);
  });

  it("hydrates SSR markup and handles multi selection", () => {
    const markup = renderSelectFieldMarkup({
      name: "owners",
      label: "담당자",
      options: [
        { label: "지수", value: "jisu" },
        { label: "민재", value: "minjae" },
        { label: "태현", value: "taehyun" },
      ],
      multiple: true,
      value: ["jisu", "taehyun"],
    });

    const container = document.createElement("div");
    container.innerHTML = markup;
    const wrapper = container.firstElementChild as HTMLDivElement;

    const handleBlur = vi.fn();
    const hydrated = hydrateSelectField(wrapper, {
      onBlur: handleBlur,
    });

    document.body.appendChild(hydrated);

    const select = hydrated.querySelector<HTMLSelectElement>("select");
    expect(select).not.toBeNull();
    if (!select) return;

    expect(Array.from(select.selectedOptions).map((option) => option.value)).toEqual([
      "jisu",
      "taehyun",
    ]);

    // Simulate user removing one selection
    Array.from(select.options).forEach((option) => {
      option.selected = option.value === "minjae";
    });

    fireEvent.blur(select);

    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(handleBlur.mock.calls[0][0]).toEqual(["minjae"]);
  });
});
