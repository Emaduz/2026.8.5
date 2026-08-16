import { describe, expect, it } from "vitest";
import { appRouter, getAdminAccessToken } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeContext(cookieHeader = ""): TrpcContext {
  return { user: null, req: { protocol: "https", headers: { cookie: cookieHeader } } as TrpcContext["req"], res: { clearCookie: () => undefined, cookie: () => undefined } as TrpcContext["res"] };
}

describe("auth admin credentials", () => {
  it("accepts the configured admin password with the Emadalddine username", async () => {
    const configuredPassword = process.env.ADMIN_PANEL_PASSWORD;
    expect(configuredPassword).toBeTruthy();
    const caller = appRouter.createCaller(makeContext());
    await expect(caller.auth.verifyAdminCredentials({ username: "Emadalddine", password: configuredPassword ?? "" })).resolves.toEqual({ success: true });
  });
  it("restores authenticated status from the derived cookie on reload", async () => {
    const caller = appRouter.createCaller(makeContext(`admin_panel_access=${getAdminAccessToken()}`));
    await expect(caller.auth.adminPasswordStatus()).resolves.toEqual({ authenticated: true });
    await expect(appRouter.createCaller(makeContext()).auth.adminPasswordStatus()).resolves.toEqual({ authenticated: false });
  });
  it("refreshes an authenticated admin session without requiring a second login", async () => {
    const caller = appRouter.createCaller(makeContext(`admin_panel_access=${getAdminAccessToken()}`));
    await expect(caller.auth.refreshAdminSession()).resolves.toMatchObject({ success: true, maxAgeMs: expect.any(Number) });
  });
  it("rejects an incorrect username or password", async () => {
    const caller = appRouter.createCaller(makeContext());
    await expect(caller.auth.verifyAdminCredentials({ username: "Admin", password: "definitely-not-the-admin-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
