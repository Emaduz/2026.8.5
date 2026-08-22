export type PageEditorKey = "home" | "portfolio" | "about" | "services" | "contact";

export type PageEditorSettings = {
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  heroImageUrl: string;
  sectionOrder: string[];
  contentAlignment: "left" | "center" | "right";
  iconStyle: "minimal" | "solid" | "bordered";
  spacingY: "compact" | "normal" | "spacious";
  buttonLightBg: string;
  buttonLightText: string;
  buttonDarkBg: string;
  buttonDarkText: string;
  gridBgLight?: string;
  gridBgDark?: string;
  gridCardBgLight?: string;
  gridCardBgDark?: string;
  gridCardBorder?: string;
  gridCardRadius?: string;
  gridCardOpacity?: string;
  gridTitleColorLight?: string;
  gridTitleColorDark?: string;
  gridTextColorLight?: string;
  gridTextColorDark?: string;
  gridIconColorLight?: string;
  gridIconColorDark?: string;
};

export const DEFAULT_PAGE_EDITOR_SETTINGS: Record<PageEditorKey, PageEditorSettings> = {
  home: {
    titleEn: "Creative Design Solutions",
    titleAr: "حلول تصميم إبداعية",
    subtitleEn: "Transforming ideas into impactful visual experiences with 9+ years of expertise.",
    subtitleAr: "تحويل الأفكار إلى تجارب بصرية مؤثرة مع خبرة تزيد عن 9 سنوات.",
    heroImageUrl: "",
    sectionOrder: ["hero", "featured", "about", "services", "testimonials", "journal", "contact"],
    contentAlignment: "left",
    iconStyle: "bordered",
    spacingY: "normal",
    buttonLightBg: "#8f1819",
    buttonLightText: "#ffffff",
    buttonDarkBg: "#ffffff",
    buttonDarkText: "#1a1a1a",
    gridCardBgLight: "",
    gridCardBgDark: "",
    gridCardBorder: "",
    gridCardRadius: "1rem",
    gridCardOpacity: "1",
    gridTextColorLight: "",
    gridTextColorDark: "",
  },
  portfolio: {
    titleEn: "Projects with a point of view.",
    titleAr: "أعمال ذات وجهة نظر.",
    subtitleEn: "Explore a curated selection of identity, logo, and print work crafted for clarity.",
    subtitleAr: "استعرض مجموعة مختارة من أعمال الهوية والشعارات والطباعة المصممة بعناية.",
    heroImageUrl: "",
    sectionOrder: ["hero", "grid", "note"],
    contentAlignment: "left",
    iconStyle: "bordered",
    spacingY: "normal",
    buttonLightBg: "#8f1819",
    buttonLightText: "#ffffff",
    buttonDarkBg: "#ffffff",
    buttonDarkText: "#1a1a1a",
    gridCardBgLight: "",
    gridCardBgDark: "",
    gridCardBorder: "",
    gridCardRadius: "1rem",
    gridCardOpacity: "1",
    gridTextColorLight: "",
    gridTextColorDark: "",
  },
  about: {
    titleEn: "Design with a point of view.",
    titleAr: "تصميم برؤية واضحة.",
    subtitleEn: "Transforming ideas into impactful visual experiences with 9+ years of expertise.",
    subtitleAr: "تحويل الأفكار إلى تجارب بصرية مؤثرة بخبرة تتجاوز 9 سنوات.",
    heroImageUrl: "",
    sectionOrder: ["hero", "story", "experience", "skills", "cta"],
    contentAlignment: "left",
    iconStyle: "bordered",
    spacingY: "normal",
    buttonLightBg: "#8f1819",
    buttonLightText: "#ffffff",
    buttonDarkBg: "#ffffff",
    buttonDarkText: "#1a1a1a",
    gridCardBgLight: "",
    gridCardBgDark: "",
    gridCardBorder: "",
    gridCardRadius: "1rem",
    gridCardOpacity: "1",
    gridTextColorLight: "",
    gridTextColorDark: "",
  },
  services: {
    titleEn: "Crafted for clarity.",
    titleAr: "مصممة للوضوح.",
    subtitleEn: "From first sketch to final system, every detail has a reason to be there.",
    subtitleAr: "من الاسكتش الأول إلى النظام النهائي، كل تفصيلة وضعت لسبب مدروس.",
    heroImageUrl: "",
    sectionOrder: ["hero", "detail", "process", "cta"],
    contentAlignment: "left",
    iconStyle: "bordered",
    spacingY: "normal",
    buttonLightBg: "#8f1819",
    buttonLightText: "#ffffff",
    buttonDarkBg: "#ffffff",
    buttonDarkText: "#1a1a1a",
    gridBgLight: "",
    gridBgDark: "",
    gridCardBgLight: "",
    gridCardBgDark: "",
    gridCardBorder: "",
    gridCardRadius: "0 0 13px 13px",
    gridCardOpacity: "1",
    gridTitleColorLight: "#8f1819",
    gridTitleColorDark: "#f3d9cb",
    gridTextColorLight: "#9c7860",
    gridTextColorDark: "#f7eee5",
    gridIconColorLight: "#8f1819",
    gridIconColorDark: "#f3d9cb",
  },
  contact: {
    titleEn: "Let’s create something remarkable.",
    titleAr: "لنبتكر شيئاً استثنائياً.",
    subtitleEn: "Get in touch for brand strategy, identity design, or creative direction.",
    subtitleAr: "تواصل معي لاستراتيجيات الهوية، التصميم الإبداعي، أو التوجيه الفني.",
    heroImageUrl: "",
    sectionOrder: ["hero", "detail", "social", "faq"],
    contentAlignment: "left",
    iconStyle: "bordered",
    spacingY: "normal",
    buttonLightBg: "#8f1819",
    buttonLightText: "#ffffff",
    buttonDarkBg: "#ffffff",
    buttonDarkText: "#1a1a1a",
    gridCardBgLight: "",
    gridCardBgDark: "",
    gridCardBorder: "",
    gridCardRadius: "1rem",
    gridCardOpacity: "1",
    gridTextColorLight: "",
    gridTextColorDark: "",
  },
};

