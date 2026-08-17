import React, { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SiteChrome from "@/components/SiteChrome";
import PortraitComposition from "@/components/PortraitComposition";
import { useLocale } from "@/contexts/LocaleContext";
import { localizePost, localizeProject, localizeSection, siteCopy } from "@/lib/siteCopy";
import { ArrowUpRight, BriefcaseBusiness, Download, FileText, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Send, Sparkles } from "lucide-react";
import BehanceMark from "@/components/BehanceMark";

const ASSETS = { corporate: "/manus-storage/corporate-branding_c33e39f0.jpg", logo: "/manus-storage/logo_71186596.png" };
const fallbackProjects = [{ id: 1, title: "ERA shopping Logo & Brand", category: "Branding", description: "A cohesive visual identity built to make brands clear, credible, and memorable.", imageUrl: "/manus-storage/06551d240072049.693708b93fbdf_50482b65.jpeg" }, { id: 2, title: "Jenan Yemeni Honey Logo Branding", category: "Branding", description: "A warm identity system for a distinctive Yemeni honey brand.", imageUrl: "/manus-storage/03af8f154753213.6347e1e6a3468_2f3fc650.jpg" }, { id: 3, title: "Ekleel Alenayah Medical Company Logo Brand", category: "Medical Branding", description: "A clear, trustworthy identity for a modern medical company.", imageUrl: "/manus-storage/05070c210092607.670b6931a7ce1_f87bf103.jpg" }];
const fallbackStats = [{ value: "9+", label: "Years Experience" }, { value: "200+", label: "Happy Clients" }, { value: "500+", label: "Projects Completed" }];
function getSection(sections: any[] | undefined, key: string) { return sections?.find(section => section.key === key); }
function parseJson(value: unknown) { try { return JSON.parse(String(value || "null")); } catch { return null; } }

function FeaturedWorkCarousel({ projects, locale }: { projects: any[]; locale: "en" | "ar" }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
  const [dragging, setDragging] = useState(false);
  const groups = Array.from({ length: Math.ceil(projects.length / 3) }, (_, index) => projects.slice(index * 3, index * 3 + 3));
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    dragRef.current = { active: false, startX: event.clientX, startScroll: viewportRef.current.scrollLeft };
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 6) {
      dragRef.current.active = true;
      setDragging(true);
      viewportRef.current.scrollLeft = dragRef.current.startScroll - dx;
    }
  };
  const stopDragging = (event?: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;
    setDragging(false);
  };
  return <div className={`featured-work-viewport ${dragging ? "is-dragging" : ""}`} ref={viewportRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={stopDragging} onPointerCancel={stopDragging} onPointerLeave={() => { if (dragRef.current.active) stopDragging(); }}>
    <div className="featured-work-track">{groups.map((group, groupIndex) => <div className="featured-work-board" key={`board-${groupIndex}`}>
      {group[0] && <Link className="featured-work-main" href={`/portfolio/${group[0].id}`} onClick={(e) => { if (dragging) e.preventDefault(); }}><img src={group[0].imageUrl && (group[0].imageUrl.startsWith("http") || group[0].imageUrl.startsWith("/")) ? group[0].imageUrl : ASSETS.corporate} alt={group[0].title} onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = ASSETS.corporate; }} /><span className="featured-work-index">0{groupIndex * 3 + 1}</span><div className="featured-work-main-copy"><small>{group[0].category}</small><h3>{group[0].title}</h3><p>{group[0].description}</p><ArrowUpRight size={20} /></div></Link>}
      <div className="featured-work-stack">{group.slice(1).map((project, projectIndex) => <Link className="featured-work-side" href={`/portfolio/${project.id}`} key={project.id} onClick={(e) => { if (dragging) e.preventDefault(); }}><div><img src={project.imageUrl && (project.imageUrl.startsWith("http") || project.imageUrl.startsWith("/")) ? project.imageUrl : ASSETS.corporate} alt={project.title} onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = ASSETS.corporate; }} /><span className="featured-work-index">0{groupIndex * 3 + projectIndex + 2}</span></div><div className="featured-work-side-copy"><small>{project.category}</small><h3>{project.title}</h3><ArrowUpRight size={17} /></div></Link>)}</div>
    </div>)}</div>
    <div className="featured-work-hint"><span>{locale === "ar" ? "اسحب لاستعراض الأعمال" : "Drag to explore the work"}</span><span aria-hidden="true">← →</span></div>
  </div>;
}

