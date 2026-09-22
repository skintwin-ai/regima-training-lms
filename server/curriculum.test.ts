import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ensureCurriculum } from "./curriculum";
import { MemStorage } from "./storage";
import { emailFromUsername } from "./platform/identity";

describe("ensureCurriculum", () => {
  it("seeds modules and one playable lesson per module on an empty store", async () => {
    const persistPath = path.join(mkdtempSync(path.join(tmpdir(), "lms-cur-")), "store.json");
    const storage = new MemStorage({ persistPath, seedDemoUser: false });
    await ensureCurriculum(storage);

    const modules = await storage.getAllModules();
    expect(modules).toHaveLength(16);

    const playable = [];
    for (const module of modules) {
      const lessons = await storage.getLessonsByModuleId(module.id);
      playable.push(...lessons);
    }
    expect(playable).toHaveLength(16);
    expect(new Set(modules.map((module) => module.order)).size).toBe(16);

    await ensureCurriculum(storage);
    const again = [];
    for (const module of modules) {
      again.push(...(await storage.getLessonsByModuleId(module.id)));
    }
    expect(again).toHaveLength(playable.length);
  });
});

describe("platform identity", () => {
  it("maps the demo username to a canonical SkinTwin email", () => {
    expect(emailFromUsername("demo")).toBe("demo@skintwin.ai");
    expect(emailFromUsername("Adaeze.Obi@Example.com")).toBe("adaeze.obi@example.com");
  });
});
