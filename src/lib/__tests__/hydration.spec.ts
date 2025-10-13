import { beforeEach, describe, expect, it, vi } from "vitest";

const injectVanilaStylesMock = vi.fn();
const hydrateAccordionMock = vi.fn();

vi.mock("../styles/injectStyles", () => ({
  injectVanilaStyles: injectVanilaStylesMock,
  getVanilaStyleText: vi.fn(() => ""),
}));

vi.mock("../components/accordion", () => ({
  hydrateAccordion: hydrateAccordionMock,
}));

describe("hydrateAllVanilaComponents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    injectVanilaStylesMock.mockReset();
    hydrateAccordionMock.mockReset();
    document.body.innerHTML = "";
  });

  it("injects styles by default and hydrates SSR markup", async () => {
    const element = document.createElement("div");
    element.setAttribute("data-vanila-component", "accordion");
    document.body.appendChild(element);

    const hydrationModule = await import("../hydration");

    hydrationModule.hydrateAllVanilaComponents();

    expect(injectVanilaStylesMock).toHaveBeenCalledTimes(1);
    expect(injectVanilaStylesMock).toHaveBeenCalledWith(undefined);
    expect(hydrateAccordionMock).toHaveBeenCalledWith(element);
  });

  it("skips style injection when injectStyles is false but still hydrates", async () => {
    const container = document.createElement("div");
    const element = document.createElement("div");
    element.setAttribute("data-vanila-component", "accordion");
    container.appendChild(element);

    const hydrationModule = await import("../hydration");

    hydrationModule.hydrateAllVanilaComponents({
      injectStyles: false,
      root: container,
    });

    expect(injectVanilaStylesMock).not.toHaveBeenCalled();
    expect(hydrateAccordionMock).toHaveBeenCalledWith(element);
  });

  it("forwards the style target when injecting styles", async () => {
    const element = document.createElement("div");
    element.setAttribute("data-vanila-component", "accordion");
    document.body.appendChild(element);

    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });

    const hydrationModule = await import("../hydration");

    hydrationModule.hydrateAllVanilaComponents({
      styleTarget: shadowRoot,
    });

    expect(injectVanilaStylesMock).toHaveBeenCalledWith(shadowRoot);
    expect(hydrateAccordionMock).toHaveBeenCalledWith(element);
  });
});
