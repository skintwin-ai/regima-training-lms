import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { verifyPassword } from "./auth/password";
import { MemStorage } from "./storage";

const tempDirs: string[] = [];

function tempStorePath() {
  const dir = mkdtempSync(path.join(tmpdir(), "lms-store-"));
  tempDirs.push(dir);
  return path.join(dir, "lms-store.json");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("MemStorage persistence", () => {
  it("reloads modules and certifications from a JSON snapshot", async () => {
    const persistPath = tempStorePath();
    const first = new MemStorage({ persistPath, seedDemoUser: false });

    expect(first.isEmpty()).toBe(true);

    const module = await first.createModule({
      title: "Skin Anatomy",
      description: "Structure and function",
      estimatedTime: "45 minutes",
      order: 1,
    });
    first.recordCertification({
      therapistEmail: "demo@regima.training",
      therapistName: "Dr. Jane Doe",
      certLevel: "Foundation",
      courseId: String(module.id),
      source: "regima-training-lms",
    });

    const reloaded = new MemStorage({ persistPath, seedDemoUser: false });
    const modules = await reloaded.getAllModules();
    expect(modules).toHaveLength(1);
    expect(modules[0]?.title).toBe("Skin Anatomy");
    expect(reloaded.isEmpty()).toBe(false);
    expect(reloaded.getCertifications()).toHaveLength(1);
    expect(reloaded.getCertifications()[0]?.courseId).toBe(String(module.id));
  });

  it("seeds the demo user hash once and does not duplicate modules on reload", async () => {
    const persistPath = tempStorePath();
    const first = new MemStorage({ persistPath, seedDemoUser: true });
    const demo = await first.getUserByUsername("demo");
    expect(demo).toBeTruthy();
    expect(demo?.password.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("password", demo!.password)).toBe(true);

    await first.createModule({
      title: "Only once",
      description: "Seed guard",
      estimatedTime: "10 minutes",
      order: 1,
    });

    const second = new MemStorage({ persistPath, seedDemoUser: true });
    expect(await second.getAllModules()).toHaveLength(1);
    expect(await second.getUserByUsername("demo")).toMatchObject({ username: "demo" });
  });
});
