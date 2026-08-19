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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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
        <div className="project-detail-grid-container" role="region" aria-label={isArabic ? "مراحل المشروع" : "Project stages"}>
          {slides.map((slide: any, index: number) => (
            <article className="project-detail-grid-card" key={slide.id || index} data-reveal="media" data-slide-index={index}>
              <div className="project-detail-grid-number">0{index + 1}</div>
              <div className="project-detail-grid-image" onClick={() => setLightboxIndex(index)} role="button" tabIndex={0} aria-label={isArabic ? "تكبير الصورة" : "Zoom image"}>
                <img src={slide.imageUrl || project.imageUrl} alt={slide.title || project.title} loading="eager" decoding="async" />
                <div className="project-detail-grid-zoom-badge"><ZoomIn size={16} /></div>
              </div>
              <div className="project-detail-grid-copy">
                <span>{project.category}</span>
                <h3>{slide.title || (isArabic ? `المرحلة ${index + 1}` : `Stage ${index + 1}`)}</h3>
                <p>{slide.description || project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="project-lightbox-overlay" onClick={() => setLightboxIndex(null)} role="dialog" aria-modal="true">
          <div className="project-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="project-lightbox-close" onClick={() => setLightboxIndex(null)} aria-label={isArabic ? "إغلاق" : "Close"}><X size={22} /></button>
            <div className="project-lightbox-figure">
              <img src={slides[lightboxIndex]?.imageUrl || project.imageUrl} alt={slides[lightboxIndex]?.title || project.title} />
            </div>
            <div className="project-lightbox-caption">
              <span className="project-lightbox-counter">{String(lightboxIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
              <h3>{slides[lightboxIndex]?.title || (isArabic ? `المرحلة ${lightboxIndex + 1}` : `Stage ${lightboxIndex + 1}`)}</h3>
              <p>{slides[lightboxIndex]?.description || project.description}</p>
            </div>
            {slides.length > 1 && (
              <div className="project-lightbox-controls">
                <button onClick={() => setLightboxIndex((lightboxIndex - 1 + slides.length) % slides.length)} aria-label={isArabic ? "السابق" : "Previous"}><ChevronRight size={22} /></button>
                <button onClick={() => setLightboxIndex((lightboxIndex + 1) % slides.length)} aria-label={isArabic ? "التالي" : "Next"}><ChevronLeft size={22} /></button>
              </div>
            )}
          </div>
        </div>
      )}
      <section className="project-detail-cta" data-reveal><div className="site-shell project-detail-cta-inner"><div><span className="eyebrow eyebrow-light">{isArabic ? "هل لديك مشروع مشابه؟" : "Have a similar project?"}</span><h2>{isArabic ? <>لنجعل الفكرة<br /><em>واضحة ومؤثرة.</em></> : <>Let’s make the idea<br /><em>clear and memorable.</em></>}</h2></div><Link href="/contact" className="button button-light">{isArabic ? "تواصل معي" : "Start a conversation"}<ArrowUpRight size={17} /></Link></div></section>
    </div>
  </SiteChrome>;
}
