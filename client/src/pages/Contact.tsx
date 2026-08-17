import { type FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import SiteChrome from "@/components/SiteChrome";
import BehanceMark from "@/components/BehanceMark";
import { useLocale } from "@/contexts/LocaleContext";

function section(data: any, key: string) { return data?.sections?.find((item: any) => item.key === key); }
function parseLinks(content?: string) { try { return content ? JSON.parse(content) : {}; } catch { return {}; } }
const ASSETS = { logo: "/api/logo" };

const referenceCopy = {
  en: {
    eyebrow: "Get In Touch",
    title: "Let's discuss your next project",
    formTitle: "Send me a message",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    send: "Send Message",
    emailLabel: "Email",
    phoneLabel: "Phone",
    locationLabel: "Location",
    whatsappLabel: "WhatsApp",
    quickChat: "Quick Chat",
    callNow: "Call Now",
    profileRole: "Senior Graphic Designer",
    response: "Usually responds within 2 hours",
    follow: "Follow Me",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      ["What's your typical turnaround time?", "Logo design: 3–5 days, brand identity: 1–2 weeks, complex projects: 2–4 weeks. Rush orders are available."],
      ["Do you offer revisions?", "Yes. I offer unlimited revisions until the final design is clear, useful, and ready to move forward."],
      ["What file formats do you provide?", "Projects include vector files such as AI and EPS, high-resolution PNG and JPG files, and web-optimized versions."],
      ["How do we communicate during the project?", "Primary communication is through WhatsApp and email, with regular updates and progress sharing throughout the project."],
    ],
    sent: "Your message is ready in your email client.",
  },
  ar: {
    eyebrow: "تواصل معي",
    title: "لنتحدث عن مشروعك القادم",
    formTitle: "أرسل لي رسالة",
    name: "الاسم",
    email: "البريد الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    send: "إرسال الرسالة",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
    locationLabel: "الموقع",
    whatsappLabel: "واتساب",
    quickChat: "محادثة سريعة",
    callNow: "اتصل الآن",
    profileRole: "مصمم جرافيك أول",
    response: "عادةً ما أرد خلال ساعتين",
    follow: "تابعني",
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      ["ما المدة المعتادة لتنفيذ المشروع؟", "تصميم الشعار: من 3 إلى 5 أيام، والهوية التجارية: من أسبوع إلى أسبوعين، والمشاريع المعقدة: من أسبوعين إلى 4 أسابيع. تتوفر الطلبات العاجلة."],
      ["هل تشمل الخدمة التعديلات؟", "نعم، تشمل الخدمة تعديلات غير محدودة حتى يصبح التصميم واضحاً ومناسباً وجاهزاً للتنفيذ."],
      ["ما صيغ الملفات التي أحصل عليها؟", "تشمل المشاريع ملفات متجهة مثل AI وEPS، وملفات PNG وJPG عالية الدقة، ونسخاً محسنة للاستخدام الرقمي."],
      ["كيف نتواصل أثناء تنفيذ المشروع؟", "يكون التواصل الأساسي عبر واتساب والبريد الإلكتروني، مع مشاركة مستمرة للتحديثات ومراحل التقدم."],
    ],
    sent: "تم تجهيز رسالتك في تطبيق البريد الإلكتروني.",
  },
} as const;

