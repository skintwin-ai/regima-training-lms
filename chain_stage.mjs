#!/usr/bin/env node
// Practitioner certificate commands for the LMS API and the hub ledger.

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

let chainLocate;

export function loadChainLocate() {
  if (chainLocate !== undefined) return chainLocate;
  const require = createRequire(import.meta.url);
  const override = process.env.SKINTWIN_HUB_ROOT;
  if (override) {
    const script = join(override, "domain", "locate.cjs");
    if (existsSync(script) && existsSync(join(override, "domain", "org-ecosystem.json"))) {
      chainLocate = require(script);
      return chainLocate;
    }
  }
  let dir = dirname(fileURLToPath(import.meta.url));
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, ".git"))) {
      let names = [];
      try {
        names = readdirSync(dirname(dir));
      } catch {
        chainLocate = null;
        return null;
      }
      for (const name of names) {
        const script = join(dirname(dir), name, "domain", "locate.cjs");
        if (existsSync(script) && existsSync(join(dirname(dir), name, "domain", "org-ecosystem.json"))) {
          chainLocate = require(script);
          return chainLocate;
        }
      }
      break;
    }
    dir = dirname(dir);
  }
  chainLocate = null;
  return null;
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
  const hub = locate && locate.hubRoot();
  if (!hub) return { ok: false, error: "supply-chain hub is not present" };
  const child = spawnSync("python3", ["-m", "domain.ledger"], {
    cwd: hub,
    input: JSON.stringify(request),
    encoding: "utf8",
  });
  if (child.status !== 0) {
    let message = child.stderr;
    try {
      message = JSON.parse(child.stdout || "{}").error || message;
    } catch {
      message = message || "ledger rejected the command";
    }
    return { ok: false, error: message || "ledger rejected the command" };
  }
  return result;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  const result = handleStage(JSON.parse(readFileSync(0, "utf8")));
  process.stdout.write(JSON.stringify(result));
  if (!result.ok) process.exit(1);
}
