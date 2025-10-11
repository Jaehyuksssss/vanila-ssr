import { beforeEach, describe, expect, it } from "vitest";

import { showBottomSheet } from "../bottomsheet";
import { showModal } from "../modal";

const ensureFocusShim = () => {
  if (!HTMLElement.prototype.focus) {
    HTMLElement.prototype.focus = function focus() {
      const element = this as HTMLElement;
      if (!element.isConnected) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).activeElement = element;
    };
  }
};

describe("overlay mounting", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    ensureFocusShim();
  });

  describe("showModal", () => {
    it("mounts the modal into the provided target", () => {
      const mount = document.createElement("div");
      mount.id = "modal-host";
      document.body.appendChild(mount);

      const modal = showModal({
        title: "Custom host",
        message: "The modal should appear inside mount element.",
        target: mount,
      });

      expect(modal.parentElement).toBe(mount);
    });

    it("throws a descriptive error when the target selector is missing", () => {
      expect(() =>
        showModal({
          title: "Missing target",
          message: "This should fail",
          target: "#missing-host",
        }),
      ).toThrow(/Unable to mount modal/);
    });
  });

  describe("showBottomSheet", () => {
    it("mounts the bottom sheet into the provided target", () => {
      const mount = document.createElement("div");
      mount.id = "sheet-host";
      document.body.appendChild(mount);

      const sheet = showBottomSheet({
        title: "Hello",
        content: "Mounted bottom sheet",
        target: "#sheet-host",
      });

      expect(sheet.parentElement).toBe(mount);
    });

    it("throws a descriptive error when the target selector is missing", () => {
      expect(() =>
        showBottomSheet({
          title: "Oops",
          content: "Failure scenario",
          target: "#missing-sheet-host",
        }),
      ).toThrow(/Unable to mount bottom-sheet/);
    });
  });
});