export const PAGE_EDITOR_META: Array<{ key: PageEditorKey; label: string; labelAr: string; description: string }> = [
  { key: "home", label: "Home", labelAr: "الرئيسية", description: "Comprehensive layout, icon styles, section reordering, and bilingual content." },
  { key: "portfolio", label: "Portfolio", labelAr: "الأعمال", description: "Manage portfolio layout, grid items order, and alignment." },
  { key: "about", label: "About", labelAr: "نبذة عني", description: "Manage about sections, bio alignment, and icon themes." },
  { key: "services", label: "Services", labelAr: "الخدمات", description: "Manage services layout, grid styling, pricing cards order, and button styles." },
  { key: "contact", label: "Contact", labelAr: "التواصل", description: "Manage contact form alignment, info cards order, and visual styling." },
];

export function hasSavedPageEditorSettings(sections: any[] | undefined, page: PageEditorKey): boolean {
  return Boolean(sections?.some(item => item.key === `page_editor_${page}`));
}

export function parsePageEditorSettings(sections: any[] | undefined, page: PageEditorKey): PageEditorSettings {
  const def = DEFAULT_PAGE_EDITOR_SETTINGS[page];
  const section = sections?.find(item => item.key === `page_editor_${page}`);
  try {
    const parsed = JSON.parse(String(section?.content || "{}"));
    return {
      ...def,
      ...parsed,
      sectionOrder: Array.isArray(parsed?.sectionOrder) && parsed.sectionOrder.length ? parsed.sectionOrder : def.sectionOrder,
    };
  } catch {
    return def;
  }
}
