export type CertificationIngest = {
  therapistEmail: string;
  therapistName: string;
  certLevel: string;
  courseId: string;
  source: string;
};

export type CertificationIngestResult = {
  recorded: true;
  forwarded: boolean;
  skipped: boolean;
  error?: string;
};

export type CertificationRecorder = (
  event: CertificationIngest
) => unknown;

export function suiteIngestUrl(suiteUrl: string): string {
  return `${suiteUrl.replace(/\/$/, "")}/api/trpc/platform.ingestCertification`;
}

export async function ingestCertificationEvent(
  event: CertificationIngest,
  options: {
    suiteUrl?: string | null;
    fetchImpl?: typeof fetch;
    record?: CertificationRecorder;
    authorization?: string | null;
  } = {}
): Promise<CertificationIngestResult> {
  if (options.record) {
    await options.record(event);
  }

  const suiteUrl = options.suiteUrl ?? process.env.REGIMA_SUITE_URL ?? null;
  if (!suiteUrl) {
    return { recorded: true, forwarded: false, skipped: true };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (options.authorization) {
    headers.authorization = options.authorization.startsWith("Bearer ")
      ? options.authorization
      : `Bearer ${options.authorization}`;
  }
  try {
    const response = await fetchImpl(suiteIngestUrl(suiteUrl), {
      method: "POST",
      headers,
      body: JSON.stringify({ json: event }),
    });
    if (!response.ok) {
      return {
        recorded: true,
        forwarded: false,
        skipped: false,
        error: `suite responded ${response.status}`,
      };
    }
    return { recorded: true, forwarded: true, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "suite ingest failed";
    return { recorded: true, forwarded: false, skipped: false, error: message };
  }
}

export function certLevelForModuleOrder(order: number): string {
  if (order >= 13) return "Master";
  if (order >= 9) return "Advanced";
  if (order >= 5) return "Professional";
  return "Foundation";
}