export default function Contact() {
  const { locale } = useLocale();
  const copy = referenceCopy[locale];
  const { data } = trpc.content.publicHome.useQuery();
  const contact = section(data, "contact");
  const links = parseLinks(section(data, "links")?.content);
  const email = locale === "ar" ? contact?.titleAr || contact?.titleEn || contact?.title || "info@emadalddine.com" : contact?.titleEn || contact?.title || "info@emadalddine.com";
  const phone = locale === "ar" ? contact?.subtitleAr || contact?.subtitleEn || contact?.subtitle || "+966 504487308" : contact?.subtitleEn || contact?.subtitle || "+966 504487308";
  const address = locale === "ar" ? contact?.contentAr || contact?.contentEn || contact?.content || "المدينة المنورة، المملكة العربية السعودية" : contact?.contentEn || contact?.content || "Al-Madina, Saudi Arabia";
  const whatsappHref = `https://wa.me/${phone.replace(/\D/g, "")}`;
  const social = useMemo(() => ({ instagram: links.instagram || "https://instagram.com/emadalddine", linkedin: links.linkedin || "https://linkedin.com/in/emadalddine", behance: links.behance || "https://behance.net/emadalddine" }), [links.instagram, links.linkedin, links.behance]);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get("name") || "");
    const sender = String(values.get("email") || "");
    const subject = String(values.get("subject") || "Project inquiry");
    const message = String(values.get("message") || "");
    const body = `${locale === "ar" ? "الاسم" : "Name"}: ${name}\n${locale === "ar" ? "البريد" : "Email"}: ${sender}\n\n${message}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return <SiteChrome><div className="inner-page contact-reference-page">
    <section className="contact-reference-hero site-shell" data-reveal="hero">
      <span className="eyebrow"><span className="eyebrow-line" />{copy.eyebrow}</span>
      <h1>{copy.title}</h1>
      <p>{locale === "ar" ? "أخبرني بفكرتك وسنحوّلها إلى تجربة بصرية واضحة ومؤثرة." : "Tell me about your idea and let’s turn it into a clear, meaningful visual experience."}</p>
    </section>

    <section className="contact-reference-main site-shell" data-reveal>
      <div className="contact-reference-form-card">
        <div className="contact-reference-card-heading"><span className="contact-reference-number">01</span><h2>{copy.formTitle}</h2></div>
        <form className="contact-reference-form" onSubmit={handleSubmit}>
          <label><span>{copy.name} <b>*</b></span><input name="name" required autoComplete="name" placeholder={locale === "ar" ? "اكتب اسمك" : "Your name"} /></label>
          <label><span>{copy.email} <b>*</b></span><input name="email" required type="email" autoComplete="email" placeholder={locale === "ar" ? "name@example.com" : "name@example.com"} /></label>
          <label><span>{copy.subject}</span><input name="subject" placeholder={locale === "ar" ? "كيف يمكنني مساعدتك؟" : "How can I help?"} /></label>
          <label className="contact-reference-form-wide"><span>{copy.message} <b>*</b></span><textarea name="message" required rows={6} placeholder={locale === "ar" ? "أخبرني عن مشروعك..." : "Tell me about your project..."} /></label>
          <div className="contact-reference-form-actions"><button className="button button-primary" type="submit"><Send size={16} />{copy.send}<ArrowUpRight size={16} /></button>{sent ? <span className="contact-reference-sent"><CheckCircle2 size={15} />{copy.sent}</span> : null}</div>
        </form>
      </div>

      <aside className="contact-reference-sidebar">
        <div className="contact-reference-info-card">
          <span className="contact-reference-number">02</span>
          <div className="contact-reference-info-list">
            <a href={`mailto:${email}`}><span className="contact-reference-icon"><Mail size={17} /></span><span><small>{copy.emailLabel}</small><strong>{email}</strong></span><ArrowUpRight size={16} /></a>
            <a href={`tel:${phone.replace(/\s/g, "")}`}><span className="contact-reference-icon"><Phone size={17} /></span><span><small>{copy.phoneLabel}</small><strong dir="ltr" className="phone-ltr">{phone}</strong></span><ArrowUpRight size={16} /></a>
            <div><span className="contact-reference-icon"><MapPin size={17} /></span><span><small>{copy.locationLabel}</small><strong>{address}</strong></span></div>
          </div>
          <div className="contact-reference-whatsapp"><span className="contact-reference-icon"><MessageCircle size={17} /></span><span><small>{copy.whatsappLabel}</small><strong>{copy.quickChat}</strong></span><a href={whatsappHref} target="_blank" rel="noreferrer" aria-label={copy.quickChat}><ArrowUpRight size={16} /></a></div>
        </div>

        <div className="contact-reference-profile-card">
          <div className="contact-reference-profile-portrait contact-reference-profile-logo" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#fdfbf7" }}>
            <img src={ASSETS.logo} alt={locale === "ar" ? "شعار عماد الدين" : "EmadAlddine logo"} draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="contact-reference-profile-copy"><h2>Eng.EmadAlddine</h2><p>{copy.profileRole}</p><span><Clock3 size={14} />{copy.response}</span></div>
          <div className="contact-reference-profile-actions"><a className="button button-primary" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={16} />{copy.quickChat}</a><a className="button button-ghost" href={`tel:${phone.replace(/\s/g, "")}`}><Phone size={16} />{copy.callNow}</a></div>
        </div>
      </aside>
    </section>

    <section className="contact-reference-social site-shell" data-reveal>
      <div><span className="eyebrow">03</span><h2>{copy.follow}</h2></div>
      <div className="contact-reference-social-grid" data-reveal="stagger"><a href={social.instagram} target="_blank" rel="noreferrer"><Instagram size={18} /><span>Instagram</span><ArrowUpRight size={16} /></a><a href={social.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18} /><span>LinkedIn</span><ArrowUpRight size={16} /></a><a href={social.behance} target="_blank" rel="noreferrer"><BehanceMark size={18} /><span>Behance</span><ArrowUpRight size={16} /></a></div>
    </section>

    <section className="contact-reference-faq" data-reveal>
      <div className="site-shell"><div className="contact-reference-faq-heading"><span className="eyebrow eyebrow-light">04</span><h2>{copy.faqTitle}</h2></div><div className="contact-reference-faq-list">{copy.faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{question}</span><span>+</span></summary><p>{answer}</p></details>)}</div></div>
    </section>
  </div></SiteChrome>;
}
