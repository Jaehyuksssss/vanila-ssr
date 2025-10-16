import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../components/modal", () => ({
  hydrateModal: vi.fn(),
}));

describe("hydrateVanilaComponents skipHydrated", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
  });

  it("skips elements with data-vanila-hydrated when skipHydrated is true", async () => {
    const element = document.createElement("div");
    element.setAttribute("data-vanila-component", "modal");
    element.setAttribute("data-vanila-hydrated", "true");
    document.body.appendChild(element);

    const { hydrateVanilaComponents } = await import("../hydration");
    const modalModule = await import("../components/modal");

    hydrateVanilaComponents(); // default skipHydrated: true

    expect((modalModule as any).hydrateModal).not.toHaveBeenCalled();
  });

  it("hydrates elements even if marked when skipHydrated is false", async () => {
    const element = document.createElement("div");
    element.setAttribute("data-vanila-component", "modal");
    element.setAttribute("data-vanila-hydrated", "true");
    document.body.appendChild(element);

    const { hydrateVanilaComponents } = await import("../hydration");
    const modalModule = await import("../components/modal");

    hydrateVanilaComponents({ skipHydrated: false });

    expect((modalModule as any).hydrateModal).toHaveBeenCalledTimes(1);
  });
});

