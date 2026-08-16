import { ArrowUpRight, BriefcaseBusiness, Building2, CalendarDays, Clock3, Flag, Languages, MapPin } from "lucide-react";
import SiteChrome from "@/components/SiteChrome";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { siteCopy } from "@/lib/siteCopy";

function section(data: any, key: string) { return data?.sections?.find((item: any) => item.key === key); }

export default function About() {
  const { locale } = useLocale();
  const copy = siteCopy[locale];
  const reference = copy.about.reference;
  const { data } = trpc.content.publicHome.useQuery();
  const about = section(data, "about");
  const storyText = (locale === "ar" ? about?.contentAr : about?.contentEn) || about?.content || reference.storyText;
  const portrait = "/api/portrait?v=9";

  return <SiteChrome>
    <div className="inner-page about-reference-page">
      <section className="about-reference-intro site-shell" data-reveal="hero">
        <h1>{reference.title}</h1>
        <p>{reference.intro}</p>
      </section>

      <section className="about-reference-layout site-shell" data-reveal>
        <aside className="about-reference-sidebar">
          <div className="about-reference-portrait" onContextMenu={event => event.preventDefault()}>
            <img src={portrait} alt={locale === "ar" ? "صورة عماد الدين إسماعيل" : "EmadAlddine Ismael"} className="portrait-fit-source" draggable={false} onDragStart={event => event.preventDefault()} />
          </div>

          <section className="about-reference-card" data-reveal="media">
            <h2>{reference.personalTitle}</h2>
            <div className="about-reference-detail-list">
              {reference.personal.map((item, index) => {
                const Icon = [MapPin, Flag, Clock3][index] || Clock3;
                return <div key={item.label}><span className="about-reference-icon"><Icon size={16} /></span><span>{item.value}</span></div>;
              })}
            </div>
          </section>

          <section className="about-reference-card" data-reveal="media">
            <h2>{reference.languagesTitle}</h2>
            <div className="about-reference-language-list">
              {reference.languages.map(item => <div key={item.label} className="about-reference-language">
                <div><span>{item.label}</span><small>{item.value}</small></div>
                <span className="about-reference-language-track"><span style={{ width: `${item.level}%` }} /></span>
              </div>)}
            </div>
          </section>
        </aside>

        <main className="about-reference-main">
          <section className="about-reference-card about-reference-story" data-reveal="media">
            <h2>{reference.storyTitle}</h2>
            <p>{storyText}</p>
          </section>

          <section className="about-reference-card about-reference-experience" data-reveal="media">
            <h2>{reference.experienceTitle}</h2>
            <div className="about-reference-timeline">
              {reference.experiences.map(item => <article className="about-reference-experience-item" key={`${item.role}-${item.company}`}>
                <span className="about-reference-timeline-dot" aria-hidden="true" />
                <div className="about-reference-experience-heading"><h3>{item.role}</h3>{item.status && <span>{item.status}</span>}</div>
                <div className="about-reference-experience-meta"><span><Building2 size={14} />{item.company}</span><span><MapPin size={14} />{item.location}</span></div>
                <p>{item.description}</p>
              </article>)}
            </div>
          </section>

          <section className="about-reference-card about-reference-skills" data-reveal="media">
            <h2>{reference.skillsTitle}</h2>
            <div className="about-reference-skill-grid">
              {reference.skills.map((skill, index) => <span key={skill}><BriefcaseBusiness size={15} />{skill}</span>)}
            </div>
          </section>
        </main>
      </section>

      <section className="about-reference-contact site-shell" data-reveal>
        <span className="eyebrow">{locale === "ar" ? "هل نبدأ؟" : "Let’s connect"}</span>
        <h2>{locale === "ar" ? "فكرة تستحق" : "A thoughtful"}<br /><em>{locale === "ar" ? "أن ترى النور؟" : "partnership."}</em></h2>
        <a className="button button-primary" href="/contact">{locale === "ar" ? "تواصل معي" : "Get in touch"} <ArrowUpRight size={17} /></a>
      </section>
    </div>
  </SiteChrome>;
}
