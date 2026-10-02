import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { acceptCourseOrder, acceptPaidShopifyOrder, acceptShopifyCourses, courseOrderCommands, handleStage, loadChainLocate, paidShopifyCourseCommands, recordCertificate, shopifyCourseCommands } from "./chain_stage.mjs";

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

test("a practice kit named by sku_id draws that product once", () => {
  const commands = courseOrderCommands({
    module_id: 8,
    user_id: 1,
    title: "Advanced Treatments",
    kit: [
      { name: "Manual" },
      { sku: "sku-serum-c", sku_id: "sku-other", location: "cape-town", milligrams: 1000 },
      { sku_id: " sku-cleanser ", location: "cape-town", milligrams: 2000 },
    ],
  });
  assert.equal(commands.length, 3);
  assert.equal(commands[0].args.certificate_id, "course:1:8");
  assert.equal(commands[1].args.sku_id, "sku-serum-c");
  assert.equal(commands[2].args.fulfillment_id, "course:1:8:2:sku-cleanser");
  assert.equal(commands[2].args.sku_id, "sku-cleanser");
  assert.throws(
    () => courseOrderCommands({
      module_id: 8,
      user_id: 1,
      kit: [{ sku_id: "sku-cleanser", quantity: 1 }],
    }),
    /location and milligrams/,
  );
  const dir = mkdtempSync(join(tmpdir(), "lms-kit-sku-id-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  try {
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
    const result = acceptCourseOrder({
      module_id: 8,
      user_id: 1,
      title: "Advanced Treatments",
      kit: [
        { name: "Manual" },
        { sku_id: "sku-cleanser", location: "cape-town", milligrams: 2000 },
      ],
    });
    assert.equal(result.ok, true);
    assert.equal(result.count, 2);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /course:1:8/);
    assert.match(recorded, /course:1:8:1:sku-cleanser/);
    const again = acceptCourseOrder({
      module_id: 8,
      user_id: 1,
      title: "Advanced Treatments",
      kit: [
        { name: "Manual" },
        { sku_id: "sku-cleanser", location: "cape-town", milligrams: 2000 },
      ],
    });
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a paid shopify order certifies the course its sku and practitioner name", () => {
  const plain = {
    id: 9,
    line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
    note_attributes: [{ name: "gift", value: "thanks" }],
  };
  assert.equal(paidShopifyCourseCommands(plain).length, 0);
  const retail = {
    line_items: [{ sku: "sku-cleanser", title: "Cleanser" }],
    note_attributes: [{ name: "userId", value: "1" }],
  };
  assert.equal(paidShopifyCourseCommands(retail).length, 0);
  const commands = paidShopifyCourseCommands({
    line_items: [
      { sku: "REGIMA-COURSE-8", title: "Advanced Treatments" },
      { sku: "REGIMA-COURSE-8", title: "Advanced Treatments" },
      { sku: "sku-cleanser", title: "Cleanser" },
    ],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(commands.length, 1);
  assert.equal(commands[0].args.certificate_id, "course:1:8");
  assert.equal(commands[0].args.course, "Advanced Treatments");
  const owned = paidShopifyCourseCommands({
    line_items: [{ sku: "other", title: "Clinic", properties: [{ key: "module_id", value: "9" }, { name: "userId", value: "4" }] }],
    metadata: { userId: 1 },
  });
  assert.equal(owned[0].args.certificate_id, "course:4:9");
  const dir = mkdtempSync(join(tmpdir(), "lms-paid-course-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  try {
    const skipped = acceptPaidShopifyOrder(plain);
    assert.equal(skipped.ok, true);
    assert.equal(skipped.count, 0);
    assert.equal(existsSync(ledger), false);
    const certified = acceptPaidShopifyOrder({
      line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
      note_attributes: [{ name: "userId", value: "1" }],
    });
    assert.equal(certified.ok, true);
    assert.equal(certified.count, 1);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /course:1:8/);
    const again = acceptPaidShopifyOrder({
      line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
      note_attributes: [{ name: "userId", value: "1" }],
    });
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a certificate named by module_id records that module", () => {
  const dir = mkdtempSync(join(tmpdir(), "lms-certificate-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  try {
    const unnamed = recordCertificate({ title: "Advanced Treatments" });
    assert.equal(unnamed.ok, false);
    assert.equal(existsSync(ledger), false);
    const noPractitioner = recordCertificate({ module_id: 8, course: "Advanced Treatments" });
    assert.equal(noPractitioner.ok, false);
    assert.equal(existsSync(ledger), false);
    const present = recordCertificate({
      moduleId: "8",
      module_id: "9",
      userId: "1",
      user_id: "2",
      course: "  ",
      title: "Advanced Treatments",
    });
    assert.equal(present.ok, true);
    assert.equal(present.artifact.certificate_id, "8");
    assert.equal(present.artifact.practitioner_id, "1");
    assert.equal(present.artifact.course, "Advanced Treatments");
    const blankModule = recordCertificate({
      moduleId: "  ",
      module_id: "9",
      userId: "  ",
      practitioner_id: "aya",
      course: "  ",
      title: "  ",
    });
    assert.equal(blankModule.ok, true);
    assert.equal(blankModule.artifact.certificate_id, "9");
    assert.equal(blankModule.artifact.practitioner_id, "aya");
    assert.equal(blankModule.artifact.course, "9");
    const snake = recordCertificate({ module_id: 10, user_id: 3, title: "Clinic Retail" });
    assert.equal(snake.ok, true);
    assert.equal(snake.artifact.certificate_id, "10");
    assert.equal(snake.artifact.practitioner_id, "3");
    assert.equal(snake.artifact.course, "Clinic Retail");
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /"certificate_id": "8"/);
    assert.match(recorded, /"certificate_id": "10"/);
    const again = recordCertificate({ module_id: 10, user_id: 3, title: "Clinic Retail" });
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a processed shopify course order certifies each mapped module once", () => {
  assert.equal(shopifyCourseCommands([]).length, 0);
  const commands = shopifyCourseCommands([
    { moduleId: 8, userId: 1, course: "Advanced Treatments" },
    { moduleId: 9, userId: 1, course: "Clinic Retail" },
  ]);
  assert.equal(commands.length, 2);
  assert.equal(commands[0].args.certificate_id, "course:1:8");
  assert.equal(commands[1].args.certificate_id, "course:1:9");
  const dir = mkdtempSync(join(tmpdir(), "lms-shopify-course-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  try {
    const skipped = acceptShopifyCourses([]);
    assert.equal(skipped.ok, true);
    assert.equal(skipped.count, 0);
    assert.equal(existsSync(ledger), false);
    const certified = acceptShopifyCourses([
      { moduleId: 8, userId: 1, course: "Advanced Treatments" },
    ]);
    assert.equal(certified.ok, true);
    assert.equal(certified.count, 1);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /course:1:8/);
    const again = acceptShopifyCourses([
      { moduleId: 8, userId: 1, course: "Advanced Treatments" },
    ]);
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});
