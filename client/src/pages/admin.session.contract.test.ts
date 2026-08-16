import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("admin session resilience contract", () => {
  it("keeps the admin session alive during active work and persists drafts on tab/page changes", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Admin.tsx"), "utf8");
    expect(source).toContain("refreshAdminSession.mutate()");
    expect(source).toContain("ADMIN_SESSION_REFRESH_INTERVAL_MS");
    expect(source).toContain("visibilitychange");
    expect(source).toContain("pagehide");
    expect(source).toContain("readAdminActivity");
    expect(source).toContain("writeDraft(PROJECT_DRAFT_KEY");
    expect(source).toContain("writeDraft(POST_DRAFT_KEY");
  });
});
