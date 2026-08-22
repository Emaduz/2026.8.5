// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageEditorSurface, { getPageEditorStyle } from "@/components/PageEditorSurface";
import { parsePageEditorSettings } from "@/lib/pageEditorConfig";

describe("Services Grid Page Editor settings", () => {
  const sections = [{
    key: "page_editor_services",
    content: JSON.stringify({
      gridBgLight: "rgba(143,24,25,.12)",
      gridCardBgLight: "#123456",
      gridCardBgDark: "#202020",
      gridCardBorder: "2px solid #abcdef",
      gridCardRadius: "24px",
      gridCardOpacity: "0.82",
      gridTitleColorLight: "#112233",
      gridTitleColorDark: "#f3d9cb",
      gridTextColorLight: "#445566",
      gridTextColorDark: "#f7eee5",
      gridIconColorLight: "#778899",
      gridIconColorDark: "#f3d9cb",
    }),
  }];

  it("parses and preserves all Services Grid style fields", () => {
    const settings = parsePageEditorSettings(sections, "services");
    expect(settings.gridBgLight).toBe("rgba(143,24,25,.12)");
    expect(settings.gridCardBgLight).toBe("#123456");
    expect(settings.gridCardBgDark).toBe("#202020");
    expect(settings.gridCardBorder).toBe("2px solid #abcdef");
    expect(settings.gridCardRadius).toBe("24px");
    expect(settings.gridCardOpacity).toBe("0.82");
    expect(settings.gridTitleColorDark).toBe("#f3d9cb");
    expect(settings.gridTextColorDark).toBe("#f7eee5");
    expect(settings.gridIconColorDark).toBe("#f3d9cb");
  });

  it("injects the parsed Services Grid fields as CSS variables", () => {
    const settings = parsePageEditorSettings(sections, "services");
    const styles = getPageEditorStyle(settings);
    expect(styles["--page-editor-grid-bg-light"]).toBe("rgba(143,24,25,.12)");
    expect(styles["--page-editor-grid-card-bg-light"]).toBe("#123456");
    expect(styles["--page-editor-grid-card-bg-dark"]).toBe("#202020");
    expect(styles["--page-editor-grid-card-border"]).toBe("2px solid #abcdef");
    expect(styles["--page-editor-grid-card-radius"]).toBe("24px");
    expect(styles["--page-editor-grid-card-opacity"]).toBe("0.82");
    expect(styles["--page-editor-grid-title-dark"]).toBe("#f3d9cb");
    expect(styles["--page-editor-grid-text-dark"]).toBe("#f7eee5");
    expect(styles["--page-editor-grid-icon-dark"]).toBe("#f3d9cb");
  });

  it("renders the CSS variables on the public Services surface", () => {
    const { container } = render(<PageEditorSurface page="services" sections={sections}><section className="services-reference-grid" /></PageEditorSurface>);
    const surface = container.querySelector("[data-page-editor='services']") as HTMLElement;
    expect(surface.style.getPropertyValue("--page-editor-grid-card-bg-light")).toBe("#123456");
    expect(surface.style.getPropertyValue("--page-editor-grid-card-radius")).toBe("24px");
    expect(surface.querySelector(".services-reference-grid")).toBeTruthy();
  });
});
