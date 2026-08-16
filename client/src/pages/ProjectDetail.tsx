import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Layers3 } from "lucide-react";
import { useRef } from "react";
import { Link, useLocation } from "wouter";
import SiteChrome from "@/components/SiteChrome";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeProject } from "@/lib/siteCopy";
import { fallbackProjects } from "@/pages/Portfolio";

export default function ProjectDetail() {
  const [location] = useLocation();
  const slidesRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();
  const id = Number(location.split("/")[2] || 0);
  const { data, isLoading } = trpc.content.publicProject.useQuery({ id }, { enabled: Boolean(id) });
  const fallback = fallbackProjects.find(project => project.id === id);
  const project = localizeProject(data || fallback, locale);
  const slides = project?.slides?.length ? project.slides : project ? [{ id: 1, title: project.title, description: project.description, imageUrl: project.imageUrl, displayOrder: 0 }] : [];
  const isArabic = locale === "ar";
  const scrollSlides = (direction: number) => { slidesRef.current?.scrollBy({ left: direction * Math.max(280, slidesRef.current.clientWidth * 0.78), behavior: "smooth" }); };

  if (isLoading && !fallback) return <SiteChrome><div className="project-detail-loading site-shell">{isArabic ? "جاري تحميل المشروع..." : "Loading project..."}</div></SiteChrome>;
  if (!project) return <SiteChrome><div className="project-detail-loading site-shell"><h1>{isArabic ? "المشروع غير موجود" : "Project not found"}</h1><Link href="/portfolio" className="button button-primary">{isArabic ? "العودة إلى الأعمال" : "Back to portfolio"}<ArrowUpRight size={17} /></Link></div></SiteChrome>;

  return <SiteChrome>
    <div className="inner-page project-detail-page">
      <section className="project-detail-hero site-shell" data-reveal="hero"><div className="project-detail-hero-copy"><Link href="/portfolio" className="back-link">{isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}{isArabic ? "العودة إلى الأعمال" : "Back to portfolio"}</Link><span className="eyebrow"><span className="eyebrow-line" /> {project.category}</span><h1>{project.title}</h1><p>{project.description}</p><div className="project-detail-meta"><span>{project.clientName || project.title}</span><span>{String(slides.length).padStart(2, "0")} {isArabic ? "مراحل مختارة" : "selected stages"}</span></div></div><div className="project-detail-mark"><Layers3 size={26} /><span>{isArabic ? "صفحة المشروع" : "Project page"}<br />{String(project.id).padStart(2, "0")}</span></div></section>
      <section className="project-detail-gallery site-shell" data-reveal><div className="project-detail-gallery-heading"><div><span className="eyebrow">{isArabic ? "القصة البصرية" : "The visual story"}</span><h2>{isArabic ? "من الفكرة إلى التطبيق." : "From idea to application."}</h2></div><p>{isArabic ? "استعرض مراحل الهوية وتطبيقاتها دون مغادرة الموقع." : "Explore the identity stages and applications without leaving the site."}</p></div><div className="project-detail-scroll-note"><span>{isArabic ? "مرّر لاستعراض بقية مراحل المشروع" : "Scroll to explore the project stages"}</span><span className="project-detail-scroll-line" /><div className="project-detail-scroll-actions"><button type="button" aria-label={isArabic ? "المرحلة السابقة" : "Previous stage"} onClick={() => scrollSlides(isArabic ? 1 : -1)}><ArrowLeft size={16} /></button><button type="button" aria-label={isArabic ? "المرحلة التالية" : "Next stage"} onClick={() => scrollSlides(isArabic ? -1 : 1)}><ArrowRight size={16} /></button></div></div><div className="project-detail-slides" ref={slidesRef} role="list" aria-label={isArabic ? "مراحل المشروع" : "Project stages"}>{slides.map((slide: any, index: number) => <article className="project-detail-slide" key={slide.id || index} data-reveal="media" data-slide-index={index} role="listitem"><div className="project-detail-slide-number">{String(index + 1).padStart(2, "0")}</div><div className="project-detail-slide-image"><img src={slide.imageUrl || project.imageUrl} alt={slide.title || project.title} /></div><div className="project-detail-slide-copy"><span>{project.category}</span><h3>{slide.title || (isArabic ? `مرحلة ${index + 1}` : `Stage ${index + 1}`)}</h3><p>{slide.description || project.description}</p><Check size={18} /></div></article>)}</div></section>
      <section className="project-detail-cta" data-reveal><div className="site-shell project-detail-cta-inner"><div><span className="eyebrow eyebrow-light">{isArabic ? "هل لديك مشروع مشابه؟" : "Have a similar project?"}</span><h2>{isArabic ? <>لنجعل الفكرة<br /><em>واضحة ومؤثرة.</em></> : <>Let’s make the idea<br /><em>clear and memorable.</em></>}</h2></div><Link href="/contact" className="button button-light">{isArabic ? "تواصل معي" : "Start a conversation"}<ArrowUpRight size={17} /></Link></div></section>
    </div>
  </SiteChrome>;
}
