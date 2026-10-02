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

function namedId(record, ...keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value == null) continue;
    const textValue = String(value).trim();
    if (textValue) return textValue;
  }
  return "";
}

function namedKitSku(item) {
  if (typeof item?.sku === "string" && item.sku.trim() !== "") return item.sku.trim();
  if (typeof item?.sku_id === "string" && item.sku_id.trim() !== "") return item.sku_id.trim();
  if (typeof item?.skuId === "string" && item.skuId.trim() !== "") return item.skuId.trim();
  return "";
}

export function courseOrderCommands(body) {
  const moduleKey = namedId(body, "moduleId", "module_id");
  const practitionerId = namedId(body, "userId", "user_id", "practitioner_id");
  if (!moduleKey || !practitionerId) {
    throw new Error("course order requires a module and a practitioner");
  }
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
    const sku = namedKitSku(item);
    if (!sku) return;
    if (typeof item.location !== "string" || !Number.isInteger(item.milligrams)) {
      throw new Error(`sku ${sku} requires location and milligrams`);
    }
    commands.push({
      command: "fulfill",
      args: {
        fulfillment_id: `course:${practitionerId}:${moduleKey}:${index}:${sku}`,
        sku_id: sku,
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
  return commitCourseCommands(() => courseOrderCommands(body));
}

function attributeValue(entries, names) {
  if (!Array.isArray(entries)) return "";
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  for (const prop of entries) {
    const name = String(prop?.name ?? prop?.key ?? "").trim().toLowerCase();
    if (!wanted.has(name)) continue;
    const value = prop?.value;
    if (value == null) continue;
    const textValue = String(value).trim();
    if (textValue) return textValue;
  }
  return "";
}

function namedOrderValue(order, names) {
  const fromNotes = attributeValue(order?.note_attributes, names);
  if (fromNotes) return fromNotes;
  const metadata = order?.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  for (const name of names) {
    const value = metadata[name];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function courseModuleId(item) {
  const sku = typeof item?.sku === "string" ? item.sku.trim() : "";
  const fromSku = /^REGIMA-COURSE-(\d+)$/.exec(sku);
  if (fromSku) return fromSku[1];
  const fromProperty = attributeValue(item?.properties, ["module_id", "moduleId"]);
  return /^\d+$/.test(fromProperty) ? fromProperty : "";
}

export function paidShopifyCourseCommands(order) {
  if (!order || typeof order !== "object") return [];
  const orderUser = namedOrderValue(order, ["user_id", "userId", "practitioner_id"]);
  const items = Array.isArray(order.line_items) ? order.line_items : [];
  const seen = new Set();
  const courses = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const moduleId = courseModuleId(item);
    if (!moduleId || seen.has(moduleId)) continue;
    const userId = attributeValue(item.properties, ["user_id", "userId", "practitioner_id"]) || orderUser;
    if (!userId) continue;
    seen.add(moduleId);
    courses.push({
      moduleId,
      userId,
      course: item.title || item.name || `module ${moduleId}`,
    });
  }
  return courses.flatMap((course) => courseOrderCommands(course));
}

export function acceptPaidShopifyOrder(order) {
  return commitCourseCommands(() => paidShopifyCourseCommands(order), true);
}

export function shopifyCourseCommands(courses) {
  if (!Array.isArray(courses)) throw new Error("courses are required");
  return courses.flatMap((course) => courseOrderCommands(course));
}

export function acceptShopifyCourses(courses) {
  return commitCourseCommands(() => shopifyCourseCommands(courses), true);
}

function commitCourseCommands(build, allowEmpty = false) {
  let commands;
  try {
    commands = build();
  } catch (error) {
    return { ok: false, error: error.message };
  }
  if (commands.length === 0 && allowEmpty) return { ok: true, count: 0 };
  if (!useSharedLedger()) return { ok: false, error: "supply-chain hub is not present" };
  const locate = loadChainLocate();
  if (!locate) return { ok: false, error: "supply-chain hub is not present" };
  const committed = locate.commitCommands(commands);
  return committed.ok ? { ok: true, count: commands.length } : committed;
}

export function recordCertificate(body) {
  const moduleId = namedId(body, "moduleId", "module_id");
  const userId = namedId(body, "userId", "user_id", "practitioner_id");
  if (!moduleId || !userId) {
    return { ok: false, error: "certificate requires a module and a practitioner" };
  }
  if (!useSharedLedger()) return { ok: false, error: "supply-chain hub is not present" };
  return handleStage({
    command: "certify_practitioner",
    args: {
      certificate_id: moduleId,
      practitioner_id: userId,
      course: namedId(body, "course", "title") || moduleId,
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
