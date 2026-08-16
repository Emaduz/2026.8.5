import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Rubik font contract", () => {
  it("loads Rubik variable and contains no legacy site font declarations", () => {
    const html = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(html).toContain("family=Rubik");
    expect(css).toContain('font-family: "Rubik"');
    expect(css).not.toMatch(/IBM Plex|Georgia|Times New Roman|monospace|serif|sans-serif/);
  });
});
