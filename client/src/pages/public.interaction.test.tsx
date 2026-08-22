// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import SiteChrome from "@/components/SiteChrome";
import Portfolio from "@/pages/Portfolio";
import Home from "@/pages/Home";
import { AppRouter } from "@/App";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const mockHomeData = vi.hoisted(() => ({ sections: [] as any[], projects: [] as any[], posts: [] as any[] }));
vi.mock("@/lib/trpc", () => ({ trpc: { content: { publicHome: { useQuery: () => ({ data: mockHomeData, isLoading: false }) }, publicProject: { useQuery: () => ({ data: null, isLoading: false }) } } } }));
vi.mock("@/components/PortraitComposition", () => ({ default: () => null }));
const navigateSpy = vi.fn();
let appPath = "/";
function useSpyLocation() { return [appPath, navigateSpy] as [string, (path: string, ...args: any[]) => void]; }
function Shell({ children }: { children: React.ReactNode }) { return <ThemeProvider><LocaleProvider><Router hook={useSpyLocation}>{children}</Router></LocaleProvider></ThemeProvider>; }

beforeEach(() => { cleanup(); vi.clearAllMocks(); mockHomeData.sections = []; mockHomeData.projects = []; mockHomeData.posts = []; appPath = "/"; window.localStorage.clear(); document.documentElement.dir = "ltr"; document.documentElement.lang = "en"; Object.defineProperty(window, "matchMedia", { writable: true, value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }) }); });