function ServicesMarquee({ services, locale }: { services: any[]; locale: "en" | "ar" }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
  const [dragging, setDragging] = useState(false);
  const items = [...services.slice(0, 8), ...services.slice(0, 8)];
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    dragRef.current = { active: true, startX: event.clientX, startScroll: viewportRef.current.scrollLeft };
    viewportRef.current.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !viewportRef.current) return;
    viewportRef.current.scrollLeft = dragRef.current.startScroll - (event.clientX - dragRef.current.startX);
  };
  const stopDragging = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && viewportRef.current?.hasPointerCapture(event.pointerId)) viewportRef.current.releasePointerCapture(event.pointerId);
    dragRef.current.active = false;
    setDragging(false);
  };
  return <div className="services-marquee-shell">
    <div className={`services-marquee-viewport ${dragging ? "is-dragging" : ""}`} ref={viewportRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={stopDragging} onPointerCancel={stopDragging} onPointerLeave={() => { if (dragRef.current.active) stopDragging(); }}>
      <div className="services-marquee-track">{items.map((service: any, index: number) => { const Icon = [Sparkles, BriefcaseBusiness, Send, MessageCircle][index % 4]; return <article className="service-marquee-card" dir={locale === "ar" ? "rtl" : "ltr"} key={`${service.number || index}-${index}`}><div className="service-marquee-card-top"><div className="service-icon"><Icon size={17} /></div><span>{service.number || `0${(index % 8) + 1}`}</span></div><h3>{service.title}</h3><p>{service.description}</p><span className="service-marquee-rule" /></article>; })}</div>
    </div>
    <div className="services-marquee-footer"><span>{locale === "ar" ? "اسحب أو مرر لاستعراض الخدمات" : "Drag or swipe to explore services"}</span><span aria-hidden="true">← →</span></div>
  </div>;
}

