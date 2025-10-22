import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { hydrateOnInteraction, hydrateOnIdle } from "../hydration";
import { ensureHostElement } from "../utils/dom";
import { configure } from "../config";

describe("New hydration utilities", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    // reset global config
    configure({ defaultTarget: undefined, styleTarget: undefined, csp: undefined, debug: undefined });
    vi.useRealTimers();
  });

  it("hydrates on first interaction and only once", () => {
    const el = document.createElement("div");
    el.id = "interactive";
    document.body.appendChild(el);

    const spy = vi.fn();
    hydrateOnInteraction("#interactive", spy);

    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(el);
  });

  it("executes work when browser is idle (fallback to timeout)", () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    hydrateOnIdle(spy, { timeout: 50 });

    // advance timers to trigger fallback
    vi.advanceTimersByTime(60);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("uses global defaultTarget when resolving host element", () => {
    const host = document.createElement("div");
    host.id = "global-host";
    document.body.appendChild(host);

    configure({ defaultTarget: "#global-host" });

    const resolved = ensureHostElement({ componentName: "modal", target: undefined, fallback: () => null });
    expect(resolved).toBe(host);
  });
});

