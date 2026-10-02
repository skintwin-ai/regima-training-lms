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

function wholeCount(value) {
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
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
  const course = text(namedId(body, "course", "title") || `module ${moduleKey}`, "course");
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
    const milligrams = wholeCount(item.milligrams);
    if (typeof item.location !== "string" || !Number.isInteger(milligrams)) {
      throw new Error(`sku ${sku} requires location and milligrams`);
    }
    commands.push({
      command: "fulfill",
      args: {
        fulfillment_id: `course:${practitionerId}:${moduleKey}:${index}:${sku}`,
        sku_id: sku,
        location: text(item.location, "location"),
        milligrams: positive(milligrams, "milligrams"),
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
  const sku = namedKitSku(item);
  const fromSku = /^REGIMA-COURSE-(\d+)$/.exec(sku);
  if (fromSku) return fromSku[1];
  const fromProperty = attributeValue(item?.properties, ["module_id", "moduleId"]);
  return /^\d+$/.test(fromProperty) ? fromProperty : "";
}

function namedEmail(value) {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  return email.includes("@") ? email : "";
}

function orderEmail(order) {
  return namedEmail(order?.email) || namedEmail(order?.customer?.email);
}

function orderLabel(order) {
  for (const key of ["order_number", "orderNumber", "name", "id"]) {
    const value = order?.[key];
    if (typeof value === "string") {
      const textValue = value.trim();
      if (textValue) return textValue;
      continue;
    }
    if (value) return String(value).trim();
  }
  return "";
}

function lineAttributeValues(entries) {
  const names = {
    location: "location",
    milligrams: "milligrams",
    kind: "kind",
    practitioner_id: "practitioner_id",
    practitionerid: "practitioner_id",
  };
  const found = {};
  if (!Array.isArray(entries)) return found;
  for (const prop of entries) {
    if (!prop || typeof prop !== "object") continue;
    const name = String(prop.name ?? prop.key ?? "").trim().toLowerCase();
    const canonical = names[name];
    if (!canonical || Object.hasOwn(found, canonical)) continue;
    found[canonical] = prop.value;
  }
  return found;
}

function textOrSame(value) {
  if (typeof value === "string") {
    const textValue = value.trim();
    return textValue || null;
  }
  return value == null ? null : value;
}

function missingAmount(value) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

function shopifyLineSale(item, defaults) {
  let location = textOrSame(item.location);
  let milligrams = missingAmount(item.milligrams) ? null : item.milligrams;
  let kind = typeof item.kind === "string" && item.kind.trim() ? item.kind.trim() : null;
  let practitioner = namedId(item, "practitionerId", "practitioner_id");
  const props = lineAttributeValues(item.properties);
  if (location == null && props.location != null) location = textOrSame(props.location);
  if (milligrams == null && !missingAmount(props.milligrams)) milligrams = props.milligrams;
  if (kind == null && typeof props.kind === "string") kind = props.kind.trim() || null;
  if (!practitioner && props.practitioner_id != null) {
    practitioner = String(props.practitioner_id).trim();
  }
  if (location == null && defaults.location != null) location = textOrSame(defaults.location);
  if (milligrams == null && !missingAmount(defaults.milligrams)) milligrams = defaults.milligrams;
  if (kind == null && typeof defaults.kind === "string") kind = defaults.kind.trim() || null;
  if (!practitioner && defaults.practitioner_id) practitioner = String(defaults.practitioner_id).trim();
  return { location, milligrams, kind, practitioner };
}

function shopifyProductSaleCommands(order, practitionerId) {
  const items = Array.isArray(order.line_items) ? order.line_items : [];
  const defaults = lineAttributeValues(order.note_attributes);
  if (!defaults.practitioner_id && practitionerId) defaults.practitioner_id = practitionerId;
  const sales = [];
  items.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    if (courseModuleId(item)) return;
    const sku = namedKitSku(item);
    if (!sku) return;
    const sale = shopifyLineSale(item, defaults);
    if (sale.location == null && sale.milligrams == null && sale.kind == null) return;
    const counted = wholeCount(sale.milligrams);
    if (typeof sale.location !== "string" || !Number.isInteger(counted)) {
      throw new Error(`sku ${sku} requires location and milligrams`);
    }
    const orderId = orderLabel(order);
    if (!orderId) throw new Error("order number is required");
    const kind = sale.kind || "retail";
    if (kind !== "retail" && kind !== "treatment") {
      throw new Error(`unknown fulfillment kind ${kind}`);
    }
    const args = {
      fulfillment_id: `${orderId}:${index}:${sku}`,
      sku_id: sku,
      location: text(sale.location, "location"),
      milligrams: positive(counted, "milligrams"),
      kind,
    };
    if (kind === "treatment") {
      if (!sale.practitioner) throw new Error("practitioner_id is required");
      args.practitioner_id = sale.practitioner;
    }
    sales.push({ command: "fulfill", args });
  });
  return sales;
}

export function paidShopifyCourseCommands(order) {
  if (!order || typeof order !== "object") return [];
  const orderUser = namedOrderValue(order, ["user_id", "userId", "practitioner_id"]) || orderEmail(order);
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
      course: namedId(item, "title", "name") || `module ${moduleId}`,
    });
  }
  return [
    ...courses.flatMap((course) => courseOrderCommands(course)),
    ...shopifyProductSaleCommands(order, orderUser),
  ];
}

export function shopifyOrderReturned(order) {
  if (!order || typeof order !== "object") return false;
  if (order.cancelled_at || order.cancel_reason) return true;
  const financial = String(order.financial_status || "").trim().toLowerCase();
  if (financial === "refunded" || financial === "voided") return true;
  return String(order.fulfillment_status || "").trim().toLowerCase() === "restocked";
}