export default function Home() {
  const { locale } = useLocale();
  const copy = siteCopy[locale];
  const { data, isLoading } = trpc.content.publicHome.useQuery();
  const hero = localizeSection(getSection(data?.sections, "hero"), locale);
  const about = localizeSection(getSection(data?.sections, "about"), locale);
  const contact = localizeSection(getSection(data?.sections, "contact"), locale);
  const resumeSection = getSection(data?.sections, "resume");
  const servicesSection = getSection(data?.sections, "services");
  const services = useMemo(() => { const raw = locale === "ar" ? servicesSection?.contentAr || servicesSection?.content : servicesSection?.contentEn || servicesSection?.content; const parsed = parseJson(raw); return Array.isArray(parsed) && parsed.length >= 8 ? parsed.map((item: any) => locale === "ar" ? { ...item, title: item.titleAr || item.title, description: item.descriptionAr || item.description, details: item.detailsAr || item.details } : item) : copy.servicesList; }, [servicesSection?.content, servicesSection?.contentEn, servicesSection?.contentAr, locale, copy.servicesList]);
  const statsSection = localizeSection(getSection(data?.sections, "stats"), locale);
  const stats = useMemo(() => { const parsed = parseJson(statsSection?.content); return locale === "ar" ? [{ value: "9+", label: "سنوات خبرة" }, { value: "200+", label: "عميل سعيد" }, { value: "500+", label: "مشروع مكتمل" }] : Array.isArray(parsed) && parsed.length ? parsed : fallbackStats; }, [statsSection?.content, locale]);
  const rawProjects = data?.projects?.length ? data.projects : fallbackProjects;
  const projects = rawProjects.map((project: any) => localizeProject(project, locale));
  const displayHeroTitle = hero?.title || copy.home.heroTitle;
  const displayHeroSubtitle = hero?.subtitle || copy.home.heroSubtitle;
  const displayAbout = about?.content || (locale === "ar" ? "مصمم جرافيك بخبرة تتجاوز 9 سنوات في بناء الهويات البصرية والشعارات والتصميم الطباعي." : "Creative graphic designer with 9+ years of experience in branding and visual identity development.");
  const email = (locale === "ar" ? contact?.titleAr : contact?.titleEn) || contact?.title || "info@emadalddine.com";
  const phone = contact?.subtitle || "+966 504487308";
  const whatsappHref = `https://wa.me/${phone.replace(/\D/g, "")}`;
  const resumeUrl = resumeSection?.imageUrl || "";
  const featuredProjects = projects.length ? projects : fallbackProjects;

  return <SiteChrome><div className="home-page">
    <section className="hero-ethan site-shell" data-reveal="hero">
      <div className="hero-ethan-main">
        <div className="hero-ethan-copy">
          <div className="hero-ethan-title"><div className="eyebrow"><span className="eyebrow-line" /> {locale === "ar" ? "مرحباً، أنا عماد الدين" : "HELLO, I'M EMAD"}</div><h1>{displayHeroTitle}</h1></div>
          <div className="hero-ethan-info"><p>{displayHeroSubtitle} {displayAbout}</p><div className="hero-ethan-buttons"><Link className="button button-primary" href="/portfolio">{copy.home.work} <ArrowUpRight size={17} /></Link>{resumeUrl ? <a className="button button-outline" href={resumeUrl} download target="_blank" rel="noreferrer">{locale === "ar" ? "تحميل السيرة الذاتية" : "Download CV"} <Download size={16} /></a> : <Link className="button button-outline" href="/contact">{locale === "ar" ? "تواصل لطلب السيرة" : "Request CV"} <Download size={16} /></Link>}</div><div className="hero-ethan-social"><span>{locale === "ar" ? "تواصل معي" : "Connect with me"}</span><div className="hero-ethan-social-links"><a href="https://instagram.com/emadalddine" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={15} /></a><a href="https://behance.net/emadalddine" target="_blank" rel="noreferrer" aria-label="Behance"><BehanceMark size={15} /></a><a href="https://linkedin.com/in/emadalddine" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={15} /></a></div></div><div className="hero-phone-line"><Phone size={15} /><a href={`tel:${phone.replace(/\s+/g, "")}`} dir="ltr" className="phone-ltr">{phone}</a><a href={whatsappHref} target="_blank" rel="noreferrer" aria-label={locale === "ar" ? "واتساب" : "WhatsApp"}><MessageCircle size={15} /></a></div></div>
        </div>
        <div className="hero-ethan-visual" data-reveal="media"><PortraitComposition /></div>
      </div>
    </section>

    <section className="section-block site-shell home-preview-section featured-work-section" data-reveal><div className="section-heading featured-work-heading"><div><span className="eyebrow">{copy.home.selected}</span><h2>{copy.home.featured}</h2></div><p>{copy.home.featuredIntro}</p></div>{isLoading ? <div className="loading-line">{locale === "ar" ? "جاري تحميل أحدث الأعمال..." : "Loading the latest work..."}</div> : <FeaturedWorkCarousel projects={featuredProjects} locale={locale} />}<div className="section-link-row"><Link className="text-link" href="/portfolio">{copy.home.explore} <ArrowUpRight size={16} /></Link><span>{locale === "ar" ? "هوية / شعارات / تصميم طباعي" : "Branding / Logo Design / Print Design"}</span></div></section>

    <section className="about-section" data-reveal><div className="site-shell about-grid"><div className="about-image about-image-logo"><img src={ASSETS.logo} alt={locale === "ar" ? "شعار عماد الدين" : "EmadAlddine logo"} draggable={false} /></div><div className="about-copy"><span className="eyebrow">{copy.home.aboutEyebrow}</span><h2>{copy.home.aboutTitle}</h2><p>{displayAbout}</p><p className="muted-copy">{copy.home.aboutMuted}</p><div className="signature-row"><span className="signature">EmadAlddine</span><span className="signature-caption">{locale === "ar" ? "مصمم جرافيك أول" : "Senior Graphic Designer"}</span></div><Link className="button button-light about-cta" href="/about">{copy.home.moreAbout} <ArrowUpRight size={17} /></Link></div></div></section>

    <section className="section-block services-section site-shell" data-reveal><div className="section-heading"><div><span className="eyebrow">{copy.home.servicesEyebrow}</span><h2>{copy.home.servicesTitle}</h2></div><p>{copy.home.servicesIntro}</p></div><ServicesMarquee services={services} locale={locale} /><div className="section-link-row"><Link className="text-link" href="/services">{copy.home.viewServices} <ArrowUpRight size={16} /></Link><span>{locale === "ar" ? "استراتيجية / هوية / طباعة" : "Strategy / Identity / Print"}</span></div></section>

    <section className="testimonials-section" data-reveal><div className="site-shell"><div className="testimonials-header"><div><span className="eyebrow">{locale === "ar" ? "آراء العملاء" : "Client Feedback"}</span><h2>{locale === "ar" ? "ما يقوله الناس عن أعمالي." : "What people say about my work."}</h2></div><Link className="button button-outline" href="/contact">{locale === "ar" ? "جميع الآراء" : "All Testimonials"}</Link></div><div className="testimonials-track-wrap"><div className="testimonials-track">{[...(copy.testimonials || []), ...(copy.testimonials || [])].map((item: any, i: number) => <div className="testimonial-card" key={`${item.name}-${i}`}><p>"{item.quote}"</p><div className="testimonial-author"><img src={item.avatar} alt={item.name} /><div><strong>{item.name}</strong><span>{item.role}</span></div></div></div>)}</div></div></div></section>
    <section className="section-block posts-section site-shell" data-reveal><div className="section-heading"><div><span className="eyebrow">{copy.home.journal}</span><h2>{copy.home.journalTitle}</h2></div><p>{copy.home.journalIntro}</p></div>{data?.posts?.length ? <div className="posts-grid" data-reveal="stagger">{data.posts.slice(0, 3).map((rawPost: any) => { const post = localizePost(rawPost, locale); return <article className="post-card" key={post.id}><div className="post-card-top">{post.imageUrl ? <img src={post.imageUrl} alt="" /> : <div className="post-placeholder"><FileText size={20} /></div>}</div><div className="post-card-body"><span>{new Date(post.publishedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : undefined)}</span><h3>{post.title}</h3><p>{post.summary}</p></div></article>; })}</div> : <div className="posts-empty"><FileText size={20} /><p>{copy.home.noPosts}</p><span>{copy.home.noPostsHint}</span></div>}</section>
    <section className="contact-section site-shell" data-reveal><div className="contact-inner"><div><span className="eyebrow eyebrow-light">{copy.home.contactEyebrow}</span><h2>{copy.home.contactTitle}<br /><em>{copy.home.contactAccent}</em></h2><p>{copy.home.contactIntro}</p></div><div className="contact-actions"><Link className="button button-light" href="/contact">{copy.home.contact} <ArrowUpRight size={17} /></Link><a className="button button-outline-light" href={whatsappHref} target="_blank" rel="noreferrer">{copy.home.whatsapp} <ArrowUpRight size={17} /></a></div></div></section>
  </div></SiteChrome>;
}
