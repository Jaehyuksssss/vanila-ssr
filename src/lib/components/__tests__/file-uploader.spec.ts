import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFileUploader, hydrateFileUploader, renderFileUploaderMarkup } from "../file-uploader";

const createMockFile = (name: string, size = 10, type = "text/plain") => {
  return new File([new Uint8Array(size)], name, { type });
};

describe("file-uploader", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("allows programmatic file updates", () => {
    const onFilesChange = vi.fn();
    const uploader = createFileUploader({
      name: "attachments",
      label: "첨부 파일",
      multiple: true,
      onFilesChange,
    });

    const fileA = createMockFile("a.txt");
    const fileB = createMockFile("b.txt");

    (uploader as any).setFiles([fileA, fileB]);

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect((uploader as any).getFiles()).toHaveLength(2);

    (uploader as any).removeFile(0);
    expect((uploader as any).getFiles()).toHaveLength(1);
  });

  it("honours maxFiles and reports errors when hydrating SSR markup", () => {
    const markup = renderFileUploaderMarkup({
      name: "docs",
      label: "문서 업로드",
      maxFiles: 1,
      multiple: true,
    });

    const container = document.createElement("div");
    container.innerHTML = markup;
    const element = container.firstElementChild as HTMLDivElement;

    const onError = vi.fn();
    const hydrated = hydrateFileUploader(element, { onError });

    const input = hydrated.querySelector<HTMLInputElement>("[data-uploader-input]");
    expect(input).not.toBeNull();

    const fileA = createMockFile("a.txt");
    const fileB = createMockFile("b.txt");

    // simulate user adding files sequentially
    (hydrated as any).setFiles([fileA]);
    (hydrated as any).setFiles([fileA, fileB]);

    expect(onError).not.toHaveBeenCalled();
    expect((hydrated as any).getFiles()).toHaveLength(2);
    // adding via internal handler should respect maxFiles
    (hydrated as any).clear();
    if (typeof DataTransfer !== "undefined") {
      const dropEvent = new DragEvent("drop", {
        dataTransfer: new DataTransfer(),
      });
      dropEvent.dataTransfer?.items.add(fileA);
      dropEvent.dataTransfer?.items.add(fileB);
      element.querySelector<HTMLDivElement>("[data-uploader-dropzone]")?.dispatchEvent(dropEvent);

      expect(onError).toHaveBeenCalled();
    }
  });
});
