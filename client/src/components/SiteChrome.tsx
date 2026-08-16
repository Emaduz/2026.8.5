import { Globe2, Instagram, Linkedin, Mail, MapPin, Menu, MessageCircle, Moon, Sun, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import BehanceMark from "@/components/BehanceMark";
import { trpc } from "@/lib/trpc";
import { isActiveRoute } from "@/lib/navigationInteractions";
import { useLocale } from "@/contexts/LocaleContext";
import { useTheme } from "@/contexts/ThemeContext";

const ASSETS = { logo: "/manus-storage/logo_71186596.png" };
export const navItems = [["Home", "/"], ["Portfolio", "/portfolio"], ["About", "/about"], ["Services", "/services"], ["Contact", "/contact"]] as const;

function getSection(sections: any[] | undefined, key: string) { return sections?.find(section => section.key === key); }
function getLinks(content?: string) { try { return content ? JSON.parse(content) : {}; } catch { return {}; } }
function normalizePhone(value: string) { const arabicDigits = "٠١٢٣٤٥٦٧٨٩"; return value.replace(/[٠-٩]/g, digit => String(arabicDigits.indexOf(digit))).replace(/\D/g, ""); }

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [location] = useLocation();
  const { locale, dir, toggleLocale, t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const { data } = trpc.content.publicHome.useQuery();
  const contact = getSection(data?.sections, "contact");
  const about = getSection(data?.sections, "about");
  const links = getLinks(getSection(data?.sections, "links")?.content);
  const email = (locale === "ar" ? contact?.titleAr : contact?.titleEn) || contact?.title || "info@emadalddine.com";
  const phone = (locale === "ar" ? contact?.subtitleAr : contact?.subtitleEn) || contact?.subtitle || "+966 504487308";
  const address = (locale === "ar" ? contact?.contentAr : contact?.contentEn) || contact?.content || (locale === "ar" ? "المدينة المنورة، المملكة العربية السعودية" : "Al-Madina, Saudi Arabia");
  const whatsappHref = `https://wa.me/${normalizePhone(phone)}`;
  const aboutText = (locale === "ar" ? about?.contentAr : about?.contentEn) || about?.content || (locale === "ar" ? "مصمم جرافيك بخبرة تتجاوز 9 سنوات في بناء الهويات البصرية وتطوير العلامات التجارية." : "Creative graphic designer with 9+ years of experience in branding and visual identity development.");

  useEffect(() => {
    const updateProgress = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setScrollProgress(max > 0 ? (window.scrollY / max) * 100 : 0); };
    updateProgress(); window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [location]);
  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!revealItems.length) return;
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
      revealItems.forEach(item => observer.observe(item));
      return () => observer.disconnect();
    }
    revealItems.forEach(item => item.classList.add("is-visible"));
  }, [location]);

  const socialLinks = useMemo(() => ({ instagram: links.instagram || "https://instagram.com/emadalddine", linkedin: links.linkedin || "https://linkedin.com/in/emadalddine", behance: links.behance || "https://behance.net/emadalddine" }), [links.instagram, links.linkedin, links.behance]);
  const labels: Record<string, string> = { Home: t.home, Portfolio: t.portfolio, About: t.about, Services: t.services, Contact: t.contact };

  return <div dir={dir} lang={locale} className={`site-app ${dir === "rtl" ? "is-rtl" : ""} theme-${theme} min-h-screen overflow-hidden`}>
    <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />
    <header className="site-header site-header-solid">
      <div className="site-shell header-inner">
        <Link href="/" className="brand-lockup" onClick={() => setMobileOpen(false)} aria-label={t.home}><span className="brand-mark"><img src={ASSETS.logo} alt="EmadAlddine Logo" /></span><span className="brand-copy"><strong>Eng.EmadAlddine</strong><small>{t.seniorDesigner}</small></span></Link>
        <nav className={`main-nav ${mobileOpen ? "is-open" : ""}`} aria-label="Main navigation">{navItems.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={isActiveRoute(location, href) ? "is-active" : ""}>{labels[label]}</Link>)}</nav>
        <div className="header-actions">
          <button className="header-pill" onClick={toggleLocale} aria-label={t.switchLanguage} title={t.switchLanguage}><Globe2 size={15} /><span>{locale === "en" ? "عربي" : "EN"}</span></button>
          <button className="header-pill" onClick={toggleTheme} aria-label={t.switchTheme} title={t.switchTheme}>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}<span>{theme === "light" ? t.darkTheme : t.lightTheme}</span></button>
          <button className="menu-button" onClick={() => setMobileOpen(value => !value)} aria-label={mobileOpen ? t.closeMenu : t.openMenu}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
    </header>
    <main className="page-transition" key={location}>{children}</main>
    <a className="whatsapp-float" href={whatsappHref} target="_blank" rel="noreferrer" aria-label={t.whatsapp}><span className="whatsapp-float-icon" aria-hidden="true"><MessageCircle size={22} /></span><span className="whatsapp-float-label">{t.whatsapp}</span></a>
    <footer className="site-footer">
      <div className="site-shell footer-grid"><div className="footer-brand"><span className="brand-mark"><img src={ASSETS.logo} alt="EmadAlddine Logo" /></span><div><h3>Eng.EmadAlddine</h3><span>{t.seniorDesigner}</span></div><p>{aboutText}</p></div><div className="footer-column"><span className="footer-label">{locale === "ar" ? "تواصل" : "Contact"}</span><a href={`mailto:${email}`}><Mail size={15} />{email}</a><a href={`tel:${phone.replaceAll(" ", "")}`}><MessageCircle size={15} /><span dir="ltr" className="phone-ltr">{phone}</span></a><span><MapPin size={15} />{address}</span></div><div className="footer-column"><span className="footer-label">{locale === "ar" ? "تابعني" : "Follow me"}</span><a href={socialLinks.instagram} target="_blank" rel="noreferrer"><Instagram size={15} />Instagram</a><a href={socialLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin size={15} />LinkedIn</a><a href={socialLinks.behance} target="_blank" rel="noreferrer"><BehanceMark size={15} />Behance</a></div></div>
      <div className="site-shell footer-bottom"><span>© 2026 Eng.EmadAlddine. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</span><span>{locale === "ar" ? "صُمم بقصد." : "Built with intention."}</span></div>
    </footer>
  </div>;
}
