import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fireEvent } from "@testing-library/dom";

import {
  createInputField,
  hydrateInputField,
  renderInputFieldMarkup,
} from "../input-field";

const cleanup = () => {
  document.body.innerHTML = "";
};

describe("input field component", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  it("renders SSR markup with attributes", () => {
    const markup = renderInputFieldMarkup({
      name: "username",
      label: "사용자",
      placeholder: "아이디를 입력하세요",
    });

    expect(markup).toContain('data-vanila-component="input-field"');
    expect(markup).toContain("사용자");
    expect(markup).toContain("placeholder=\"아이디를 입력하세요\"");
  });

  it("creates interactive field in browser", () => {
    const handleChange = vi.fn();
    const field = createInputField({
      name: "email",
      label: "이메일",
      onChange: handleChange,
    });

    document.body.appendChild(field);

    const input = field.querySelector<HTMLInputElement>("input");
    expect(input).not.toBeNull();

    if (!input) return;

    fireEvent.change(input, { target: { value: "user@example.com" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0]).toBe("user@example.com");

    field.setError("유효하지 않은 이메일");
    expect(field.classList.contains("input-field--error")).toBe(true);

    field.setError(null);
    expect(field.classList.contains("input-field--error")).toBe(false);
  });

  it("hydrates SSR markup and wires events", () => {
    const markup = renderInputFieldMarkup({
      name: "password",
      label: "비밀번호",
    });

    const container = document.createElement("div");
    container.innerHTML = markup;

    const wrapper = container.firstElementChild as HTMLDivElement;
    const handleBlur = vi.fn();

    const hydrated = hydrateInputField(wrapper, {
      onBlur: handleBlur,
    });

    document.body.appendChild(hydrated);

    const input = hydrated.querySelector<HTMLInputElement>("input");
    expect(input).not.toBeNull();

    if (!input) return;

    input.value = "secret";
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(handleBlur.mock.calls[0][0]).toBe("secret");

    expect(hydrated.getValue()).toBe("secret");
    hydrated.setValue("updated");
    expect(input.value).toBe("updated");
  });
});