describe("public navigation and interactions", () => {
  it("moves to Portfolio from the fixed top navigation", () => { render(<Shell><SiteChrome><div>Home content</div></SiteChrome></Shell>); const portfolioLink = screen.getByRole("link", { name: "Portfolio" }); fireEvent.click(portfolioLink); expect(navigateSpy).toHaveBeenCalledWith("/portfolio", expect.anything()); });
  it("exposes the floating WhatsApp action with the current number", () => { render(<Shell><SiteChrome><div>Home content</div></SiteChrome></Shell>); const whatsappLink = screen.getByRole("link", { name: "Message on WhatsApp" }); expect(whatsappLink.getAttribute("href")).toBe("https://wa.me/966504487308"); expect(whatsappLink.getAttribute("target")).toBe("_blank"); });
  it("switches the entire chrome to Arabic RTL while keeping the control-panel entry hidden from the footer", () => { render(<Shell><SiteChrome><div>Home content</div></SiteChrome></Shell>); fireEvent.click(screen.getByRole("button", { name: "Switch language" })); expect(screen.getByRole("link", { name: "الأعمال" })).toBeTruthy(); expect(screen.queryByRole("link", { name: /Emadalddine/ })).toBeNull(); expect(document.documentElement.dir).toBe("rtl"); expect(document.documentElement.lang).toBe("ar"); });
  it("toggles light and dark theme from the header", () => { render(<Shell><SiteChrome><div>Home content</div></SiteChrome></Shell>); const themeButton = screen.getByRole("button", { name: "Switch theme" }); fireEvent.click(themeButton); expect(document.documentElement.dataset.theme).toBe("dark"); fireEvent.click(themeButton); expect(document.documentElement.dataset.theme).toBe("light"); });
  it("renders card-based portfolio output through the AppRouter", () => { appPath = "/portfolio"; render(<Shell><AppRouter /></Shell>); expect(screen.getByText("Projects with a point of view.")).toBeTruthy(); expect(screen.getAllByRole("link", { name: /View visual story/i }).length).toBeGreaterThan(0); });
  it("does not render the testimonials section on Home", () => { render(<Shell><Home /></Shell>); expect(document.querySelector(".testimonials-section")).toBeNull(); expect(screen.queryByText("What people say about my work.")).toBeNull(); expect(screen.queryByText("ما يقوله الناس عن أعمالي.")).toBeNull(); });
  it("applies saved Home Page Editor settings to the public DOM", () => {
    mockHomeData.sections = [
      { key: "page_editor_home", content: JSON.stringify({ titleEn: "Controlled hero title", subtitleEn: "Controlled hero subtitle", heroImageUrl: "home-hero.jpg", contentAlignment: "center", spacingY: "compact", iconStyle: "minimal", buttonLightBg: "#123456", buttonLightText: "#fedcba", sectionOrder: ["services", "hero", "featured", "about", "journal", "contact"] }) },
      { key: "page_editor_services", content: JSON.stringify({ gridBgLight: "rgba(255,0,0,.12)", gridCardBgLight: "#123456", gridCardBorder: "2px solid #abcdef", gridCardRadius: "22px", gridCardOpacity: "0.82", gridTitleColorLight: "#112233", gridTextColorLight: "#445566", gridIconColorLight: "#778899" }) },
    ];
    render(<Shell><Home /></Shell>);
    expect(screen.getByRole("heading", { name: "Controlled hero title" })).toBeTruthy();
    const surface = document.querySelector("[data-page-editor='home']") as HTMLElement;
    expect(surface.style.getPropertyValue("--page-editor-button-light-bg")).toBe("#123456");
    expect(surface.style.getPropertyValue("--page-editor-grid-bg-light")).toBe("rgba(255,0,0,.12)");
    expect(surface.style.getPropertyValue("--page-editor-grid-card-bg-light")).toBe("#123456");
    expect(surface.style.getPropertyValue("--page-editor-grid-card-border")).toBe("2px solid #abcdef");
    expect(surface.style.getPropertyValue("--page-editor-grid-card-radius")).toBe("22px");
    expect(surface.style.getPropertyValue("--page-editor-grid-card-opacity")).toBe("0.82");
    expect(document.querySelector(".page-editor-home .hero-ethan")?.getAttribute("style")).toContain("order: 1");
    expect(document.querySelector(".page-editor-home")?.className).toContain("page-editor-align-center");
    expect((document.querySelector(".page-editor-home .page-editor-hero-image") as HTMLImageElement)?.src).toContain("home-hero.jpg");
  });
  it("applies saved Page Editor settings to Portfolio, About, Services, and Contact pages", () => {
    mockHomeData.sections = [
      { key: "page_editor_portfolio", content: JSON.stringify({ titleEn: "Controlled Portfolio Title", subtitleEn: "Controlled Portfolio Subtitle", heroImageUrl: "portfolio-hero.jpg", contentAlignment: "right", buttonLightBg: "#654321", sectionOrder: ["grid", "hero", "note"] }) },
      { key: "page_editor_about", content: JSON.stringify({ titleEn: "Controlled About Title", subtitleEn: "Controlled About Subtitle", heroImageUrl: "about-hero.jpg", contentAlignment: "center", buttonLightBg: "#765432", sectionOrder: ["experience", "skills", "hero", "story", "cta"] }) },
      { key: "page_editor_services", content: JSON.stringify({ titleEn: "Controlled Services Title", subtitleEn: "Controlled Services Subtitle", heroImageUrl: "services-hero.jpg", contentAlignment: "center", buttonLightBg: "#abcdef", gridBgLight: "rgba(0,0,0,.08)", gridCardBgLight: "#123456", gridCardBorder: "2px solid #abcdef", gridCardRadius: "24px", gridCardOpacity: "0.75", gridTitleColorLight: "#112233", gridTextColorLight: "#445566", gridIconColorLight: "#778899", sectionOrder: ["cta", "process", "detail", "hero"] }) },
      { key: "page_editor_contact", content: JSON.stringify({ titleEn: "Controlled Contact Title", subtitleEn: "Controlled Contact Subtitle", heroImageUrl: "contact-hero.jpg", contentAlignment: "right", buttonLightBg: "#fedcba", sectionOrder: ["faq", "social", "detail", "hero"] }) },
    ];
    appPath = "/portfolio";
    const { unmount: un1 } = render(<Shell><AppRouter /></Shell>);
    expect(screen.getByRole("heading", { name: "Controlled Portfolio Title" })).toBeTruthy();
    const portfolioSurface = document.querySelector("[data-page-editor='portfolio']") as HTMLElement;
    expect(portfolioSurface).toBeTruthy();
    expect(portfolioSurface.className).toContain("page-editor-align-right");
    expect(portfolioSurface.style.getPropertyValue("--page-editor-button-light-bg")).toBe("#654321");
    expect((portfolioSurface.querySelector(".page-editor-hero-image") as HTMLImageElement)?.src).toContain("portfolio-hero.jpg");
    expect(portfolioSurface.querySelector(".bazil-hero")?.getAttribute("style")).toContain("order: 1");
    un1();

    appPath = "/about";
    const { unmount: un2 } = render(<Shell><AppRouter /></Shell>);
    expect(screen.getByRole("heading", { name: "Controlled About Title" })).toBeTruthy();
    const aboutSurface = document.querySelector("[data-page-editor='about']") as HTMLElement;
    expect(aboutSurface).toBeTruthy();
    expect(aboutSurface.className).toContain("page-editor-align-center");
    expect((aboutSurface.querySelector(".page-editor-hero-image") as HTMLImageElement)?.src).toContain("about-hero.jpg");
    expect(aboutSurface.querySelector(".about-reference-experience")?.getAttribute("style")).toContain("order: 0");
    expect(aboutSurface.querySelector(".about-reference-skills")?.getAttribute("style")).toContain("order: 1");
    un2();

    appPath = "/services";
    const { unmount: un3 } = render(<Shell><AppRouter /></Shell>);
    expect(screen.getByRole("heading", { name: "Controlled Services Title" })).toBeTruthy();
    const servicesSurface = document.querySelector("[data-page-editor='services']") as HTMLElement;
    expect(servicesSurface).toBeTruthy();
    expect(servicesSurface.className).toContain("page-editor-align-center");
    expect(servicesSurface.style.getPropertyValue("--page-editor-button-light-bg")).toBe("#abcdef");
    expect(servicesSurface.style.getPropertyValue("--page-editor-grid-bg-light")).toBe("rgba(0,0,0,.08)");
    expect(servicesSurface.style.getPropertyValue("--page-editor-grid-card-bg-light")).toBe("#123456");
    expect(servicesSurface.style.getPropertyValue("--page-editor-grid-card-border")).toBe("2px solid #abcdef");
    expect(servicesSurface.style.getPropertyValue("--page-editor-grid-card-radius")).toBe("24px");
    expect(servicesSurface.style.getPropertyValue("--page-editor-grid-card-opacity")).toBe("0.75");
    expect((servicesSurface.querySelector(".page-editor-hero-image") as HTMLImageElement)?.src).toContain("services-hero.jpg");
    expect(servicesSurface.querySelector(".services-reference-grid .services-reference-card")).toBeTruthy();
    expect(servicesSurface.querySelector(".services-reference-cta")?.getAttribute("style")).toContain("order: 0");
    un3();

    appPath = "/contact";
    const { unmount: un4 } = render(<Shell><AppRouter /></Shell>);
    expect(screen.getByRole("heading", { name: "Controlled Contact Title" })).toBeTruthy();
    const contactSurface = document.querySelector("[data-page-editor='contact']") as HTMLElement;
    expect(contactSurface).toBeTruthy();
    expect(contactSurface.className).toContain("page-editor-align-right");
    expect(contactSurface.style.getPropertyValue("--page-editor-button-light-bg")).toBe("#fedcba");
    expect((contactSurface.querySelector(".page-editor-hero-image") as HTMLImageElement)?.src).toContain("contact-hero.jpg");
    expect(contactSurface.querySelector(".contact-reference-faq")?.getAttribute("style")).toContain("order: 0");
    un4();
  });
});
