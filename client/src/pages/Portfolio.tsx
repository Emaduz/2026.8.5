import React from "react";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { Link } from "wouter";
import SiteChrome from "@/components/SiteChrome";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeProject, siteCopy } from "@/lib/siteCopy";

const fallbackImages = [
  "/manus-storage/06551d240072049.693708b93fbdf_50482b65.jpeg",
  "/manus-storage/03af8f154753213.6347e1e6a3468_2f3fc650.jpg",
  "/manus-storage/05070c210092607.670b6931a7ce1_f87bf103.jpg",
  "/manus-storage/bf247b199510245.66532c1d1bdf2_167a4d14.jpg",
  "/manus-storage/12df36192992769.65e4cc0a1faff_34db79f8.jpg",
  "/manus-storage/0b21ed156295027.636447c7d6063_b33c2e3e.jpg",
  "/manus-storage/9a21ef159472965.639f7bab2c17b_06a8ccf4.jpg",
  "/manus-storage/11f546212641103.6738797cb0e7f_93ed645f.jpeg",
];

export const fallbackProjects = [
  ["ERA shopping Logo & Brand", "Branding & Identity", "A complete retail identity system built around geometric rhythm, a confident Arabic lockup, and flexible applications."],
  ["Jenan Yemeni Honey Logo Branding", "Branding & Packaging", "A warm honey identity balancing Yemeni character, premium cues, and a memorable bilingual mark."],
  ["Ekleel Alenayah Medical Company Logo Brand", "Medical Branding", "A calm and trustworthy healthcare identity shaped around a botanical symbol and clear bilingual applications."],
  ["Caesar logo & Brand", "Logo & Brand Identity", "A bold identity direction that brings character, contrast, and recognition to the Caesar brand."],
  ["AL KHATTABI PRESS LOGO & IDENTITY", "Editorial Branding", "A bilingual press identity with a distinctive emblem, structured content, and an editorial point of view."],
  ["Balsam Taibah Medical Co. Logo Branding", "Medical Branding", "A friendly medical identity system designed to feel clear, reliable, and human across applications."],
  ["Al-Bakeli Dental Clinic", "Healthcare Branding", "A confident dental identity pairing a recognizable symbol with blue, white, and bilingual touchpoints."],
  ["Baha’a Silver Logo - typography", "Logo & Typography", "A refined jewelry identity where Arabic typography, silver forms, and gold details create a premium signature."],
].map(([title, category, description], index) => ({ id: index + 1, title, category, description, imageUrl: fallbackImages[index], displayOrder: index + 1, clientName: title, slides: [{ id: index * 10 + 1, title: "01 / Identity direction", description, imageUrl: fallbackImages[index], displayOrder: 0 }, { id: index * 10 + 2, title: "02 / Logo and applications", description: "A closer look at the mark, lockups, and applications that make the system useful.", imageUrl: fallbackImages[index], displayOrder: 1 }] }));

export default function Portfolio() {
  const { locale } = useLocale();
  const copy = siteCopy[locale];
  const { data, isLoading } = trpc.content.publicHome.useQuery();
  const rawProjects = data?.projects?.length ? [...data.projects].sort((a: any, b: any) => a.displayOrder - b.displayOrder) : fallbackProjects;
  const projects = rawProjects.map(project => localizeProject(project, locale));

  return <SiteChrome>
    <div className="inner-page portfolio-page">
      <section className="inner-hero site-shell" data-reveal="hero"><div><span className="eyebrow"><span className="eyebrow-line" /> {copy.home.selected}</span><h1>{locale === "ar" ? "أعمال" : "Projects with"}<br /><span>{locale === "ar" ? "وجهة نظر." : "a point of view."}</span></h1><p>{locale === "ar" ? "استعرض مجموعة مختارة من مشاريع الهوية والشعارات والتصميم الطباعي المصممة بوضوح وأثر طويل." : "Explore a curated selection of identity, logo, and print work crafted for clarity and lasting recognition."}</p></div><div className="inner-hero-mark"><Layers3 size={24} /><span>{String(projects.length).padStart(2, "0")}<br />{locale === "ar" ? "مشاريع مختارة" : "selected projects"}</span></div></section>
      <section className="portfolio-grid-section site-shell" data-reveal><div className="portfolio-grid-heading"><div><span className="eyebrow">{locale === "ar" ? "المعرض" : "The portfolio"}</span><h2>{locale === "ar" ? "كل مشروع يبدأ بفكرة." : "Each project starts with an idea."}</h2></div><p>{locale === "ar" ? "اختر أي مشروع لاستعراض القصة البصرية والتطبيقات والتفاصيل." : "Choose a project to explore its visual story, applications, and details."}</p></div>{isLoading ? <div className="loading-line">{locale === "ar" ? "جاري تحميل الأعمال..." : "Loading the latest work..."}</div> : <div className="portfolio-project-grid" data-reveal="stagger">{projects.map((project: any, index: number) => <article className={`portfolio-project-card portfolio-project-card-${(index % 3) + 1}`} key={project.id} data-reveal="media"><Link href={`/portfolio/${project.id}`} className="portfolio-project-link"><div className="portfolio-project-image"><img src={project.imageUrl || fallbackImages[index % fallbackImages.length]} alt={project.title} /><span className="portfolio-project-index">{String(index + 1).padStart(2, "0")}</span><span className="portfolio-project-view">{locale === "ar" ? "عرض المشروع" : "View project"}<ArrowUpRight size={16} /></span></div><div className="portfolio-project-copy"><span className="eyebrow">{project.category}</span><h3>{project.title}</h3><p>{project.description}</p></div></Link></article>)}</div>}</section>
      <section className="portfolio-note" data-reveal><div className="site-shell"><span className="eyebrow eyebrow-light">{locale === "ar" ? "صنع بقصد" : "Built with intention"}</span><h2>{locale === "ar" ? <>التصميم الجيد يجعل<br /><em>الأفكار أسهل في التذكر.</em></> : <>Good design makes<br /><em>ideas easier to remember.</em></>}</h2><p>{locale === "ar" ? "كل مشروع يبدأ بسؤال، ثم يتحول إلى نظام بصري يعمل في العالم الحقيقي." : "Every project starts with a question, then becomes a visual system made to work in the real world."}</p><Link href="/contact" className="button button-light">{locale === "ar" ? "ابدأ مشروعاً" : "Start a project"}<ArrowUpRight size={17} /></Link></div></section>
    </div>
  </SiteChrome>;
}
