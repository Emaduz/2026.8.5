import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import SiteChrome from "@/components/SiteChrome";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeProject } from "@/lib/siteCopy";
import { fallbackProjects } from "@/pages/Portfolio";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Layers3, X, ZoomIn } from "lucide-react";

export default function ProjectDetail() {
  const [location] = useLocation();
  const { locale } = useLocale();
  // Lightbox removed per user request
  const id = Number(location.split("/")[2] || 0);
  const { data, isLoading } = trpc.content.publicProject.useQuery({ id }, { enabled: Boolean(id) });
  const fallback = fallbackProjects.find(project => project.id === id);
  const project = localizeProject(data || fallback, locale);
  const slides = project?.slides?.length ? project.slides : project ? [{ id: 1, title: project.title, description: project.description, imageUrl: project.imageUrl, displayOrder: 0 }] : [];
  const isArabic = locale === "ar";

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll(".project-detail-page [data-reveal]").forEach(el => el.classList.add("is-visible"));
    }, 60);
    return () => clearTimeout(timer);
  }, [project, slides]);

  if (isLoading && !fallback) return <SiteChrome><div className="project-detail-loading site-shell">{isArabic ? "جاري تحميل المشروع..." : "Loading project..."}</div></SiteChrome>;
  if (!project) return <SiteChrome><div className="project-detail-loading site-shell"><h1>{isArabic ? "المشروع غير موجود" : "Project not found"}</h1><Link href="/portfolio" className="button button-primary">{isArabic ? "العودة إلى الأعمال" : "Back to portfolio"}<ArrowUpRight size={17} /></Link></div></SiteChrome>;

  return <SiteChrome>
    <div className="inner-page project-detail-page">
      <section className="project-detail-hero site-shell" data-reveal="hero"><div className="project-detail-hero-copy"><Link href="/portfolio" className="back-link">{isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}{isArabic ? "العودة إلى الأعمال" : "Back to portfolio"}</Link><span className="eyebrow"><span className="eyebrow-line" /> {project.category}</span><h1>{project.title}</h1><p>{project.description}</p><div className="project-detail-meta"><span>{project.clientName || project.title}</span><span>{String(slides.length).padStart(2, "0")} {isArabic ? "مراحل مختارة" : "selected stages"}</span></div></div><div className="project-detail-mark"><Layers3 size={26} /><span>{isArabic ? "صفحة المشروع" : "Project page"}<br />{String(project.id).padStart(2, "0")}</span></div></section>
      <section className="project-detail-gallery site-shell" data-reveal>
        <div className="project-detail-gallery-heading">
          <div>
            <span className="eyebrow">{isArabic ? "القصة البصرية" : "The visual story"}</span>
            <h2>{isArabic ? "من الفكرة إلى التطبيق." : "From idea to application."}</h2>
          </div>
          <p>{isArabic ? "استعرض كافة مراحل الهوية والتطبيقات البصرية للعميل بوضوح وتفصيل." : "Explore all identity stages and applications in detail."}</p>
        </div>
        <div className="behance-story-container" role="region" aria-label={isArabic ? "مراحل المشروع" : "Project stages"}>
          {slides.map((slide: any, index: number) => (
            <article className="behance-story-block" key={slide.id || index} data-reveal="media" data-slide-index={index}>
              <div className="behance-story-media">
                <div className="behance-story-number">0{index + 1} / 0{slides.length}</div>
                <img src={slide.imageUrl || project.imageUrl} alt={slide.title || project.title} loading="eager" decoding="async" />
              </div>
              <div className="behance-story-caption">
                <div className="behance-story-meta">
                  <span>{project.category}</span>
                  <span className="behance-dot">•</span>
                  <span>{isArabic ? `المرحلة ${index + 1}` : `Stage ${index + 1}`}</span>
                </div>
                <h3>{slide.title || (isArabic ? `عرض وتفاصيل المرحلة ${index + 1}` : `Stage ${index + 1} Details`)}</h3>
                <p>{slide.description || project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Lightbox Modal removed */}
      <section className="project-detail-cta" data-reveal><div className="site-shell project-detail-cta-inner"><div><span className="eyebrow eyebrow-light">{isArabic ? "هل لديك مشروع مشابه؟" : "Have a similar project?"}</span><h2>{isArabic ? <>لنجعل الفكرة<br /><em>واضحة ومؤثرة.</em></> : <>Let’s make the idea<br /><em>clear and memorable.</em></>}</h2></div><Link href="/contact" className="button button-light">{isArabic ? "تواصل معي" : "Start a conversation"}<ArrowUpRight size={17} /></Link></div></section>
    </div>
  </SiteChrome>;
}
