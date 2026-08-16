import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const projectRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const read = (relativePath: string) => readFileSync(join(projectRoot, relativePath), "utf8");

describe("final bilingual and visual polish contracts", () => {
  it("exposes paired Arabic and English admin fields with independent cover uploads", () => {
    const admin = read("client/src/pages/Admin.tsx");
    expect(admin).toContain("function BilingualFields");
    expect(admin).toContain("titleAr");
    expect(admin).toContain("contentAr");
    expect(admin).toContain("contentEn");
    expect(admin).toContain("Cover image (shown on Portfolio and project page)");
    expect(admin).toContain("Upload cover image");
    expect(admin).toContain("Profile portrait");
    expect(admin).toContain('key: "portrait"');
    expect(admin).toContain("Project slides");
  });

  it("keeps the portrait asset behind a server route and disables common drag/save affordances", () => {
    const portrait = read("client/src/components/PortraitComposition.tsx");
    const server = read("server/_core/index.ts");
    expect(portrait).toContain('src = "/api/portrait?v=9"');
    expect(portrait).toContain("draggable={false}");
    expect(portrait).toContain("onContextMenu");
    expect(server).toContain('app.get("/api/portrait"');
    expect(server).toContain("storageGetSignedUrl");
    expect(portrait).not.toContain("/manus-storage/emad-portrait-transparent");
  });

  it("defines exactly three calm elliptical orbit tracks around the existing portrait", () => {
    const css = read("client/src/index.css");
    const portrait = read("client/src/components/PortraitComposition.tsx");
    expect(portrait).toContain("portrait-orbit-three");
    expect(portrait).toContain("portrait-asteroid-one");
    expect(portrait).toContain("portrait-asteroid-two");
    expect(portrait).toContain("portrait-asteroid-three");
    expect(css).toContain("@keyframes orbit-track-one");
    expect(css).toContain("@keyframes orbit-track-two");
    expect(css).toContain("@keyframes orbit-track-three");
    expect(css).toContain("border-color: rgba(217,202,177,.88)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("exposes the managed PDF resume and clears the fixed-header overlap", () => {
    const admin = read("client/src/pages/Admin.tsx");
    const router = read("server/routers.ts");
    const home = read("client/src/pages/Home.tsx");
    const css = read("client/src/index.css");
    expect(admin).toContain("UploadResumeField");
    expect(admin).toContain('key: "resume"');
    expect(router).toContain("uploadResume");
    expect(router).toContain('z.literal("application/pdf")');
    expect(home).toContain("resumeSection");
    expect(home).toContain('download target="_blank"');
    expect(css).toContain(".hero-ethan { padding-top: clamp(126px");
    expect(css).toContain("background: linear-gradient(145deg, #d9cab1");
    expect(css).toContain("border: 0 !important;");
  });

  it("uses the Behance mark instead of a generic check icon in every public social placement", () => {
    const home = read("client/src/pages/Home.tsx");
    const chrome = read("client/src/components/SiteChrome.tsx");
    const about = read("client/src/pages/About.tsx");
    const contact = read("client/src/pages/Contact.tsx");
    const mark = read("client/src/components/BehanceMark.tsx");
    expect(mark).toContain("<path");
    expect(mark).toContain("viewBox=\"0 0 28 20\"");
    expect(mark).not.toContain("<text");
    expect(home).toContain("<BehanceMark");
    expect(chrome).toContain("<BehanceMark");
    expect(about).not.toContain("<Check");
    expect(contact).toContain("<BehanceMark");
    expect(chrome).not.toContain("<Check size={15} />Behance");
    expect(home).not.toContain("<Check size={15} />");
  });

  it("matches the About reference information architecture and keeps it bilingual", () => {
    const about = read("client/src/pages/About.tsx");
    const copy = read("client/src/lib/siteCopy.ts");
    const css = read("client/src/index.css");
    expect(about).toContain("about-reference-intro");
    expect(about).toContain("about-reference-sidebar");
    expect(about).toContain("about-reference-experience");
    expect(about).toContain("about-reference-skills");
    expect(copy).toContain("personalTitle: \"Personal Information\"");
    expect(copy).toContain("personalTitle: \"معلومات شخصية\"");
    expect(copy).toContain("experienceTitle: \"Experience\"");
    expect(copy).toContain("experienceTitle: \"الخبرات\"");
    expect(css).toContain(".about-reference-layout");
    expect(css).toContain(".site-app.is-rtl .about-reference-layout");
  });

  it("keeps the portrait zoomed out enough to include both shoulders and preserves exactly three orbit paths", () => {
    const css = read("client/src/index.css");
    const comp = read("client/src/components/PortraitComposition.tsx");
    expect(css).toContain("Portrait zoom-out");
    expect(css).toContain("object-fit: contain !important");
    expect(css).toContain("portrait-fit-zoom");
    expect(css).toContain("object-position: 50% 60% !important");
    expect(css).toContain("object-position: 50% 0% !important");
    expect(comp).toContain("portrait-orbit-one");
    expect(comp).toContain("portrait-orbit-two");
    expect(comp).toContain("portrait-orbit-three");
  });

  it("matches the Contact reference structure and keeps the message flow bilingual", () => {
    const contact = read("client/src/pages/Contact.tsx");
    const css = read("client/src/index.css");
    expect(contact).toContain("contact-reference-form");
    expect(contact).toContain("contact-reference-info-card");
    expect(contact).toContain("Frequently Asked Questions");
    expect(contact).toContain("handleSubmit");
    expect(contact).toContain("contact?.titleAr");
    expect(contact).toContain("contact?.contentAr");
    expect(contact).toContain("BehanceMark");
    expect(css).toContain(".contact-reference-main");
    expect(css).toContain(".contact-reference-faq");
    expect(css).toContain(".site-app.is-rtl .contact-reference-main");
  });

  it("keeps public Arabic copy natural and free of unintended English UI labels", () => {
    const copy = read("client/src/lib/siteCopy.ts");
    const home = read("client/src/pages/Home.tsx");
    const arabicStart = copy.indexOf("  ar: {");
    const arabicEnd = copy.indexOf("\n  },\n};", arabicStart);
    const arabicCopy = copy.slice(arabicStart, arabicEnd > arabicStart ? arabicEnd : undefined);
    expect(arabicCopy).toContain("مجموعة أدوبي الإبداعية");
    expect(arabicCopy).toContain("تصميم واجهات وتجربة المستخدم");
    expect(arabicCopy).not.toContain("UI/UX");
    expect(arabicCopy).not.toContain("Get Started");
    expect(home).toContain("جاري تحميل أحدث الأعمال...");
    expect(home).toContain("اسحب لاستعراض الأعمال");
  });

  it("implements the requested static logo block, drag carousel, and eight-service constellation", () => {
    const home = read("client/src/pages/Home.tsx");
    const portrait = read("client/src/components/PortraitComposition.tsx");
    const css = read("client/src/index.css");
    expect(home).toContain("FeaturedWorkCarousel");
    expect(home).toContain("onPointerDown");
    expect(home).toContain("featured-work-main");
    expect(home).toContain("about-image-logo");
    expect(home).toContain("ServicesMarquee");
    expect(home).toContain("services.slice(0, 8)");
    expect(portrait).toContain("static?: boolean");
    expect(portrait).toContain("portrait-composition-static");
    expect(css).toContain(".featured-work-viewport");
    expect(css).toContain(".services-marquee-track");
    expect(css).toContain("@keyframes services-marquee-slide");
    expect(css).toContain("from { transform: translateX(calc(-50% - 8px)); } to { transform: translateX(0); }");
    expect(css).toContain(".about-image-logo::before");
  });

  it("routes the replacement portrait through the privacy proxy", () => {
    const portrait = read("client/src/components/PortraitComposition.tsx");
    const server = read("server/_core/index.ts");
    const about = read("client/src/pages/About.tsx");
    expect(portrait).toContain('src = "/api/portrait?v=9"');
    expect(about).toContain('const portrait = "/api/portrait?v=9"');
    expect(portrait).not.toContain("emad-portrait-new_81c16977.jpg");
    expect(server).toContain('getSectionByKey("portrait")');
    expect(server).toContain('"emad-portrait-new_81c16977.jpg"');
  });

  it("uses the static site logo in the Contact profile card", () => {
    const contact = read("client/src/pages/Contact.tsx");
    expect(contact).toContain("contact-reference-profile-logo");
    expect(contact).toContain("ASSETS.logo");
    expect(contact).not.toContain("<PortraitComposition compact static />");
  });

  it("links service package cards to direct WhatsApp consultation with prefilled messages", () => {
    const services = read("client/src/pages/Services.tsx");
    expect(services).toContain("https://wa.me/966504487308?text=");
    expect(services).toContain("service.title");
    expect(services).toContain("target=\"_blank\"");
  });

  it("keeps the Services CTA modern, full-bleed, and bilingual", () => {
    const services = read("client/src/pages/Services.tsx");
    const css = read("client/src/index.css");
    expect(services).toContain("services-reference-cta-shell");
    expect(services).toContain("services-reference-cta-watermark");
    expect(services).toContain("services-reference-cta-action");
    expect(services).toContain("services-reference-cta-button");
    expect(css).toContain(".services-reference-cta-shell");
    expect(css).toContain(".site-app.is-rtl .services-reference-cta-action");
    expect(css).toContain("@media (max-width: 760px)");
  });

  it("matches the Services reference structure and exposes bilingual admin controls", () => {
    const services = read("client/src/pages/Services.tsx");
    const admin = read("client/src/pages/Admin.tsx");
    const css = read("client/src/index.css");
    expect(services).toContain("services-reference-grid");
    expect(services).toContain("services-reference-popular");
    expect(services).toContain("services-reference-process-grid");
    expect(services).toContain("FALLBACK_SERVICES");
    expect(services).toContain("FALLBACK_PROCESS");
    expect(admin).toContain("Starting price");
    expect(admin).toContain("Most popular");
    expect(admin).toContain("Ready CTA title");
    expect(admin).toContain("Process description");
    expect(admin).toContain('number: "08"');
    expect(admin).toContain("Creative Direction");
    expect(css).toContain(".services-reference-grid");
    expect(css).toContain(".services-reference-process-grid");
  });

  it("starts new routes at the top and restores scroll position on browser Back", () => {
    const app = read("client/src/App.tsx");
    expect(app).toContain('window.history.scrollRestoration = "manual"');
    expect(app).toContain('window.addEventListener("popstate", handlePopState)');
    expect(app).toContain('window.scrollTo({ top: nextScrollTop');
    expect(app).toContain('isPopNavigation.current ? positions.current.get(location) ?? 0 : 0');
  });

  it("keeps public services and contact data connected to the selected locale", () => {
    const home = read("client/src/pages/Home.tsx");
    const services = read("client/src/pages/Services.tsx");
    const contact = read("client/src/pages/Contact.tsx");
    expect(home).toContain("servicesSection");
    expect(home).toContain("contentAr");
    expect(services).toContain("localizedSectionValue");
    expect(services).toContain("record.titleAr");
    expect(contact).toContain("contact?.titleAr");
    expect(contact).toContain("contact?.contentAr");
  });
});
