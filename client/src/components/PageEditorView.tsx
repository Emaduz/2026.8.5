import { useMemo, useState } from "react";
import { LayoutTemplate, Save, SlidersHorizontal, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_PAGE_EDITOR_SETTINGS, PAGE_EDITOR_META, PageEditorKey, PageEditorSettings, parsePageEditorSettings } from "@/lib/pageEditorConfig";
import { trpc } from "@/lib/trpc";

type Props = {
  sections: any[];
  onSave: (input: { key: string; content: string; contentEn: string; contentAr: string }) => void;
  saving: boolean;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="flex items-center justify-between gap-3 text-xs font-semibold text-[#8f1819]"><span>{label}</span>{hint ? <small className="font-normal text-[#bd7b6a]">{hint}</small> : null}</span>{children}</label>;
}

function UploadField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const upload = trpc.content.uploadImage.useMutation();
  const [fileName, setFileName] = useState("");
  const handleFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const encoded = String(reader.result).split(",")[1];
      upload.mutate({ filename: file.name, mimeType: file.type, base64: encoded }, { onSuccess: result => onChange(result.url) });
    };
    reader.readAsDataURL(file);
  };
  return <div className="space-y-3"><label className="flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-[#d9cab1] bg-white p-3 text-xs text-[#9c7860] transition hover:border-[#8f1819] hover:text-[#8f1819]"><input type="file" accept="image/*" className="sr-only" onChange={event => handleFile(event.target.files?.[0])} /><Upload size={16} />{upload.isPending ? "Uploading image…" : fileName || "Upload page image"}</label>{value ? <div className="relative h-24 overflow-hidden rounded-lg border border-[#e5e5e5]"><img src={value} alt="Page visual" className="h-full w-full object-cover" /><button type="button" aria-label="Remove image" onClick={() => onChange("")} className="absolute right-2 top-2 rounded-full bg-[#2d2d2d]/75 p-1 text-white"><X size={14} /></button></div> : null}</div>;
}

