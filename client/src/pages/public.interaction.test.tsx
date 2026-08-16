// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import SiteChrome from "@/components/SiteChrome";
import Portfolio from "@/pages/Portfolio";
import { AppRouter } from "@/App";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

vi.mock("@/lib/trpc", () => ({ trpc: { content: { publicHome: { useQuery: () => ({ data: { sections: [], projects: [], posts: [] }, isLoading: false }) }, publicProject: { useQuery: () => ({ data: null, isLoading: false }) } } } }));
const navigateSpy = vi.fn();
let appPath = "/";
function useSpyLocation() { return [appPath, navigateSpy] as [string, (path: string, ...args: any[]) => void]; }
function Shell({ children }: { children: React.ReactNode }) { return <ThemeProvider><LocaleProvider><Router hook={useSpyLocation}>{children}</Router></LocaleProvider></ThemeProvider>; }

beforeEach(() => { cleanup(); vi.clearAllMocks(); appPath = "/"; window.localStorage.clear(); document.documentElement.dir = "ltr"; document.documentElement.lang = "en"; Object.defineProperty(window, "matchMedia", { writable: true, value: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }) }); });

describe("public navigation and interactions", () => {
  it("moves to Portfolio from the fixed top navigation", () => { render(<Shell><SiteChrome><div>Home content</div></SiteChrome></Shell>); const portfolioLink = screen.getByRole("link", { name: "Portfolio" }); fireEvent.click(portfolioLink); expect(navigateSpy).toHaveBeenCalledWith("/portfolio", expect.anything()); });
  it("exposes the floating WhatsApp action with the current number", () => { render(<Shell><SiteChrome><div>Home content</div></SiteChrome></Shell>); const whatsappLink = screen.getByRole("link", { name: "Message on WhatsApp" }); expect(whatsappLink.getAttribute("href")).toBe("https://wa.me/966504487308"); expect(whatsappLink.getAttribute("target")).toBe("_blank"); });
  it("switches the entire chrome to Arabic RTL while keeping the control-panel entry hidden from the footer", () => { render(<Shell><SiteChrome><div>Home content</div></SiteChrome></Shell>); fireEvent.click(screen.getByRole("button", { name: "Switch language" })); expect(screen.getByRole("link", { name: "الأعمال" })).toBeTruthy(); expect(screen.queryByRole("link", { name: /Emadalddine/ })).toBeNull(); expect(document.documentElement.dir).toBe("rtl"); expect(document.documentElement.lang).toBe("ar"); });
  it("toggles light and dark theme from the header", () => { render(<Shell><SiteChrome><div>Home content</div></SiteChrome></Shell>); const themeButton = screen.getByRole("button", { name: "Switch theme" }); fireEvent.click(themeButton); expect(document.documentElement.dataset.theme).toBe("dark"); fireEvent.click(themeButton); expect(document.documentElement.dataset.theme).toBe("light"); });
  it("renders card-based portfolio output through the AppRouter", () => { appPath = "/portfolio"; render(<Shell><AppRouter /></Shell>); expect(screen.getByText("Each project starts with an idea.")).toBeTruthy(); expect(screen.getAllByRole("link", { name: /View project/i }).length).toBeGreaterThan(0); });
});
