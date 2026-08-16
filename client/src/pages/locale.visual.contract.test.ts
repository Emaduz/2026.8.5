import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("locale and responsive visual contracts", () => {
  it("defines the wide 4K layout contract", () => {
    expect(css).toContain("@media (min-width: 1600px)");
    expect(css).toContain(".site-shell { width: min(3000px");
    expect(css).toContain(".hero-section h1 { max-width: 850px");
  });

  it("defines RTL direction and navigation alignment contracts", () => {
    expect(css).toContain(".site-app.is-rtl { direction: rtl; }");
    expect(css).toContain(".site-app.is-rtl .admin-link");
    expect(css).toContain(".site-app.is-rtl .hero-section");
  });

  it("uses the requested Rubik editorial heading system", () => {
    expect(css).toContain('font-family: "Rubik";');
    expect(css).toContain("font-style: italic;");
    expect(css).toContain("font-weight: 400;");
  });
});