export default function PageEditorView({ sections, onSave, saving }: Props) {
  const initialConfigs = useMemo(() => Object.fromEntries(PAGE_EDITOR_META.map(meta => [meta.key, parsePageEditorSettings(sections, meta.key)])) as Record<PageEditorKey, PageEditorSettings>, [sections]);
  const [configs, setConfigs] = useState<Record<PageEditorKey, PageEditorSettings>>(initialConfigs);
  const [activePage, setActivePage] = useState<PageEditorKey>("home");
  const current = configs[activePage] || DEFAULT_PAGE_EDITOR_SETTINGS[activePage];
  const update = (patch: Partial<PageEditorSettings>) => setConfigs(previous => ({ ...previous, [activePage]: { ...current, ...patch } }));

  return <div className="space-y-5">
    <div className="rounded-xl border border-[#eadccd] bg-[#fffaf4] p-3"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#8f1819]"><SlidersHorizontal size={17} />Comprehensive page layout & element editor</div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{PAGE_EDITOR_META.map(meta => <button key={meta.key} type="button" onClick={() => setActivePage(meta.key)} className={`flex min-h-20 flex-col items-start justify-between rounded-lg border px-3 py-3 text-left transition ${activePage === meta.key ? "border-[#8f1819] bg-[#8f1819] text-white shadow-[0_8px_20px_rgba(143,24,25,.16)]" : "border-[#eadccd] bg-white text-[#8f1819] hover:border-[#bd7b6a]"}`}><span className="text-sm font-semibold">{meta.label}</span><span className={`text-[11px] leading-4 ${activePage === meta.key ? "text-white/75" : "text-[#9c7860]"}`}>{meta.labelAr}</span></button>)}</div></div>

    <Card className="border-0 bg-[#fffaf4] shadow-[0_10px_35px_rgba(80,45,20,.05)]"><CardHeader><CardTitle className="flex items-center gap-2 text-[#8f1819]"><LayoutTemplate size={19} />{PAGE_EDITOR_META.find(meta => meta.key === activePage)?.label} detailed controls</CardTitle><p className="text-sm leading-6 text-[#9c7860]">Manage bilingual content, element positioning, div alignment, icon style variants, and light/dark button styling independently.</p></CardHeader><CardContent className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="English Title"><Input value={current.titleEn} onChange={event => update({ titleEn: event.target.value })} placeholder="English title" /></Field>
        <Field label="Arabic Title (العنوان بالعربي)"><Input value={current.titleAr} onChange={event => update({ titleAr: event.target.value })} placeholder="العنوان بالعربي" dir="rtl" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="English Subtitle"><Textarea value={current.subtitleEn} onChange={event => update({ subtitleEn: event.target.value })} placeholder="English subtitle" /></Field>
        <Field label="Arabic Subtitle (الوصف بالعربي)"><Textarea value={current.subtitleAr} onChange={event => update({ subtitleAr: event.target.value })} placeholder="الوصف بالعربي" dir="rtl" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Content Alignment (محاذاة العناصر)"><select value={current.contentAlignment} onChange={event => update({ contentAlignment: event.target.value as any })} className="flex h-10 w-full rounded-md border border-[#eadccd] bg-white px-3 py-2 text-sm text-[#2d2d2d]"><option value="left">Left (يسار)</option><option value="center">Center (وسط)</option><option value="right">Right (يمين)</option></select></Field>
        <Field label="Icon Style (شكل الأيقونات)"><select value={current.iconStyle} onChange={event => update({ iconStyle: event.target.value as any })} className="flex h-10 w-full rounded-md border border-[#eadccd] bg-white px-3 py-2 text-sm text-[#2d2d2d]"><option value="minimal">Minimal (بسيط)</option><option value="solid">Solid (ممتلئ)</option><option value="bordered">Bordered (محاط بإطار)</option></select></Field>
        <Field label="Section Spacing (المسافات)"><select value={current.spacingY} onChange={event => update({ spacingY: event.target.value as any })} className="flex h-10 w-full rounded-md border border-[#eadccd] bg-white px-3 py-2 text-sm text-[#2d2d2d]"><option value="compact">Compact (متراص)</option><option value="normal">Normal (عادي)</option><option value="spacious">Spacious (واسع)</option></select></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Page Hero / Visual Image"><UploadField value={current.heroImageUrl} onChange={url => update({ heroImageUrl: url })} /></Field>
        <Field label="Section Display Order (ترتيب الأقسام مفصولة بفاصلة)"><Input value={current.sectionOrder.join(", ")} onChange={event => update({ sectionOrder: event.target.value.split(",").map(item => item.trim()).filter(Boolean) })} placeholder="hero, featured, about, services, contact" /></Field>
      </div>
      <div className="rounded-xl border border-[#eadccd] bg-white p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8f1819]">Button Styling (Light & Dark Mode)</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Light Mode Bg"><div className="flex gap-2"><Input type="color" value={current.buttonLightBg} onChange={event => update({ buttonLightBg: event.target.value })} className="h-10 w-14 cursor-pointer p-1" /><Input value={current.buttonLightBg} onChange={event => update({ buttonLightBg: event.target.value })} /></div></Field>
          <Field label="Light Mode Text"><div className="flex gap-2"><Input type="color" value={current.buttonLightText} onChange={event => update({ buttonLightText: event.target.value })} className="h-10 w-14 cursor-pointer p-1" /><Input value={current.buttonLightText} onChange={event => update({ buttonLightText: event.target.value })} /></div></Field>
          <Field label="Dark Mode Bg"><div className="flex gap-2"><Input type="color" value={current.buttonDarkBg} onChange={event => update({ buttonDarkBg: event.target.value })} className="h-10 w-14 cursor-pointer p-1" /><Input value={current.buttonDarkBg} onChange={event => update({ buttonDarkBg: event.target.value })} /></div></Field>
          <Field label="Dark Mode Text"><div className="flex gap-2"><Input type="color" value={current.buttonDarkText} onChange={event => update({ buttonDarkText: event.target.value })} className="h-10 w-14 cursor-pointer p-1" /><Input value={current.buttonDarkText} onChange={event => update({ buttonDarkText: event.target.value })} /></div></Field>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eadccd] pt-4"><p className="text-xs leading-5 text-[#9c7860]">Stored securely under <code className="rounded bg-[#f3e8dc] px-1.5 py-0.5 text-[#8f1819]">page_editor_{activePage}</code>.</p><Button type="button" disabled={saving} onClick={() => { const content = JSON.stringify(current); onSave({ key: `page_editor_${activePage}`, content, contentEn: content, contentAr: content }); }} className="bg-[#8f1819] text-white hover:bg-[#701314]"><Save size={16} />{saving ? "Saving…" : `Save ${PAGE_EDITOR_META.find(meta => meta.key === activePage)?.label} settings`}</Button></div>
    </CardContent></Card>
  </div>;
}
