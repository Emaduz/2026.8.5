import { Link } from "wouter";
import { useMemo } from "react";
import { ArrowUpRight, Check, Globe2, Layers3, MessageCircle, Palette, PenTool, Printer, Send, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import SiteChrome from "@/components/SiteChrome";
import { useLocale } from "@/contexts/LocaleContext";
import { siteCopy } from "@/lib/siteCopy";

function parseJson(value: unknown) {
  try {
    const parsed = JSON.parse(String(value || "null"));
    return parsed || null;
  } catch {
    return null;
  }
}

function localizedSectionValue(section: any, locale: "en" | "ar") {
  return locale === "ar" ? section?.contentAr || section?.content : section?.contentEn || section?.content;
}

function localizeObject(record: any, locale: "en" | "ar") {
  if (!record || typeof record !== "object") return record;
  const result = { ...record };
  Object.keys(record).forEach(key => {
    if (key.endsWith("En") || key.endsWith("Ar")) return;
    const localizedKey = `${key}${locale === "ar" ? "Ar" : "En"}`;
    if (record[localizedKey]) result[key] = record[localizedKey];
  });
  return result;
}

function localizeRecord(record: any, locale: "en" | "ar") {
  const localized = locale === "ar"
    ? { title: record.titleAr || record.title, description: record.descriptionAr || record.description, details: record.detailsAr || record.details }
    : { title: record.titleEn || record.title, description: record.descriptionEn || record.description, details: record.detailsEn || record.details };
  return { ...localizeObject(record, locale), ...localized };
}

function splitDetails(value: unknown) {
  return String(value || "")
    .split(/\s*(?:\n|\/|\|)\s*/)
    .map(item => item.trim())
    .filter(Boolean);
}

const FALLBACK_SERVICES = [
  {
    number: "01",
    titleEn: "Logo Design",
    titleAr: "تصميم الشعارات",
    descriptionEn: "Creating unique and memorable logos that represent your brand identity perfectly.",
    descriptionAr: "ابتكار شعارات فريدة ولافتة تمثل هوية علامتك التجارية بأفضل صورة.",
    detailsEn: "3 Initial Concepts / Unlimited Revisions / Vector Files (AI, EPS) / PNG & JPG Files / Brand Guidelines",
    detailsAr: "3 مفاهيم أولية / تعديلات غير محدودة / ملفات متجهة AI وEPS / ملفات PNG وJPG / إرشادات الهوية",
    priceEn: "560",
    priceAr: "560",
    popular: true,
  },
  {
    number: "02",
    titleEn: "Brand Identity",
    titleAr: "الهوية التجارية",
    descriptionEn: "Complete brand identity packages including logo, colors, typography, and guidelines.",
    descriptionAr: "حزم هوية تجارية متكاملة تشمل الشعار والألوان والخطوط وإرشادات الاستخدام.",
    detailsEn: "Logo Design / Color Palette / Typography Guide / Business Cards / Letterhead Design / Brand Guidelines",
    detailsAr: "تصميم الشعار / لوحة الألوان / دليل الخطوط / بطاقات العمل / تصميم المراسلات / دليل الهوية",
    priceEn: "1,500",
    priceAr: "1,500",
  },
  {
    number: "03",
    titleEn: "Print Design",
    titleAr: "التصميم الطباعي",
    descriptionEn: "Professional print materials including brochures, flyers, posters, and marketing collateral.",
    descriptionAr: "مواد طباعية احترافية تشمل البروشورات والمنشورات والملصقات والمواد التسويقية.",
    detailsEn: "Brochure Design / Flyer Design / Poster Design / Magazine Layout / Packaging Design / Print-Ready Files",
    detailsAr: "تصميم البروشورات / تصميم المنشورات / تصميم الملصقات / إخراج المجلات / تصميم التغليف / ملفات جاهزة للطباعة",
    priceEn: "375",
    priceAr: "375",
  },
  {
    number: "04",
    titleEn: "Web Design",
    titleAr: "تصميم المواقع",
    descriptionEn: "Modern and responsive website designs that engage users and drive conversions.",
    descriptionAr: "تصاميم مواقع حديثة ومتجاوبة تجذب المستخدمين وتدعم تحقيق النتائج.",
    detailsEn: "Responsive Design / Landing Pages / E-commerce Design / CMS Integration / SEO Optimization / Performance Optimization",
    detailsAr: "تصميم متجاوب / صفحات هبوط / تصميم المتاجر / ربط أنظمة الإدارة / تحسين الظهور / تحسين الأداء",
    priceEn: "1,875",
    priceAr: "1,875",
  },
  {
    number: "05",
    titleEn: "Social Media Design",
    titleAr: "تصميم وسائل التواصل",
    descriptionEn: "Eye-catching social media graphics and templates for all major platforms.",
    descriptionAr: "تصاميم وقوالب لافتة لوسائل التواصل الاجتماعي على مختلف المنصات.",
    detailsEn: "Instagram Posts / Facebook Covers / Twitter Headers / LinkedIn Banners / Story Templates / Animated Graphics",
    detailsAr: "منشورات إنستغرام / أغلفة فيسبوك / ترويسات تويتر / بانرات لينكدإن / قوالب القصص / تصاميم متحركة",
    priceEn: "190",
    priceAr: "190",
  },
];

const FALLBACK_PROCESS = [
  { number: "01", titleEn: "Consultation", titleAr: "الاستشارة", descriptionEn: "We discuss your project requirements, goals, and vision in detail.", descriptionAr: "نناقش متطلبات مشروعك وأهدافه ورؤيتك بالتفصيل." },
  { number: "02", titleEn: "Concept Development", titleAr: "تطوير الفكرة", descriptionEn: "I create initial concepts and present multiple design directions.", descriptionAr: "أبتكر المفاهيم الأولية وأعرض لك اتجاهات تصميم متعددة." },
  { number: "03", titleEn: "Design & Refinement", titleAr: "التصميم والتطوير", descriptionEn: "Based on your feedback, I refine the chosen concept to perfection.", descriptionAr: "أطوّر المفهوم المختار حتى يصل إلى أفضل نتيجة بناءً على ملاحظاتك." },
  { number: "04", titleEn: "Final Delivery", titleAr: "التسليم النهائي", descriptionEn: "You receive all final files in various formats ready for use.", descriptionAr: "تحصل على جميع الملفات النهائية بصيغ متعددة وجاهزة للاستخدام." },
];

const FALLBACK_COPY = {
  eyebrow: "My Services",
  title: "Professional design",
  accent: "solutions",
  intro: "Professional design solutions tailored to your needs",
  popular: "Most Popular",
  startingAt: "Starting at",
  currency: "SAR",
  getStarted: "Get Started",
  processEyebrow: "My Design Process",
  processTitle: "A streamlined process",
  processAccent: "from brief to delivery.",
  processDescription: "A streamlined process to ensure your project is delivered on time and exceeds expectations",
  readyTitle: "Ready to Get Started?",
  readyDescription: "Let's discuss your project and create something amazing together. Contact me for a free consultation.",
  readyButton: "WhatsApp Chat",
};

const FALLBACK_COPY_AR = {
  eyebrow: "خدماتي",
  title: "حلول تصميم",
  accent: "احترافية",
  intro: "حلول تصميم احترافية مصممة لتناسب احتياجاتك",
  popular: "الأكثر طلباً",
  startingAt: "تبدأ من",
  currency: "ريال",
  getStarted: "ابدأ الآن",
  processEyebrow: "منهجية التصميم",
  processTitle: "منهجية واضحة",
  processAccent: "من الموجز حتى التسليم.",
  processDescription: "منهجية منظمة لضمان تسليم مشروعك في الوقت المناسب وبجودة تتجاوز التوقعات.",
  readyTitle: "هل أنت مستعد للبدء؟",
  readyDescription: "لنتحدث عن مشروعك ونصنع معاً شيئاً مميزاً. تواصل معي للحصول على استشارة مجانية.",
  readyButton: "محادثة واتساب",
};

function iconFor(index: number) {
  return [Palette, Layers3, Printer, Globe2, Sparkles][index % 5] || PenTool;
}

export default function Services() {
  const { locale } = useLocale();
  const copy = siteCopy[locale];
  const { data } = trpc.content.publicHome.useQuery();
  const sections = data?.sections || [];
  const servicesSection = sections.find((item: any) => item.key === "services");
  const servicesCopySection = sections.find((item: any) => item.key === "services_copy");
  const processSection = sections.find((item: any) => item.key === "services_process");
  const contactSection = sections.find((item: any) => item.key === "contact");
  const servicesData = useMemo(() => parseJson(localizedSectionValue(servicesSection, locale)), [servicesSection, locale]);
  const servicesCopyData = useMemo(() => parseJson(localizedSectionValue(servicesCopySection, locale)), [servicesCopySection, locale]);
  const processData = useMemo(() => parseJson(localizedSectionValue(processSection, locale)), [processSection, locale]);
  const services = useMemo(() => Array.isArray(servicesData) && servicesData.length >= 5 ? servicesData.map((item: any) => localizeRecord(item, locale)) : FALLBACK_SERVICES.map(item => localizeRecord(item, locale)), [servicesData, locale]);
  const process = useMemo(() => Array.isArray(processData?.steps) && processData.steps.length >= 4 ? processData.steps.map((item: any) => localizeRecord(item, locale)) : FALLBACK_PROCESS.map(item => localizeRecord(item, locale)), [processData, locale]);
  const fallbackCopy = locale === "ar" ? FALLBACK_COPY_AR : FALLBACK_COPY;
  const managedServicesCopy = servicesCopyData && typeof servicesCopyData === "object" && "readyTitle" in servicesCopyData ? servicesCopyData : null;
  const pageCopy = { ...fallbackCopy, ...localizeObject(managedServicesCopy, locale) };
  const phone = locale === "ar" ? contactSection?.subtitleAr || contactSection?.subtitleEn || contactSection?.subtitle || "+966 504487308" : contactSection?.subtitleEn || contactSection?.subtitle || "+966 504487308";
  const whatsappHref = `https://wa.me/${String(phone).replace(/\D/g, "")}`;

  return <SiteChrome><div className="inner-page services-reference-page">
    <section className="services-reference-hero site-shell" data-reveal="hero">
      <span className="eyebrow"><span className="eyebrow-line" /> {pageCopy.eyebrow || copy.services.eyebrow}</span>
      <h1>{pageCopy.title}<br /><em>{pageCopy.accent}</em></h1>
      <p>{pageCopy.intro}</p>
    </section>

    <section className="services-reference-offer site-shell" data-reveal>
      <div className="services-reference-grid" data-reveal="stagger">
        {services.map((service: any, index: number) => {
          const Icon = iconFor(index);
          const details = splitDetails(service.details);
          const isPopular = service.popular === true || service.popular === "true";
          return <article className={`services-reference-card${isPopular ? " is-popular" : ""}`} key={service.number || service.title} data-reveal="media">
            {isPopular ? <span className="services-reference-popular">{pageCopy.popular}</span> : null}
            <div className="services-reference-card-icon"><Icon size={21} /></div>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            <ul>{details.map((detail: string) => <li key={detail}><Check size={15} />{detail}</li>)}</ul>
            <div className="services-reference-card-footer"><span>{pageCopy.startingAt}</span><strong>{service.price || service.priceEn || "—"}</strong><small>{service.currency || pageCopy.currency}</small></div>
            <a
              className="button button-primary services-reference-button"
              href={`https://wa.me/966504487308?text=${encodeURIComponent(locale === "ar" ? `مرحباً مهندس عماد، أرغب في الاستفسار عن باقة "${service.title}" (السعر: ${service.price || service.priceEn || "—"} ريال). هل يمكنك إفادتنا بالتفاصيل؟` : `Hello Eng. Emad, I would like to inquire about the "${service.title}" package (Starting at: ${service.price || service.priceEn || "—"} SAR). Could you please share more details?`)}`}
              target="_blank"
              rel="noreferrer"
            >
              {service.button || pageCopy.getStarted} <ArrowUpRight size={16} />
            </a>
          </article>;
        })}
      </div>
    </section>

    <section className="services-reference-process" data-reveal>
      <div className="site-shell">
        <div className="services-reference-section-heading"><div><span className="eyebrow eyebrow-light">{pageCopy.processEyebrow}</span><h2>{pageCopy.processTitle}<br /><em>{pageCopy.processAccent}</em></h2></div><p>{pageCopy.processDescription}</p></div>
        <div className="services-reference-process-grid" data-reveal="stagger">
          {process.map((step: any) => <article key={step.number} data-reveal="media"><span>{step.number}</span><div className="services-reference-process-icon"><Send size={17} /></div><h3>{step.title}</h3><p>{step.description}</p></article>)}
        </div>
      </div>
    </section>

    <section className="services-reference-cta" data-reveal>
      <div className="services-reference-cta-shell site-shell">
        <div className="services-reference-cta-watermark" aria-hidden="true">NEXT</div>
        <div className="services-reference-cta-copy"><span className="services-reference-cta-kicker"><span className="services-reference-cta-dot" />{locale === "ar" ? "خطوتك التالية" : "Your next step"}</span><h2>{pageCopy.readyTitle}</h2><p>{pageCopy.readyDescription}</p></div>
        <div className="services-reference-cta-action"><span>{locale === "ar" ? "لنصنع شيئاً واضحاً ومؤثراً" : "Let’s make something clear and meaningful"}</span><a className="services-reference-cta-button" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={17} />{pageCopy.readyButton}<ArrowUpRight size={17} /></a></div>
      </div>
    </section>
  </div></SiteChrome>;
}
