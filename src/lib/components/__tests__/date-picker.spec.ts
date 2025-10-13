import { describe, expect, it, vi } from "vitest";

import {
  createDatePicker,
  hydrateDatePicker,
  renderDatePickerMarkup,
} from "../date-picker";

describe("date-picker", () => {
  it("creates a single date picker and emits onChange", () => {
    const onChange = vi.fn();
    const element = createDatePicker({
      name: "start-date",
      label: "Start date",
      onChange,
    });

    document.body.appendChild(element);

    const input = element.querySelector<HTMLInputElement>("[data-date-picker-input]");
    expect(input).not.toBeNull();

    if (input) {
      input.value = "2024-03-12";
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("2024-03-12", expect.any(Event));
    expect((element as any).getValue()).toBe("2024-03-12");
  });

  it("hydrates a range picker and updates values", () => {
    const markup = renderDatePickerMarkup({
      mode: "date-range",
      name: "period",
      label: "Period",
      defaultValue: {
        start: "2024-01-01",
        end: "2024-01-10",
      },
    });

    const container = document.createElement("div");
    container.innerHTML = markup;
    const element = container.firstElementChild as HTMLDivElement;

    const onChange = vi.fn();
    const hydrated = hydrateDatePicker(element, { onChange });

    const endInput = hydrated.querySelector<HTMLInputElement>("[data-date-picker-end]");
    expect(endInput).not.toBeNull();

    if (endInput) {
      endInput.value = "2024-01-15";
      endInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    expect(onChange).toHaveBeenCalledTimes(1);
    const value = (hydrated as any).getValue();
    expect(value.start).toBe("2024-01-01");
    expect(value.end).toBe("2024-01-15");
  });
});
