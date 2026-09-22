import { afterEach, describe, expect, it } from "vitest";
import { sessionForUser, verifyPlatformSession } from "./session";

describe("platform session", () => {
  afterEach(() => {
    delete process.env.SKINTWIN_PLATFORM_KEY;
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
