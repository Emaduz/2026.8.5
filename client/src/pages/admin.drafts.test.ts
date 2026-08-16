import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDraft, hasPostDraft, hasProjectDraft, readDraft, writeDraft } from "@/lib/adminDrafts";

describe("admin draft persistence", () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value); },
      removeItem: (key: string) => { store.delete(key); },
    });
  });

  it("round-trips project drafts with their editing id and timestamp", () => {
    const value = { title: "ERA refresh", description: "Saved before a browser close" };
    expect(writeDraft("test-project-draft", value, 12)).toBe(true);
    const draft = readDraft<typeof value>("test-project-draft");
    expect(draft?.editingId).toBe(12);
    expect(draft?.value).toEqual(value);
    expect(draft?.savedAt).toBeTypeOf("number");
    clearDraft("test-project-draft");
    expect(readDraft("test-project-draft")).toBeNull();
  });

  it("recognizes meaningful project and post drafts but ignores empty forms", () => {
    expect(hasProjectDraft({ title: "" })).toBe(false);
    expect(hasProjectDraft({ slides: [{ title: "Logo stage" }] })).toBe(true);
    expect(hasPostDraft({ content: "Draft body" })).toBe(true);
    expect(hasPostDraft({ title: "", content: "" })).toBe(false);
  });
});
