import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../sanitizeHtml";

describe("sanitizeHtml", () => {
  it("escapes basic HTML tags", () => {
    const input = "<div>Hello</div>";
    const output = sanitizeHtml(input);
    expect(output).toBe("&lt;div&gt;Hello&lt;/div&gt;");
  });

  it("escapes dangerous attributes and scripts", () => {
    const input = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
    const output = sanitizeHtml(input);
    expect(output).toContain("&lt;img");
    expect(output).toContain("onerror");
    expect(output).toContain("&lt;script&gt;");
    expect(output).not.toContain("<script>");
  });

  it("handles null/undefined input gracefully", () => {
    // @ts-expect-error testing runtime null handling
    expect(sanitizeHtml(null)).toBe("");
    // @ts-expect-error testing runtime undefined handling
    expect(sanitizeHtml(undefined)).toBe("");
  });
});
