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

describe("hydrateAllVanilaComponents with global styleTarget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    injectVanilaStylesMock.mockReset();
    hydrateAccordionMock.mockReset();
    document.body.innerHTML = "";
  });

  it("uses configured styleTarget when none is provided", async () => {
    const element = document.createElement("div");
    element.setAttribute("data-vanila-component", "accordion");
    document.body.appendChild(element);

    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });

    const { configure } = await import("../config");
    configure({ styleTarget: shadowRoot });

    const hydrationModule = await import("../hydration");
    hydrationModule.hydrateAllVanilaComponents();

    expect(injectVanilaStylesMock).toHaveBeenCalledTimes(1);
    expect(injectVanilaStylesMock).toHaveBeenCalledWith(shadowRoot);
    expect(hydrateAccordionMock).toHaveBeenCalledWith(element);
  });
});

