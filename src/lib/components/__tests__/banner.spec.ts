import { describe, expect, it, vi } from "vitest";

import { createBanner, hydrateBanner, renderBannerMarkup } from "../banner";

describe("banner", () => {
  it("calls onDismiss when dismiss button clicked", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const banner = createBanner({
      message: "스토리지 사용량이 가득 차 가고 있어요.",
      dismissible: true,
      onDismiss,
    });

    document.body.appendChild(banner);

    const dismiss = banner.querySelector<HTMLButtonElement>("[data-banner-dismiss]");
    dismiss?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    vi.runAllTimers();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("hydrates SSR markup with actions", () => {
    const markup = renderBannerMarkup({
      message: "새로운 버전이 배포되었습니다.",
      variant: "success",
      actions: [
        { label: "자세히 보기", href: "#changelog" },
      ],
    });

    const container = document.createElement("div");
    container.innerHTML = markup;
    const element = container.firstElementChild as HTMLDivElement;

    const onAction = vi.fn();
    const hydrated = hydrateBanner(element, { onAction });

    const action = hydrated.querySelector<HTMLElement>("[data-banner-action='0']");
    action?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onAction).toHaveBeenCalledTimes(1);
    (hydrated as any).setVariant("warning");
    expect(hydrated.dataset.variant).toBe("warning");
  });
});
