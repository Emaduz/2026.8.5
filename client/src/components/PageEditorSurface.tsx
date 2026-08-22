import React, { type CSSProperties, type ReactNode } from "react";
import { PAGE_EDITOR_META, PageEditorKey, PageEditorSettings, parsePageEditorSettings } from "@/lib/pageEditorConfig";

type PageEditorStyle = CSSProperties & Record<`--${string}`, string>;

type Props = {
  page: PageEditorKey;
  sections?: any[];
  children: ReactNode;
  className?: string;
};

export function getPageEditorSectionStyle(settings: PageEditorSettings, key: string): CSSProperties {
  const aliases: Record<string, string[]> = { experience: ["experience", "values"], skills: ["skills", "values"] };
  const matchingKeys = aliases[key] || [key];
  const index = matchingKeys.map(item => settings.sectionOrder.indexOf(item)).find(item => item >= 0) ?? -1;
  return { order: index >= 0 ? index : settings.sectionOrder.length + 20 };
}

export function getPageEditorStyle(settings: PageEditorSettings): PageEditorStyle {
  return {
    "--page-editor-button-light-bg": settings.buttonLightBg,
    "--page-editor-button-light-text": settings.buttonLightText,
    "--page-editor-button-dark-bg": settings.buttonDarkBg,
    "--page-editor-button-dark-text": settings.buttonDarkText,
  };
}

export default function PageEditorSurface({ page, sections, children, className = "" }: Props) {
  const settings = parsePageEditorSettings(sections, page);
  const meta = PAGE_EDITOR_META.find(item => item.key === page);
  return <div
    className={`page-editor-surface page-editor-${page} page-editor-align-${settings.contentAlignment} page-editor-icons-${settings.iconStyle} page-editor-spacing-${settings.spacingY} ${className}`.trim()}
    data-page-editor={page}
    data-page-editor-label={meta?.label}
    style={getPageEditorStyle(settings)}
  >
    {children}
  </div>;
}
