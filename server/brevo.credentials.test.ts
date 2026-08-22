import { describe, expect, it } from "vitest";

describe("Brevo credentials", () => {
  it("authenticates against the Brevo account endpoint without sending email", async () => {
    const apiKey = process.env.BREVO_API_KEY;
    expect(apiKey, "BREVO_API_KEY must be configured for this integration test").toBeTruthy();

    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: { "api-key": apiKey as string, Accept: "application/json" },
    });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { email?: string; companyName?: string };
    expect(typeof payload.email === "string" || typeof payload.companyName === "string").toBe(true);
  }, 15_000);
});
