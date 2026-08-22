import React, { type CSSProperties, type ReactNode } from "react";
import { PAGE_EDITOR_META, PageEditorKey, PageEditorSettings, parsePageEditorSettings } from "@/lib/pageEditorConfig";

type PageEditorStyle = CSSProperties & Record<`--${string}`, string>;

type Props = {
  page: PageEditorKey;
  sections?: any[];
  children: ReactNode;
  className?: string;
  gridSettings?: PageEditorSettings;
};

export function getPageEditorSectionStyle(settings: PageEditorSettings, key: string): CSSProperties {
  const aliases: Record<string, string[]> = { experience: ["experience", "values"], skills: ["skills", "values"] };
  const matchingKeys = aliases[key] || [key];
  const index = matchingKeys.map(item => settings.sectionOrder.indexOf(item)).find(item => item >= 0) ?? -1;
  return { order: index >= 0 ? index : settings.sectionOrder.length + 20 };
}

export function getPageEditorStyle(settings: PageEditorSettings, gridSettings: PageEditorSettings = settings): PageEditorStyle {
  return {
    "--page-editor-button-light-bg": settings.buttonLightBg,
    "--page-editor-button-light-text": settings.buttonLightText,
    "--page-editor-button-dark-bg": settings.buttonDarkBg,
    "--page-editor-button-dark-text": settings.buttonDarkText,
    ...(gridSettings.gridBgLight ? { "--page-editor-grid-bg-light": gridSettings.gridBgLight } : {}),
    ...(gridSettings.gridBgDark ? { "--page-editor-grid-bg-dark": gridSettings.gridBgDark } : {}),
    ...(gridSettings.gridCardBgLight ? { "--page-editor-grid-card-bg-light": gridSettings.gridCardBgLight } : {}),
    ...(gridSettings.gridCardBgDark ? { "--page-editor-grid-card-bg-dark": gridSettings.gridCardBgDark } : {}),
    ...(gridSettings.gridCardBorder ? { "--page-editor-grid-card-border": gridSettings.gridCardBorder } : {}),
    "--page-editor-grid-card-radius": gridSettings.gridCardRadius || "1rem",
    "--page-editor-grid-card-opacity": gridSettings.gridCardOpacity || "1",
    ...(gridSettings.gridTitleColorLight ? { "--page-editor-grid-title-light": gridSettings.gridTitleColorLight } : {}),
    ...(gridSettings.gridTitleColorDark ? { "--page-editor-grid-title-dark": gridSettings.gridTitleColorDark } : {}),
    ...(gridSettings.gridTextColorLight ? { "--page-editor-grid-text-light": gridSettings.gridTextColorLight } : {}),
    ...(gridSettings.gridTextColorDark ? { "--page-editor-grid-text-dark": gridSettings.gridTextColorDark } : {}),
    ...(gridSettings.gridIconColorLight ? { "--page-editor-grid-icon-light": gridSettings.gridIconColorLight } : {}),
    ...(gridSettings.gridIconColorDark ? { "--page-editor-grid-icon-dark": gridSettings.gridIconColorDark } : {}),
  };
}

export default function PageEditorSurface({ page, sections, children, className = "", gridSettings }: Props) {
  const settings = parsePageEditorSettings(sections, page);
  const meta = PAGE_EDITOR_META.find(item => item.key === page);
  return <div
    className={`page-editor-surface page-editor-${page} page-editor-align-${settings.contentAlignment} page-editor-icons-${settings.iconStyle} page-editor-spacing-${settings.spacingY} ${className}`.trim()}
    data-page-editor={page}
    data-page-editor-label={meta?.label}
    style={getPageEditorStyle(settings, gridSettings || settings)}
  >
    {children}
  </div>;
}
