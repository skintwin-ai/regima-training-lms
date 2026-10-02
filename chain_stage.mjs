#!/usr/bin/env node
// Practitioner certificate commands for the LMS API and the hub ledger.

import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

let chainLocate;

export function loadChainLocate() {
  if (chainLocate !== undefined) return chainLocate;
  const require = createRequire(import.meta.url);
  const candidates = [];
  if (process.env.SKINTWIN_HUB_ROOT) {
    candidates.push(join(process.env.SKINTWIN_HUB_ROOT, "domain", "locate.cjs"));
  }
  let dir = dirname(fileURLToPath(import.meta.url));
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, ".git"))) {
      candidates.push(join(dirname(dir), "skintwin-ecosystem-design", "domain", "locate.cjs"));
      break;
    }
    dir = dirname(dir);
  }
  const script = candidates.find((path) => existsSync(path));
  chainLocate = script ? require(script) : null;
  return chainLocate;
}

export function useSharedLedger() {
  const locate = loadChainLocate();
  if (!locate) return false;
  return Boolean(locate.bindLedger());
}

function text(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} is required`);
  }
  return value.trim();
}

export function certifyPractitioner(args) {
  return {
    certificate_id: text(args.certificate_id, "certificate_id"),
    practitioner_id: text(args.practitioner_id, "practitioner_id"),
    course: text(args.course, "course"),
  };
}

export function recordCertificate(body) {
  const moduleId = body?.moduleId;
  const userId = body?.userId;
  if (moduleId == null || userId == null) {
    return { ok: false, error: "certificate requires a module and a practitioner" };
  }
  if (!useSharedLedger()) return { ok: false, error: "supply-chain hub is not present" };
  return handleStage({
    command: "certify_practitioner",
    args: {
      certificate_id: String(moduleId),
      practitioner_id: String(userId),
      course: body.course ? String(body.course) : String(moduleId),
    },
  });
}

export function handleStage(request) {
  if (request?.command !== "certify_practitioner") {
    return { ok: false, error: `unknown command ${request?.command}` };
  }
  try {
    return commitStage(request, { ok: true, artifact: certifyPractitioner(request.args || {}) });
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function commitStage(request, result) {
  if (!result.ok || process.env.SKINTWIN_CHAIN_SKIP_DISPATCH === "1") return result;
  const ledger = process.env.SKINTWIN_CHAIN_LEDGER;
  if (!ledger) return result;
  const locate = loadChainLocate();
  if (!locate) return { ok: false, error: "supply-chain hub is not present" };
  const committed = locate.commitCommand(request);
  return committed.ok ? result : committed;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  const result = handleStage(JSON.parse(readFileSync(0, "utf8")));
  process.stdout.write(JSON.stringify(result));
  if (!result.ok) process.exit(1);
}
