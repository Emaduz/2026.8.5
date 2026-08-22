import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashAdminPassword } from "./adminPassword";

let credential: { id: number; passwordHash: string; updatedAt: Date } | undefined;
let storedTokenHash = "";
let consumeResult = true;

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getAdminCredential: vi.fn(async () => credential),
    createAdminCredential: vi.fn(async (passwordHash: string) => { credential = { id: 1, passwordHash, updatedAt: new Date() }; return credential; }),
    updateAdminCredential: vi.fn(async (passwordHash: string) => { credential = { id: credential?.id ?? 1, passwordHash, updatedAt: new Date() }; return credential; }),
    createPasswordResetToken: vi.fn(async (tokenHash: string) => { storedTokenHash = tokenHash; }),
    consumePasswordResetToken: vi.fn(async () => consumeResult),
  };
});

const { appRouter, getAdminAccessToken } = await import("./routers");

function context(cookie = `admin_panel_access=${getAdminAccessToken()}`) {
  return {
    user: null,
    req: { protocol: "https", headers: { cookie } } as any,
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
  };
}

describe("password recovery behavior", () => {
  beforeEach(() => {
    credential = undefined;
    storedTokenHash = "";
    consumeResult = true;
    vi.restoreAllMocks();
  });

  it("sends a reset email for the configured address and suppresses the fourth request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ messageId: "test" }), { status: 201 }));
    const caller = appRouter.createCaller(context());
    for (let index = 0; index < 4; index += 1) await caller.auth.requestPasswordReset({ email: "Emad.i202020@gmail.com" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(storedTokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects a used or expired reset token and accepts a valid one once", async () => {
    const caller = appRouter.createCaller(context());
    consumeResult = false;
    await expect(caller.auth.resetAdminPassword({ token: "a".repeat(64), newPassword: "new-secure-password-2026" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    consumeResult = true;
    await expect(caller.auth.resetAdminPassword({ token: "b".repeat(64), newPassword: "new-secure-password-2026" })).resolves.toEqual({ success: true });
    expect(credential?.passwordHash).toContain("scrypt$");
  });

  it("invalidates the previous admin cookie after a password change", async () => {
    const caller = appRouter.createCaller(context());
    await caller.auth.changeAdminPassword({ currentPassword: process.env.ADMIN_PANEL_PASSWORD || "emad-admin-secure-2026", newPassword: "new-secure-password-2026" });
    const status = await appRouter.createCaller(context()).auth.adminPasswordStatus();
    expect(status.authenticated).toBe(false);
  });

  it("keeps password hashes out of the Brevo email payload", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ messageId: "test" }), { status: 201 }));
    const caller = appRouter.createCaller(context());
    await caller.auth.requestPasswordReset({ email: "Emad.i202020@gmail.com" });
    const body = JSON.stringify(fetchMock.mock.calls[0]?.[1]?.body ?? "");
    expect(body).not.toContain("passwordHash");
    expect(body).not.toContain("ADMIN_PANEL_PASSWORD");
  });
});
