import { describe, it, expect, beforeEach } from "vitest";
import { hydrateTooltipsInRoot, attachTooltip } from "../../components/tooltip";

describe("Tooltip", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("attaches programmatically and toggles visibility on events", () => {
    const btn = document.createElement("button");
    btn.id = "info";
    document.body.appendChild(btn);

    const { tooltip } = attachTooltip(btn, { content: "Hello" });

    expect(tooltip.getAttribute("role")).toBe("tooltip");
    expect(tooltip.hasAttribute("hidden")).toBe(true);

    btn.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    // timers may defer; run macro by forcing setTimeout 0
    return new Promise<void>((resolve) => setTimeout(resolve, 150)).then(() => {
      expect(tooltip.getAttribute("data-state")).toBe("open");
      btn.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      return new Promise<void>((resolve2) => setTimeout(resolve2, 120)).then(() => {
        expect(tooltip.getAttribute("data-state")).toBe("closed");
      });
    });
  });

  it("hydrates [data-vanila-tooltip] triggers", async () => {
    const el = document.createElement("span");
    el.textContent = "hover me";
    el.setAttribute("data-vanila-tooltip", "Info");
    document.body.appendChild(el);

    hydrateTooltipsInRoot();

    el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 130));
    const tooltip = document.querySelector<HTMLDivElement>(".vanila-tooltip");
    expect(tooltip).toBeTruthy();
    expect(tooltip?.getAttribute("data-state")).toBe("open");
  });
});

