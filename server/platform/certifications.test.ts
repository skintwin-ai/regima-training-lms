import { describe, expect, it, vi } from "vitest";
import {
  certLevelForModuleOrder,
  ingestCertificationEvent,
  suiteIngestUrl,
} from "./certifications";

describe("certification ingest helper", () => {
  it("records locally and skips the suite when REGIMA_SUITE_URL is unset", async () => {
    const record = vi.fn();
    const fetchImpl = vi.fn();

    const result = await ingestCertificationEvent(
      {
        therapistEmail: "ada@regima.training",
        therapistName: "Ada Okoro",
        certLevel: "Professional",
        courseId: "8",
        source: "regima-training-lms",
      },
      { suiteUrl: null, record, fetchImpl: fetchImpl as unknown as typeof fetch }
    );

    expect(record).toHaveBeenCalledOnce();
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result).toEqual({
      recorded: true,
      forwarded: false,
      skipped: true,
    });
  });

  it("POSTs platform.ingestCertification and fails open on suite errors", async () => {
    const record = vi.fn();
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await ingestCertificationEvent(
      {
        therapistEmail: "ada@regima.training",
        therapistName: "Ada Okoro",
        certLevel: "Advanced",
        courseId: "10",
        source: "regima-training-lms",
      },
      {
        suiteUrl: "https://suite.skintwin.ai",
        record,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }
    );

    expect(record).toHaveBeenCalledOnce();
    expect(fetchImpl).toHaveBeenCalledWith(
      suiteIngestUrl("https://suite.skintwin.ai"),
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
      })
    );
    expect(result.recorded).toBe(true);
    expect(result.forwarded).toBe(false);
    expect(result.skipped).toBe(false);
    expect(result.error).toMatch(/network down/);
  });

  it("maps module order onto the four cert levels", () => {
    expect(certLevelForModuleOrder(1)).toBe("Foundation");
    expect(certLevelForModuleOrder(5)).toBe("Professional");
    expect(certLevelForModuleOrder(9)).toBe("Advanced");
    expect(certLevelForModuleOrder(13)).toBe("Master");
  });
});
