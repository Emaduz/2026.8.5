import { describe, expect, it } from "vitest";
import { listProjectsWithSlides } from "./db";

describe("published portfolio slide assets", () => {
  it("keeps every published project multi-slide and local-only", async () => {
    const projects = await listProjectsWithSlides(true);
    if (projects.length === 0) return;

    expect(projects.length).toBeGreaterThan(0);
    for (const project of projects) {
      expect(project.slides.length).toBeGreaterThan(1);
      for (const slide of project.slides) {
        expect(slide.imageUrl).toMatch(/^\/manus-storage\//);
      }
    }
  });
});
