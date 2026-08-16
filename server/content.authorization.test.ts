import { describe, expect, it } from "vitest";
import { appRouter, getAdminAccessToken } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeContext(cookieHeader = ""): TrpcContext {
  return { user: null, req: { protocol: "https", headers: { cookie: cookieHeader } } as TrpcContext["req"], res: { clearCookie: () => undefined, cookie: () => undefined } as TrpcContext["res"] };
}

describe("content owner authorization", () => {
  it("rejects a request without the signed control-panel cookie", async () => {
    const caller = appRouter.createCaller(makeContext());
    await expect(caller.content.adminData()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
  it("accepts the signed control-panel cookie without requiring OAuth", async () => {
    const caller = appRouter.createCaller(makeContext(`admin_panel_access=${getAdminAccessToken()}`));
    await expect(caller.content.adminData()).resolves.toHaveProperty("projects");
  });
  it("keeps the public auth procedure available without exposing admin content", async () => {
    const caller = appRouter.createCaller(makeContext());
    await expect(caller.auth.me()).resolves.toBeNull();
  });
});
