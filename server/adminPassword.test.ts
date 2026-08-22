import { describe, expect, it } from "vitest";
import { hashAdminPassword, verifyAdminPasswordHash } from "./adminPassword";

describe("admin password hashing", () => {
  it("hashes and verifies passwords without storing the original value", () => {
    const password = "a-strong-admin-password-2026";
    const hash = hashAdminPassword(password);
    expect(hash).toMatch(/^scrypt\$[a-f0-9]+\$[a-f0-9]+$/);
    expect(hash).not.toContain(password);
    expect(verifyAdminPasswordHash(password, hash)).toBe(true);
    expect(verifyAdminPasswordHash("wrong-password", hash)).toBe(false);
  });
});
