#!/usr/bin/env node
// Practitioner certificate commands for the LMS API and the hub ledger.

import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

let chainLocate;

function recordedHub(directory, fileName) {
  const domain = join(directory, "domain");
  const script = join(domain, fileName);
  const registryPath = join(domain, "org-ecosystem.json");
  if (!existsSync(registryPath) || !existsSync(join(domain, "supply-chain.json")) || !existsSync(script)) {
    return null;
  }
  try {
    const data = JSON.parse(readFileSync(registryPath, "utf8"));
    if (data?.hub?.name !== basename(directory)) return null;
  } catch {
    return null;
  }
  return script;
}

export function loadChainLocate() {
  if (chainLocate !== undefined) return chainLocate;
  const require = createRequire(import.meta.url);
  let script = null;
  if (process.env.SKINTWIN_HUB_ROOT) {
    script = recordedHub(process.env.SKINTWIN_HUB_ROOT, "locate.cjs");
  }
  let dir = dirname(fileURLToPath(import.meta.url));
  while (script === null && dir !== dirname(dir)) {
    if (existsSync(join(dir, ".git"))) {
      try {
        for (const name of readdirSync(dirname(dir))) {
          script = recordedHub(join(dirname(dir), name), "locate.cjs");
          if (script) break;
        }
      } catch {
        script = null;
      }
      break;
    }
    dir = dirname(dir);
  }
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

function positive(value, label) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
}

export function courseOrderCommands(body) {
  const moduleId = body?.moduleId;
  const userId = body?.userId;
  if (moduleId == null || userId == null || String(moduleId).trim() === "" || String(userId).trim() === "") {
    throw new Error("course order requires a module and a practitioner");
  }
  const practitionerId = String(userId).trim();
  const moduleKey = String(moduleId).trim();
  const course = text(body.course || body.title || `module ${moduleKey}`, "course");
  const commands = [
    {
      command: "certify_practitioner",
      args: {
        certificate_id: `course:${practitionerId}:${moduleKey}`,
        practitioner_id: practitionerId,
        course,
      },
    },
  ];
  const kit = body.kit == null ? [] : body.kit;
  if (!Array.isArray(kit)) throw new Error("kit must be a list");
  kit.forEach((item, index) => {
    if (!item?.sku) return;
    if (typeof item.location !== "string" || !Number.isInteger(item.milligrams)) {
      throw new Error(`sku ${item.sku} requires location and milligrams`);
    }
    commands.push({
      command: "fulfill",
      args: {
        fulfillment_id: `course:${practitionerId}:${moduleKey}:${index}:${item.sku}`,
        sku_id: text(item.sku, "sku"),
        location: text(item.location, "location"),
        milligrams: positive(item.milligrams, "milligrams"),
        kind: "treatment",
        practitioner_id: practitionerId,
      },
    });
  });
  return commands;
}

export function acceptCourseOrder(body) {
  let commands;
  try {
    commands = courseOrderCommands(body);
  } catch (error) {
    return { ok: false, error: error.message };
  }
  if (!useSharedLedger()) return { ok: false, error: "supply-chain hub is not present" };
  const locate = loadChainLocate();
  if (!locate) return { ok: false, error: "supply-chain hub is not present" };
  const committed = locate.commitCommands(commands);
  return committed.ok ? { ok: true, count: commands.length } : committed;
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
