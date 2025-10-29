import { describe, it, expect, beforeEach } from "vitest";
import { confirm } from "../../components/modal";

describe("confirm helper", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("resolves true on primary and false on cancel", async () => {
    const p = confirm({ title: "Confirm", message: "Proceed?", confirmText: "Yes", cancelText: "No" });

    // find buttons and click primary
    const primary = await waitFor(() => document.querySelector<HTMLButtonElement>("[data-vanila-modal-primary]"));
    expect(primary?.textContent).toBe("Yes");
    primary?.click();
    await expect(p).resolves.toBe(true);

    // Second call to test cancel
    const p2 = confirm({ title: "Confirm", message: "Proceed?", confirmText: "Yes", cancelText: "No" });
    const secondary = await waitFor(() => document.querySelector<HTMLButtonElement>("[data-vanila-modal-secondary]"));
    expect(secondary?.textContent).toBe("No");
    secondary?.click();
    await expect(p2).resolves.toBe(false);
  });
});

function waitFor<T>(fn: () => T | null, timeout = 100): Promise<NonNullable<T>> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const res = fn();
      if (res) return resolve(res as NonNullable<T>);
      if (Date.now() - start > timeout) return reject(new Error("timeout"));
      setTimeout(tick, 10);
    };
    tick();
  });
}

