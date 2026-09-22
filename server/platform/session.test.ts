import { afterEach, describe, expect, it } from "vitest";
import { continueUrls, sessionForUser, verifyPlatformSession } from "./session";

describe("platform session", () => {
  afterEach(() => {
    delete process.env.SKINTWIN_PLATFORM_KEY;
  });

  it("builds continue URLs for Connect and Suite", () => {
    process.env.SKINTWIN_PLATFORM_KEY = "mesh-secret";
    process.env.CONNECTOR_URL = "http://localhost:3000";
    process.env.REGIMA_SUITE_URL = "http://localhost:3001";
    const token = sessionForUser({ username: "demo", name: "Dr. Jane Doe" });
    const urls = continueUrls(token);
    expect(urls.connect).toContain("/login?platform_session=");
    expect(urls.suite).toContain("/api/platform/login?session=");
  });

  it("issues a therapist session from the demo username", () => {
    process.env.SKINTWIN_PLATFORM_KEY = "mesh-secret";
    const token = sessionForUser({ username: "demo", name: "Dr. Jane Doe" });
    expect(verifyPlatformSession(token)).toMatchObject({
      email: "demo@skintwin.ai",
      name: "Dr. Jane Doe",
      source: "regima-training-lms",
    });
  });
});