export function acceptPaidShopifyOrder(order) {
  if (shopifyOrderReturned(order)) return acceptPaidShopifyReturn(order);
  return commitCourseCommands(() => paidShopifyCourseCommands(order), true);
}

function recordedSaleReturns(orderId) {
  if (!orderId) return [];
  const raw = process.env.SKINTWIN_CHAIN_LEDGER;
  if (!raw || !existsSync(raw)) return [];
  const prefix = `${orderId}:`;
  const fulfillments = new Map();
  const returns = new Map();
  for (const line of readFileSync(raw, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    const args = record.args || {};
    if (record.command === "fulfill" && typeof args.fulfillment_id === "string") {
      const fulfillmentId = args.fulfillment_id;
      if (!fulfillmentId.startsWith(prefix)) continue;
      const rest = fulfillmentId.slice(prefix.length);
      const split = rest.indexOf(":");
      if (split <= 0 || !/^\d+$/.test(rest.slice(0, split))) continue;
      fulfillments.set(fulfillmentId, fulfillmentId);
    }
    if (record.command === "return_sale" && typeof args.return_id === "string") {
      returns.set(args.return_id, args.fulfillment_id);
    }
  }
  const commands = [];
  for (const fulfillmentId of fulfillments.values()) {
    const returnId = `return:${fulfillmentId}`;
    if (!returns.has(returnId)) {
      commands.push({
        command: "return_sale",
        args: { return_id: returnId, fulfillment_id: fulfillmentId },
      });
      continue;
    }
    if (returns.get(returnId) !== fulfillmentId) throw new Error("id already exists");
  }
  return commands;
}

export function paidShopifyReturnCommands(order) {
  if (!order || typeof order !== "object") return [];
  const orderUser = namedOrderValue(order, ["user_id", "userId", "practitioner_id"]) || orderEmail(order);
  const named = shopifyProductSaleCommands(order, orderUser).map((command) => ({
    command: "return_sale",
    args: {
      return_id: `return:${command.args.fulfillment_id}`,
      fulfillment_id: command.args.fulfillment_id,
    },
  }));
  if (named.length > 0) return named;
  return recordedSaleReturns(orderLabel(order));
}

export function acceptPaidShopifyReturn(order) {
  return commitCourseCommands(() => paidShopifyReturnCommands(order), true);
}

function formulaFromShopify(product) {
  if (!product || typeof product !== "object") return "";
  const direct = namedId(product, "formulaId", "formula_id");
  if (direct) return direct;
  const metafields = Array.isArray(product.metafields) ? product.metafields : [];
  for (const field of metafields) {
    if (!field || typeof field !== "object") continue;
    if (field.key !== "formula_id" && field.key !== "formulaId") continue;
    if (typeof field.value === "string" && field.value.trim()) return field.value.trim();
  }
  let tags = product.tags;
  if (typeof tags === "string") tags = tags.split(",");
  if (!Array.isArray(tags)) return "";
  for (const tag of tags) {
    const value = String(tag).trim();
    const marker = "formula:";
    if (!value.toLowerCase().startsWith(marker)) continue;
    const formula = value.slice(marker.length).trim();
    if (formula) return formula;
  }
  return "";
}

function catalogName(product) {
  return text(namedId(product, "title", "name"), "name");
}

function catalogSkus(product, name) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const skus = [];
  const seen = new Set();
  for (const variant of variants) {
    if (!variant || typeof variant !== "object") continue;
    const sku = namedKitSku(variant);
    if (!sku || seen.has(sku)) continue;
    seen.add(sku);
    skus.push(sku);
  }
  if (skus.length > 0) return skus;
  return [text(namedKitSku(product) || name, "sku")];
}

export function shopifyCatalogCommands(product) {
  if (!product || typeof product !== "object") return [];
  const formulaId = formulaFromShopify(product);
  if (formulaId) {
    const name = catalogName(product);
    return catalogSkus(product, name).map((sku) => ({
      command: "catalog_sku",
      args: { sku_id: sku, formula_id: formulaId, name },
    }));
  }
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const named = [];
  const seen = new Set();
  for (const variant of variants) {
    if (!variant || typeof variant !== "object") continue;
    const sku = namedKitSku(variant);
    if (!sku || seen.has(sku)) continue;
    const variantFormula = formulaFromShopify(variant);
    if (!variantFormula) continue;
    seen.add(sku);
    named.push([sku, variantFormula]);
  }
  if (named.length === 0) return [];
  const name = catalogName(product);
  return named.map(([sku, variantFormula]) => ({
    command: "catalog_sku",
    args: { sku_id: sku, formula_id: variantFormula, name },
  }));
}

export function acceptShopifyProduct(product) {
  return commitCourseCommands(() => shopifyCatalogCommands(product), true);
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
  const moduleFromModule = namedId(body, "moduleId", "module_id");
  const moduleId = moduleFromModule || namedId(body, "courseId", "course_id");
  const userId = namedId(body, "userId", "user_id", "practitioner_id", "therapistEmail", "therapist_email");
  if (!moduleId || !userId) {
    return { ok: false, error: "certificate requires a module and a practitioner" };
  }
  if (!useSharedLedger()) return { ok: false, error: "supply-chain hub is not present" };
  return handleStage({
    command: "certify_practitioner",
    args: {
      certificate_id: moduleFromModule ? moduleId : `course:${userId}:${moduleId}`,
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
