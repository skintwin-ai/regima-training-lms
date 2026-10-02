import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { acceptCourseOrder, courseOrderCommands, handleStage, loadChainLocate } from "./chain_stage.mjs";

test("certificate command accepts a practitioner course", () => {
  const result = handleStage({
    command: "certify_practitioner",
    args: { certificate_id: "cert-1", practitioner_id: "aya", course: "Facial protocol" },
  });
  assert.equal(result.ok, true);
  assert.equal(result.artifact.practitioner_id, "aya");
});

test("certificate command rejects a blank course", () => {
  const result = handleStage({
    command: "certify_practitioner",
    args: { certificate_id: "cert-1", practitioner_id: "aya", course: " " },
  });
  assert.equal(result.ok, false);
});

test("a paid course certifies the practitioner and can draw a practice kit", () => {
  const commands = courseOrderCommands({
    moduleId: 8,
    userId: 1,
    title: "Advanced Treatments",
    kit: [
      { name: "Manual" },
      { sku: "sku-cleanser", location: "cape-town", milligrams: 2000 },
    ],
  });
  assert.equal(commands.length, 2);
  assert.equal(commands[0].args.certificate_id, "course:1:8");
  assert.equal(commands[0].args.course, "Advanced Treatments");
  assert.equal(commands[1].command, "fulfill");
  assert.equal(commands[1].args.kind, "treatment");
  assert.equal(commands[1].args.practitioner_id, "1");
  assert.equal(commands[1].args.fulfillment_id, "course:1:8:1:sku-cleanser");
  assert.throws(
    () => courseOrderCommands({ moduleId: 8, userId: 1, kit: [{ sku: "sku-cleanser", quantity: 1 }] }),
    /location and milligrams/,
  );
});

test("a practice kit against an empty ledger writes nothing", () => {
  const dir = mkdtempSync(join(tmpdir(), "lms-kit-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  try {
    const result = acceptCourseOrder({
      moduleId: 8,
      userId: 1,
      title: "Advanced Treatments",
      kit: [{ sku: "sku-cleanser", location: "cape-town", milligrams: 2000 }],
    });
    assert.equal(result.ok, false);
    assert.equal(existsSync(ledger), false);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
  }
});

test("a paid course appends one certificate and a second order does not", () => {
  const dir = mkdtempSync(join(tmpdir(), "lms-course-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  try {
    const first = acceptCourseOrder({ moduleId: 8, userId: 1, title: "Advanced Treatments" });
    assert.equal(first.ok, true);
    assert.equal(first.count, 1);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /course:1:8/);
    const again = acceptCourseOrder({ moduleId: 8, userId: 1, title: "Advanced Treatments" });
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a paid course draws the practice kit from outlet stock", () => {
  const dir = mkdtempSync(join(tmpdir(), "lms-kit-ok-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  const seeded = spawnSync("python3", ["-m", "domain.ledger"], {
    cwd: hub,
    input: JSON.stringify({
      commands: [
        { command: "specify_ingredient", args: { ingredient_id: "glycerin", inci: "Glycerin", cas: "56-81-5" } },
        { command: "qualify_supplier", args: { qualification_id: "qual-glycerin", supplier_name: "Inland Humectants", ingredient_id: "glycerin" } },
        { command: "receive_lot", args: { lot_id: "lot-glycerin", ingredient_id: "glycerin", qualification_id: "qual-glycerin", milligrams: 5000 } },
        { command: "define_formula", args: { formula_id: "cleanser", name: "Gentle cleanser", lines: [["glycerin", 5000]] } },
        { command: "catalog_sku", args: { sku_id: "sku-cleanser", formula_id: "cleanser", name: "Gentle cleanser" } },
        { command: "manufacture", args: { batch_id: "batch-cleanser", sku_id: "sku-cleanser", units: 1, allocations: [["glycerin", "lot-glycerin", 5000]] } },
        { command: "transfer", args: { transfer_id: "xfer-cape-town", sku_id: "sku-cleanser", batch_id: "batch-cleanser", source: "plant", destination: "cape-town", milligrams: 2000 } },
      ],
    }),
    encoding: "utf8",
  });
  assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);
  try {
    const result = acceptCourseOrder({
      moduleId: 8,
      userId: 1,
      title: "Advanced Treatments",
      kit: [{ sku: "sku-cleanser", location: "cape-town", milligrams: 2000 }],
    });
    assert.equal(result.ok, true);
    assert.equal(result.count, 2);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /course:1:8/);
    assert.match(recorded, /course:1:8:0:sku-cleanser/);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});
