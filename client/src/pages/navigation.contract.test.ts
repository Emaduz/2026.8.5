import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { navItems } from "@/components/SiteChrome";
import { fallbackProjects } from "@/pages/Portfolio";
import { getWheelDirection, isActiveRoute } from "@/lib/navigationInteractions";

describe("public navigation and portfolio contracts", () => {
  it("keeps each top tab on its own public route", () => {
    expect(navItems).toEqual([["Home", "/"], ["Portfolio", "/portfolio"], ["About", "/about"], ["Services", "/services"], ["Contact", "/contact"]]);
    expect(new Set(navItems.map(([, path]) => path)).size).toBe(navItems.length);
  });
  it("marks only the current tab active and preserves wheel direction utility", () => {
    const chrome = readFileSync(resolve(process.cwd(), "client/src/components/SiteChrome.tsx"), "utf8");
    expect(chrome).toContain('className={isActiveRoute(location, href) ? "is-active" : ""}');
    expect(isActiveRoute("/portfolio", "/portfolio")).toBe(true);
    expect(isActiveRoute("/portfolio/1", "/portfolio")).toBe(true);
    expect(isActiveRoute("/portfolio", "/about")).toBe(false);
    expect(getWheelDirection(40, 0)).toBe(1);
    expect(getWheelDirection(-40, 0)).toBe(-1);
    expect(getWheelDirection(4, 0)).toBe(0);
    expect(getWheelDirection(40, 60)).toBe(0);
  });
  it("uses the responsive grid project detail presentation contract", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/ProjectDetail.tsx"), "utf8");
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(source).toContain("behance-story-container");
    expect(css).toContain("behance-story-container");
  });
  it("keeps the requested eight projects available as card/detail data", () => {
    expect(fallbackProjects).toHaveLength(8);
    expect(new Set(fallbackProjects.map(project => project.id)).size).toBe(8);
    expect(fallbackProjects.every(project => project.title && project.imageUrl && project.description)).toBe(true);
    expect(fallbackProjects.every(project => project.slides && project.slides.length >= 2)).toBe(true);
  });
});
