import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { acceptCourseOrder, acceptPaidShopifyOrder, acceptPaidShopifyReturn, acceptShopifyCourses, acceptShopifyProduct, courseOrderCommands, handleStage, loadChainLocate, paidShopifyCourseCommands, paidShopifyReturnCommands, recordCertificate, shopifyCatalogCommands, shopifyCourseCommands } from "./chain_stage.mjs";

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

test("a paid shopify order named by sku_id certifies that course once", () => {
  const preferred = paidShopifyCourseCommands({
    line_items: [{ sku: "REGIMA-COURSE-8", sku_id: "REGIMA-COURSE-9", title: "Advanced Treatments" }],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(preferred[0].args.certificate_id, "course:1:8");
  const fallen = paidShopifyCourseCommands({
    line_items: [{ sku: "  ", sku_id: "  ", skuId: "REGIMA-COURSE-9", title: "Clinic Retail" }],
    note_attributes: [{ name: "user_id", value: "1" }],
  });
  assert.equal(fallen[0].args.certificate_id, "course:1:9");
  assert.equal(fallen[0].args.course, "Clinic Retail");
  const retail = paidShopifyCourseCommands({
    line_items: [{ sku_id: "sku-cleanser", title: "Cleanser" }],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(retail.length, 0);
  const unnamed = paidShopifyCourseCommands({
    line_items: [{ sku_id: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
  });
  assert.equal(unnamed.length, 0);
  const dir = mkdtempSync(join(tmpdir(), "lms-paid-sku-id-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  try {
    const skipped = acceptPaidShopifyOrder({
      line_items: [{ sku_id: "sku-cleanser", title: "Cleanser" }],
      note_attributes: [{ name: "userId", value: "1" }],
    });
    assert.equal(skipped.ok, true);
    assert.equal(skipped.count, 0);
    assert.equal(existsSync(ledger), false);
    const certified = acceptPaidShopifyOrder({
      line_items: [{ sku: "  ", sku_id: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
      note_attributes: [{ name: "userId", value: "1" }],
    });
    assert.equal(certified.ok, true);
    assert.equal(certified.count, 1);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /course:1:8/);
    const again = acceptPaidShopifyOrder({
      line_items: [{ sku_id: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
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

test("a course named by a blank course records the title once", () => {
  const present = courseOrderCommands({
    moduleId: 8,
    userId: 1,
    course: "Advanced Treatments",
    title: "Clinic Retail",
  });
  assert.equal(present[0].args.certificate_id, "course:1:8");
  assert.equal(present[0].args.course, "Advanced Treatments");
  const fallen = courseOrderCommands({
    moduleId: 8,
    userId: 1,
    course: "  ",
    title: "Clinic Retail",
  });
  assert.equal(fallen[0].args.course, "Clinic Retail");
  const unlabeled = courseOrderCommands({
    moduleId: 8,
    userId: 1,
    course: "  ",
    title: "  ",
  });
  assert.equal(unlabeled[0].args.course, "module 8");
  const preferred = paidShopifyCourseCommands({
    line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments", name: "Clinic Retail" }],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(preferred[0].args.course, "Advanced Treatments");
  const named = paidShopifyCourseCommands({
    line_items: [{ sku: "REGIMA-COURSE-8", title: "  ", name: "Clinic Retail" }],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(named[0].args.certificate_id, "course:1:8");
  assert.equal(named[0].args.course, "Clinic Retail");
  const moduleName = paidShopifyCourseCommands({
    line_items: [{ sku: "REGIMA-COURSE-9", title: "  ", name: "  " }],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(moduleName[0].args.course, "module 9");
  assert.equal(moduleName[0].args.certificate_id, "course:1:9");
  const retail = paidShopifyCourseCommands({
    line_items: [{ sku: "sku-cleanser", title: "  ", name: "Cleanser" }],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(retail.length, 0);
  const noPractitioner = paidShopifyCourseCommands({
    line_items: [{ sku: "REGIMA-COURSE-8", title: "  ", name: "Clinic Retail" }],
  });
  assert.equal(noPractitioner.length, 0);
  const dir = mkdtempSync(join(tmpdir(), "lms-course-title-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  try {
    const missing = acceptCourseOrder({ course: "  ", title: "Clinic Retail" });
    assert.equal(missing.ok, false);
    assert.equal(existsSync(ledger), false);
    const skipped = acceptPaidShopifyOrder({
      line_items: [{ sku: "sku-cleanser", title: "  ", name: "Cleanser" }],
      note_attributes: [{ name: "userId", value: "1" }],
    });
    assert.equal(skipped.ok, true);
    assert.equal(skipped.count, 0);
    assert.equal(existsSync(ledger), false);
    const unnamed = acceptPaidShopifyOrder({
      line_items: [{ sku: "REGIMA-COURSE-8", title: "  ", name: "Clinic Retail" }],
    });
    assert.equal(unnamed.ok, true);
    assert.equal(unnamed.count, 0);
    assert.equal(existsSync(ledger), false);
    const certified = acceptCourseOrder({
      moduleId: 8,
      userId: 1,
      course: "  ",
      title: "Clinic Retail",
    });
    assert.equal(certified.ok, true);
    assert.equal(certified.count, 1);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /Clinic Retail/);
    assert.match(recorded, /course:1:8/);
    const again = acceptCourseOrder({
      moduleId: 8,
      userId: 1,
      course: "  ",
      title: "Clinic Retail",
    });
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
    const paidAgain = acceptPaidShopifyOrder({
      line_items: [{ sku: "REGIMA-COURSE-8", title: "  ", name: "Clinic Retail" }],
      note_attributes: [{ name: "userId", value: "1" }],
    });
    assert.equal(paidAgain.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a course kit named by a numeric string draws that product once", () => {
  const commands = courseOrderCommands({
    moduleId: 8,
    userId: 1,
    title: "Advanced Treatments",
    kit: [
      { name: "Manual", milligrams: "2000" },
      { sku: "sku-cleanser", location: "cape-town", milligrams: " 2000 " },
    ],
  });
  assert.equal(commands.length, 2);
  assert.equal(commands[1].args.milligrams, 2000);
  const dir = mkdtempSync(join(tmpdir(), "lms-kit-count-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  const order = {
    moduleId: 8,
    userId: 1,
    title: "Advanced Treatments",
    kit: [{ sku: "sku-cleanser", location: "cape-town", milligrams: "2000" }],
  };
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
          { command: "transfer", args: { transfer_id: "xfer-cape-town", sku_id: "sku-cleanser", batch_id: "batch-cleanser", source: "plant", destination: "cape-town", milligrams: 5000 } },
        ],
      }),
      encoding: "utf8",
    });
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);
    const seededText = readFileSync(ledger, "utf8");
    const word = acceptCourseOrder({ ...order, kit: [{ sku: "sku-cleanser", location: "cape-town", milligrams: "lots" }] });
    assert.equal(word.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), seededText);
    const paid = acceptCourseOrder(order);
    assert.equal(paid.ok, true, paid.error);
    assert.equal(paid.count, 2);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /course:1:8:0:sku-cleanser/);
    assert.match(recorded, /"milligrams": 2000/);
    const again = acceptCourseOrder(order);
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a certification named by courseId records that practitioner once", () => {
  const dir = mkdtempSync(join(tmpdir(), "lms-course-cert-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  try {
    const unnamed = recordCertificate({ certLevel: "Professional", therapistName: "Ada Okoro" });
    assert.equal(unnamed.ok, false);
    assert.equal(existsSync(ledger), false);
    const present = recordCertificate({
      moduleId: "8",
      courseId: "9",
      userId: "1",
      therapistEmail: "ada@regima.training",
      course: "Advanced Treatments",
    });
    assert.equal(present.ok, true, present.error);
    assert.equal(present.artifact.certificate_id, "8");
    assert.equal(present.artifact.practitioner_id, "1");
    assert.equal(present.artifact.course, "Advanced Treatments");
    const fallen = recordCertificate({
      moduleId: "  ",
      courseId: " 9 ",
      userId: "  ",
      therapistEmail: " ada@regima.training ",
      course: "  ",
      title: "Clinic Retail",
    });
    assert.equal(fallen.ok, true, fallen.error);
    assert.equal(fallen.artifact.certificate_id, "course:ada@regima.training:9");
    assert.equal(fallen.artifact.practitioner_id, "ada@regima.training");
    assert.equal(fallen.artifact.course, "Clinic Retail");
    const courseOnly = recordCertificate({
      courseId: "8",
      therapistEmail: "aya@regima.training",
    });
    assert.equal(courseOnly.ok, true, courseOnly.error);
    assert.equal(courseOnly.artifact.certificate_id, "course:aya@regima.training:8");
    assert.equal(courseOnly.artifact.course, "8");
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /"certificate_id": "8"/);
    assert.match(recorded, /course:ada@regima.training:9/);
    assert.match(recorded, /course:aya@regima.training:8/);
    const again = recordCertificate({
      courseId: "8",
      therapistEmail: "aya@regima.training",
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

test("a paid shopify order named by customer email certifies that practitioner once", () => {
  const preferred = paidShopifyCourseCommands({
    email: " ada@regima.training ",
    customer: { email: "other@regima.training" },
    line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(preferred[0].args.certificate_id, "course:1:8");
  assert.equal(preferred[0].args.practitioner_id, "1");
  const fallen = paidShopifyCourseCommands({
    email: "  ",
    customer: { email: " Ada@Regima.Training " },
    line_items: [{ sku: "REGIMA-COURSE-8", title: "  ", name: "Clinic Retail" }],
  });
  assert.equal(fallen[0].args.certificate_id, "course:ada@regima.training:8");
  assert.equal(fallen[0].args.practitioner_id, "ada@regima.training");
  assert.equal(fallen[0].args.course, "Clinic Retail");
  const orderEmail = paidShopifyCourseCommands({
    email: " Aya@Regima.Training ",
    customer: { email: "other@regima.training" },
    line_items: [{ sku: "REGIMA-COURSE-9", title: "Advanced Treatments" }],
  });
  assert.equal(orderEmail[0].args.practitioner_id, "aya@regima.training");
  const retail = paidShopifyCourseCommands({
    email: "ada@regima.training",
    line_items: [{ sku: "sku-cleanser", title: "Cleanser" }],
  });
  assert.equal(retail.length, 0);
  const unnamed = paidShopifyCourseCommands({
    email: "lots",
    customer: { email: "  " },
    line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
  });
  assert.equal(unnamed.length, 0);
  const dir = mkdtempSync(join(tmpdir(), "lms-course-email-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  try {
    const skipped = acceptPaidShopifyOrder({
      email: "ada@regima.training",
      line_items: [{ sku: "sku-cleanser", title: "Cleanser" }],
    });
    assert.equal(skipped.ok, true);
    assert.equal(skipped.count, 0);
    assert.equal(existsSync(ledger), false);
    const rejected = acceptPaidShopifyOrder({
      email: "lots",
      line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
    });
    assert.equal(rejected.ok, true);
    assert.equal(rejected.count, 0);
    assert.equal(existsSync(ledger), false);
    const certified = acceptPaidShopifyOrder({
      email: "  ",
      customer: { email: " Ada@Regima.Training " },
      line_items: [{ sku: "REGIMA-COURSE-8", title: "Clinic Retail" }],
    });
    assert.equal(certified.ok, true, certified.error);
    assert.equal(certified.count, 1);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /course:ada@regima.training:8/);
    const again = acceptPaidShopifyOrder({
      customer: { email: "ada@regima.training" },
      line_items: [{ sku: "REGIMA-COURSE-8", title: "Clinic Retail" }],
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

test("a paid course order records the product sale it already names once", () => {
  const retail = paidShopifyCourseCommands({
    id: 9,
    line_items: [{ sku: "sku-cleanser", grams: 2000, location_id: 99, title: "Cleanser" }],
  });
  assert.equal(retail.length, 0);
  const courseOnly = paidShopifyCourseCommands({
    id: 9,
    line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments", location: "cape-town", milligrams: 2000 }],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(courseOnly.length, 1);
  assert.equal(courseOnly[0].command, "certify_practitioner");
  const preferred = paidShopifyCourseCommands({
    order_number: " B2B-1 ",
    name: "#1001",
    id: 10,
    line_items: [{ sku: "sku-cleanser", location: "cape-town", milligrams: "2000" }],
  });
  assert.equal(preferred[0].args.fulfillment_id, "B2B-1:0:sku-cleanser");
  assert.equal(preferred[0].args.milligrams, 2000);
  const fallen = paidShopifyCourseCommands({
    order_number: "  ",
    orderNumber: "  ",
    name: "  ",
    id: 10,
    line_items: [{ sku: "  ", sku_id: " sku-cleanser ", location: " cape-town ", milligrams: " 2000 " }],
  });
  assert.equal(fallen[0].args.fulfillment_id, "10:0:sku-cleanser");
  assert.equal(fallen[0].args.location, "cape-town");
  const noted = paidShopifyCourseCommands({
    id: 9,
    line_items: [{ sku: "sku-cleanser", title: "Cleanser" }],
    note_attributes: [
      { name: "location", value: " cape-town " },
      { name: "milligrams", value: "2000" },
    ],
  });
  assert.equal(noted[0].args.fulfillment_id, "9:0:sku-cleanser");
  assert.equal(noted[0].args.kind, "retail");
  const lineWins = paidShopifyCourseCommands({
    id: 9,
    line_items: [{
      sku: "sku-cleanser",
      location: "cape-town",
      properties: [{ key: "location", value: "johannesburg" }, { key: "milligrams", value: "1000" }],
    }],
    note_attributes: [{ name: "location", value: "durban" }, { name: "milligrams", value: "500" }],
  });
  assert.equal(lineWins[0].args.location, "cape-town");
  assert.equal(lineWins[0].args.milligrams, 1000);
  assert.throws(
    () => paidShopifyCourseCommands({
      id: 9,
      line_items: [{ sku: "sku-cleanser", location: "cape-town" }],
    }),
    /location and milligrams/,
  );
  assert.throws(
    () => paidShopifyCourseCommands({
      line_items: [{ sku: "sku-cleanser", location: "cape-town", milligrams: 2000 }],
    }),
    /order number is required/,
  );
  const dir = mkdtempSync(join(tmpdir(), "lms-paid-sale-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  const order = {
    name: "  ",
    id: 9,
    email: "ada@regima.training",
    line_items: [
      { sku: "REGIMA-COURSE-8", title: "Advanced Treatments" },
      { sku_id: " sku-cleanser ", location: "cape-town", milligrams: "2000", kind: "treatment" },
    ],
  };
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
          { command: "transfer", args: { transfer_id: "xfer-cape-town", sku_id: "sku-cleanser", batch_id: "batch-cleanser", source: "plant", destination: "cape-town", milligrams: 5000 } },
        ],
      }),
      encoding: "utf8",
    });
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);
    const seededText = readFileSync(ledger, "utf8");
    const skipped = acceptPaidShopifyOrder({
      id: 9,
      email: "ada@regima.training",
      line_items: [{ sku: "sku-cleanser", grams: 2000, location_id: 99, title: "Cleanser" }],
    });
    assert.equal(skipped.ok, true);
    assert.equal(skipped.count, 0);
    assert.equal(readFileSync(ledger, "utf8"), seededText);
    const word = acceptPaidShopifyOrder({
      ...order,
      line_items: [
        order.line_items[0],
        { sku: "sku-cleanser", location: "cape-town", milligrams: "lots" },
      ],
    });
    assert.equal(word.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), seededText);
    const missing = acceptPaidShopifyOrder({
      line_items: [{ sku: "sku-cleanser", location: "cape-town", milligrams: 2000 }],
    });
    assert.equal(missing.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), seededText);
    const paid = acceptPaidShopifyOrder(order);
    assert.equal(paid.ok, true, paid.error);
    assert.equal(paid.count, 2);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /course:ada@regima.training:8/);
    assert.match(recorded, /9:1:sku-cleanser/);
    assert.match(recorded, /"location": "cape-town"/);
    assert.match(recorded, /"milligrams": 2000/);
    const again = acceptPaidShopifyOrder(order);
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
    const moved = acceptPaidShopifyOrder({
      ...order,
      line_items: [
        order.line_items[0],
        { sku_id: "sku-cleanser", location: "johannesburg", milligrams: 2000, kind: "treatment" },
      ],
    });
    assert.equal(moved.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
    assert.match(readFileSync(ledger, "utf8"), /cape-town/);
    assert.doesNotMatch(readFileSync(ledger, "utf8"), /johannesburg/);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a cancelled course order returns the product sale it already names once", () => {
  const retail = paidShopifyReturnCommands({
    id: 9,
    line_items: [{ sku: "sku-cleanser", grams: 2000, location_id: 99, title: "Cleanser" }],
  });
  assert.equal(retail.length, 0);
  const courseOnly = paidShopifyReturnCommands({
    id: 9,
    line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments", location: "cape-town", milligrams: 2000 }],
    note_attributes: [{ name: "userId", value: "1" }],
  });
  assert.equal(courseOnly.length, 0);
  const preferred = paidShopifyReturnCommands({
    order_number: " B2B-1 ",
    name: "#1001",
    id: 10,
    line_items: [{ sku: "sku-cleanser", location: "cape-town", milligrams: "2000" }],
  });
  assert.equal(preferred[0].args.return_id, "return:B2B-1:0:sku-cleanser");
  assert.equal(preferred[0].args.fulfillment_id, "B2B-1:0:sku-cleanser");
  const fallen = paidShopifyReturnCommands({
    order_number: "  ",
    name: "  ",
    id: 10,
    line_items: [{ sku: "  ", sku_id: " sku-cleanser ", location: " cape-town ", milligrams: " 2000 " }],
  });
  assert.equal(fallen[0].args.fulfillment_id, "10:0:sku-cleanser");
  assert.throws(
    () => paidShopifyReturnCommands({
      id: 9,
      line_items: [{ sku: "sku-cleanser", location: "cape-town", milligrams: "lots" }],
    }),
    /location and milligrams/,
  );
  const dir = mkdtempSync(join(tmpdir(), "lms-paid-return-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  const order = {
    name: "  ",
    id: 9,
    email: "ada@regima.training",
    line_items: [
      { sku: "REGIMA-COURSE-8", title: "Advanced Treatments" },
      { sku_id: " sku-cleanser ", location: "cape-town", milligrams: "2000", kind: "treatment" },
    ],
  };
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
          { command: "transfer", args: { transfer_id: "xfer-cape-town", sku_id: "sku-cleanser", batch_id: "batch-cleanser", source: "plant", destination: "cape-town", milligrams: 5000 } },
        ],
      }),
      encoding: "utf8",
    });
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);
    const seededText = readFileSync(ledger, "utf8");
    const unnamed = acceptPaidShopifyReturn({
      id: 9,
      email: "ada@regima.training",
      line_items: [{ sku: "REGIMA-COURSE-8", title: "Advanced Treatments" }],
    });
    assert.equal(unnamed.ok, true);
    assert.equal(unnamed.count, 0);
    assert.equal(readFileSync(ledger, "utf8"), seededText);
    const missing = acceptPaidShopifyReturn(order);
    assert.equal(missing.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), seededText);
    const word = acceptPaidShopifyReturn({
      ...order,
      line_items: [
        order.line_items[0],
        { sku: "sku-cleanser", location: "cape-town", milligrams: "lots" },
      ],
    });
    assert.equal(word.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), seededText);
    const paid = acceptPaidShopifyOrder(order);
    assert.equal(paid.ok, true, paid.error);
    const sold = readFileSync(ledger, "utf8");
    const returned = acceptPaidShopifyReturn(order);
    assert.equal(returned.ok, true, returned.error);
    assert.equal(returned.count, 1);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /return:9:1:sku-cleanser/);
    assert.match(recorded, /course:ada@regima.training:8/);
    const again = acceptPaidShopifyReturn({
      ...order,
      line_items: [
        order.line_items[0],
        { sku_id: "sku-cleanser", location: "johannesburg", milligrams: 2000, kind: "treatment" },
      ],
    });
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
    assert.match(sold, /9:1:sku-cleanser/);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a course product update records the formula it already names once", () => {
  const course = shopifyCatalogCommands({
    title: "Training: Advanced Treatments",
    tags: "training, course, digital, module-8",
    variants: [{ sku: "REGIMA-COURSE-8" }],
  });
  assert.equal(course.length, 0);
  const blankTag = shopifyCatalogCommands({
    title: "Gentle cleanser",
    tags: "formula:",
    variants: [{ sku: "sku-cleanser" }],
  });
  assert.equal(blankTag.length, 0);
  const preferred = shopifyCatalogCommands({
    title: "  ",
    name: " Gentle cleanser ",
    formulaId: " serum-c ",
    formula_id: "cleanser",
    tags: "formula:other",
    variants: [{ sku: "  ", sku_id: " sku-cleanser " }, { sku: "sku-cleanser" }],
  });
  assert.equal(preferred.length, 1);
  assert.equal(preferred[0].args.sku_id, "sku-cleanser");
  assert.equal(preferred[0].args.formula_id, "serum-c");
  assert.equal(preferred[0].args.name, "Gentle cleanser");
  const tagged = shopifyCatalogCommands({
    title: " ",
    name: "Gentle cleanser",
    tags: "Training, Formula: cleanser ",
    variants: [{ sku: " " }],
  });
  assert.equal(tagged[0].args.sku_id, "Gentle cleanser");
  assert.equal(tagged[0].args.formula_id, "cleanser");
  const metafield = shopifyCatalogCommands({
    title: "Gentle cleanser",
    metafields: [{ key: "formula_id", value: " cleanser " }],
    variants: [{ sku: "sku-cleanser" }],
  });
  assert.equal(metafield[0].args.formula_id, "cleanser");
  const variantFormula = shopifyCatalogCommands({
    title: "Gentle cleanser",
    tags: "training",
    variants: [
      { sku: "sku-toner", title: "Toner" },
      { sku: " sku-cleanser ", tags: "formula:cleanser" },
    ],
  });
  assert.equal(variantFormula.length, 1);
  assert.equal(variantFormula[0].args.sku_id, "sku-cleanser");
  assert.equal(variantFormula[0].args.formula_id, "cleanser");
  assert.throws(
    () => shopifyCatalogCommands({ tags: "formula:cleanser", variants: [{ sku: "sku-cleanser" }] }),
    /name is required/,
  );
  const dir = mkdtempSync(join(tmpdir(), "lms-product-formula-"));
  const ledger = join(dir, "supply-chain.jsonl");
  const locate = loadChainLocate();
  assert.ok(locate);
  const hub = locate.hubRoot();
  const previousLedger = process.env.SKINTWIN_CHAIN_LEDGER;
  const previousHub = process.env.SKINTWIN_HUB_ROOT;
  process.env.SKINTWIN_CHAIN_LEDGER = ledger;
  process.env.SKINTWIN_HUB_ROOT = hub;
  const product = {
    title: " ",
    name: "Gentle cleanser",
    tags: "formula:cleanser",
    variants: [{ sku: " sku-cleanser " }],
  };
  try {
    const seeded = spawnSync("python3", ["-m", "domain.ledger"], {
      cwd: hub,
      input: JSON.stringify({
        commands: [
          { command: "specify_ingredient", args: { ingredient_id: "glycerin", inci: "Glycerin", cas: "56-81-5" } },
          { command: "define_formula", args: { formula_id: "cleanser", name: "Gentle cleanser", lines: [["glycerin", 5000]] } },
        ],
      }),
      encoding: "utf8",
    });
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);
    const seededText = readFileSync(ledger, "utf8");
    const skipped = acceptShopifyProduct({
      title: "Training: Advanced Treatments",
      tags: "training, course",
      variants: [{ sku: "REGIMA-COURSE-8" }],
    });
    assert.equal(skipped.ok, true);
    assert.equal(skipped.count, 0);
    assert.equal(readFileSync(ledger, "utf8"), seededText);
    const missing = acceptShopifyProduct({
      ...product,
      tags: "formula:missing",
    });
    assert.equal(missing.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), seededText);
    const recordedProduct = acceptShopifyProduct(product);
    assert.equal(recordedProduct.ok, true, recordedProduct.error);
    assert.equal(recordedProduct.count, 1);
    const recorded = readFileSync(ledger, "utf8");
    assert.match(recorded, /sku-cleanser/);
    assert.match(recorded, /"formula_id": "cleanser"/);
    const again = acceptShopifyProduct(product);
    assert.equal(again.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
    const changed = acceptShopifyProduct({
      ...product,
      tags: "formula:serum-c",
    });
    assert.equal(changed.ok, false);
    assert.equal(readFileSync(ledger, "utf8"), recorded);
    assert.match(readFileSync(ledger, "utf8"), /cleanser/);
    assert.doesNotMatch(readFileSync(ledger, "utf8"), /serum-c/);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a created course product records the formula it already names once", () => {
  const dir = mkdtempSync(join(tmpdir(), "lms-product-create-"));
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
          { command: "define_formula", args: { formula_id: "cleanser", name: "Gentle cleanser", lines: [["glycerin", 5000]] } },
        ],
      }),
      encoding: "utf8",
    });
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);
    const recorded = spawnSync(process.execPath, [
      "--experimental-strip-types",
      "--input-type=module",
      "-e",
      `
        import { readFileSync } from "node:fs";
        import { ShopifyService } from "./server/services/shopify-service.ts";
        const ledger = process.env.SKINTWIN_CHAIN_LEDGER;
        const shopify = new ShopifyService({ accessToken: "" });
        const course = await shopify.handleWebhook("products/create", {
          id: 8,
          title: "Training: Advanced Treatments",
          tags: "training, course",
          variants: [{ id: 1, sku: "REGIMA-COURSE-8", price: "0.00" }],
        });
        if (!course.success) throw new Error(course.message);
        const blank = await shopify.handleWebhook("products/create", {
          id: 9,
          title: "Blank formula",
          tags: "formula:",
          variants: [{ id: 2, sku: "sku-blank", price: "1.00" }],
        });
        if (!blank.success) throw new Error(blank.message);
        const seededText = readFileSync(ledger, "utf8");
        const missing = await shopify.handleWebhook("products/create", {
          id: 10,
          title: "Missing formula",
          tags: "formula:missing",
          variants: [{ id: 3, sku: "sku-missing", price: "1.00" }],
        });
        if (missing.success) throw new Error("missing formula was accepted");
        if (readFileSync(ledger, "utf8") !== seededText) throw new Error("missing formula wrote");
        const product = {
          id: 11,
          title: "Gentle cleanser",
          tags: "formula:cleanser",
          variants: [{ id: 4, sku: "sku-cleanser", price: "25.00" }],
        };
        const created = await shopify.handleWebhook("products/create", product);
        if (!created.success) throw new Error(created.message);
        if (!created.message.includes("created")) throw new Error(created.message);
        const text = readFileSync(ledger, "utf8");
        if (!text.includes('"sku_id": "sku-cleanser"')) throw new Error("sku missing");
        if (!text.includes('"formula_id": "cleanser"')) throw new Error("formula missing");
        const again = await shopify.handleWebhook("products/create", product);
        if (again.success) throw new Error("repeat was accepted");
        if (readFileSync(ledger, "utf8") !== text) throw new Error("repeat wrote");
        const changed = await shopify.handleWebhook("products/create", { ...product, tags: "formula:serum-c" });
        if (changed.success) throw new Error("changed formula was accepted");
        const finalText = readFileSync(ledger, "utf8");
        if (finalText !== text) throw new Error("changed formula wrote");
        if (!finalText.includes("cleanser") || finalText.includes("serum-c")) throw new Error("formula changed");
      `,
    ], {
      cwd: new URL(".", import.meta.url).pathname,
      encoding: "utf8",
    });
    assert.equal(recorded.status, 0, recorded.stderr || recorded.stdout);
    const text = readFileSync(ledger, "utf8");
    assert.match(text, /"sku_id": "sku-cleanser"/);
    assert.match(text, /"formula_id": "cleanser"/);
    assert.doesNotMatch(text, /serum-c/);
    assert.doesNotMatch(text, /REGIMA-COURSE-8/);
    assert.doesNotMatch(text, /sku-blank/);
    assert.doesNotMatch(text, /sku-missing/);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("a saved course product records the formula that product already names once", () => {
  const dir = mkdtempSync(join(tmpdir(), "lms-product-save-"));
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
          { command: "define_formula", args: { formula_id: "cleanser", name: "Gentle cleanser", lines: [["glycerin", 5000]] } },
        ],
      }),
      encoding: "utf8",
    });
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);
    const recorded = spawnSync(process.execPath, [
      "--experimental-strip-types",
      "--input-type=module",
      "-e",
      `
        import { readFileSync } from "node:fs";
        import { ShopifyService } from "./server/services/shopify-service.ts";
        const ledger = process.env.SKINTWIN_CHAIN_LEDGER;
        const shopify = new ShopifyService({ accessToken: "" });
        const created = await shopify.createCourseProduct(8, "Advanced Treatments", "Playable module", "120.00");
        const seededText = readFileSync(ledger, "utf8");
        const plain = await shopify.updateCourseProduct(created.id, { title: "Advanced Treatments" });
        if (!plain.title.includes("Advanced Treatments")) throw new Error(plain.title);
        if (readFileSync(ledger, "utf8") !== seededText) throw new Error("course update wrote");
        let stored = shopify.localProducts.get(created.id);
        stored.tags = "formula:";
        await shopify.updateCourseProduct(created.id, { title: "Blank" });
        if (readFileSync(ledger, "utf8") !== seededText) throw new Error("blank formula wrote");
        stored = shopify.localProducts.get(created.id);
        stored.tags = "formula:missing";
        stored.variants[0].sku = "sku-missing";
        let missingRejected = false;
        try {
          await shopify.updateCourseProduct(created.id, { title: "Missing" });
        } catch (error) {
          missingRejected = error.name === "SupplyChainRejection";
        }
        if (!missingRejected) throw new Error("missing formula was accepted");
        if (readFileSync(ledger, "utf8") !== seededText) throw new Error("missing formula wrote");
        stored = shopify.localProducts.get(created.id);
        stored.tags = "formula:cleanser";
        stored.variants[0].sku = "sku-cleanser";
        const saved = await shopify.updateCourseProduct(created.id, { title: "Gentle cleanser" });
        if (!saved.title.includes("Gentle cleanser")) throw new Error(saved.title);
        const text = readFileSync(ledger, "utf8");
        if (!text.includes('"sku_id": "sku-cleanser"')) throw new Error("sku missing");
        if (!text.includes('"formula_id": "cleanser"')) throw new Error("formula missing");
        let repeatRejected = false;
        try {
          await shopify.updateCourseProduct(created.id, { title: "Gentle cleanser" });
        } catch (error) {
          repeatRejected = error.name === "SupplyChainRejection";
        }
        if (!repeatRejected) throw new Error("repeat was accepted");
        if (readFileSync(ledger, "utf8") !== text) throw new Error("repeat wrote");
        stored = shopify.localProducts.get(created.id);
        stored.tags = "formula:serum-c";
        let changedRejected = false;
        try {
          await shopify.updateCourseProduct(created.id, { title: "Serum" });
        } catch (error) {
          changedRejected = error.name === "SupplyChainRejection";
        }
        if (!changedRejected) throw new Error("changed formula was accepted");
        const finalText = readFileSync(ledger, "utf8");
        if (finalText !== text) throw new Error("changed formula wrote");
        if (!finalText.includes("cleanser") || finalText.includes("serum-c")) throw new Error("formula changed");
      `,
    ], {
      cwd: new URL(".", import.meta.url).pathname,
      encoding: "utf8",
    });
    assert.equal(recorded.status, 0, recorded.stderr || recorded.stdout);
    const text = readFileSync(ledger, "utf8");
    assert.match(text, /"sku_id": "sku-cleanser"/);
    assert.match(text, /"formula_id": "cleanser"/);
    assert.doesNotMatch(text, /serum-c/);
    assert.doesNotMatch(text, /sku-missing/);
    assert.doesNotMatch(text, /REGIMA-COURSE-8/);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});

test("processing a stored course order records the product sale it already names once", () => {
  const dir = mkdtempSync(join(tmpdir(), "lms-stored-order-"));
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
          { command: "transfer", args: { transfer_id: "xfer-cape-town", sku_id: "sku-cleanser", batch_id: "batch-cleanser", source: "plant", destination: "cape-town", milligrams: 5000 } },
        ],
      }),
      encoding: "utf8",
    });
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);
    const recorded = spawnSync(process.execPath, [
      "--experimental-strip-types",
      "--input-type=module",
      "-e",
      `
        import { readFileSync } from "node:fs";
        import { ShopifyService } from "./server/services/shopify-service.ts";
        const ledger = process.env.SKINTWIN_CHAIN_LEDGER;
        const shopify = new ShopifyService({ accessToken: "" });
        const seededText = readFileSync(ledger, "utf8");
        shopify.localOrders.set("ord-plain", {
          id: "ord-plain",
          name: "#plain",
          email: "ada@regima.training",
          line_items: [{ id: "li-plain", sku: "sku-cleanser", title: "Cleanser", grams: 2000, location_id: 99, quantity: 1, price: "25.00" }],
        });
        const plain = await shopify.recordStoredOrder("ord-plain");
        if (!plain || !plain.ok) throw new Error(plain && plain.error);
        if (readFileSync(ledger, "utf8") !== seededText) throw new Error("grams wrote");
        shopify.localOrders.set("ord-bad", {
          id: "ord-bad",
          name: "#bad",
          email: "ada@regima.training",
          line_items: [{ id: "li-bad", sku: "sku-cleanser", title: "Cleanser", location: "cape-town", milligrams: "lots", quantity: 1, price: "25.00" }],
        });
        const bad = await shopify.recordStoredOrder("ord-bad");
        if (!bad || bad.ok) throw new Error("bad milligrams was accepted");
        if (readFileSync(ledger, "utf8") !== seededText) throw new Error("bad milligrams wrote");
        shopify.localOrders.set("ord-course", {
          id: "ord-course",
          name: "#course",
          email: "ada@regima.training",
          line_items: [{ id: "li-course", sku: "REGIMA-COURSE-8", title: "Advanced Treatments", location: "cape-town", milligrams: "2000", quantity: 1, price: "0.00" }],
        });
        const course = await shopify.recordStoredOrder("ord-course");
        if (!course || !course.ok) throw new Error(course && course.error);
        const courseText = readFileSync(ledger, "utf8");
        if (!courseText.includes("course:ada@regima.training:8")) throw new Error("certificate missing");
        if (courseText.includes("fulfillment_id")) throw new Error("course line fulfilled");
        shopify.localOrders.set("ord-sale", {
          id: "ord-sale",
          name: "  ",
          email: "ada@regima.training",
          line_items: [
            { id: "li-sale", sku: "sku-cleanser", title: "Gentle cleanser", location: "cape-town", milligrams: "2000", quantity: 1, price: "25.00" },
          ],
        });
        const sold = await shopify.recordStoredOrder("ord-sale");
        if (!sold || !sold.ok) throw new Error(sold && sold.error);
        const text = readFileSync(ledger, "utf8");
        if (!text.includes('"fulfillment_id": "ord-sale:0:sku-cleanser"')) throw new Error("sale missing");
        if (!text.includes('"location": "cape-town"')) throw new Error("location missing");
        if (!text.includes('"milligrams": 2000')) throw new Error("milligrams missing");
        const stored = shopify.localOrders.get("ord-sale");
        stored.line_items[0].location = "johannesburg";
        const again = await shopify.recordStoredOrder("ord-sale");
        if (!again || again.ok) throw new Error("repeat was accepted");
        const finalText = readFileSync(ledger, "utf8");
        if (finalText !== text) throw new Error("repeat wrote");
        if (!finalText.includes("cape-town") || finalText.includes("johannesburg")) throw new Error("location changed");
      `,
    ], {
      cwd: new URL(".", import.meta.url).pathname,
      encoding: "utf8",
    });
    assert.equal(recorded.status, 0, recorded.stderr || recorded.stdout);
    const text = readFileSync(ledger, "utf8");
    assert.match(text, /"fulfillment_id": "ord-sale:0:sku-cleanser"/);
    assert.match(text, /"location": "cape-town"/);
    assert.match(text, /"milligrams": 2000/);
    assert.match(text, /course:ada@regima.training:8/);
    assert.doesNotMatch(text, /johannesburg/);
  } finally {
    if (previousLedger === undefined) delete process.env.SKINTWIN_CHAIN_LEDGER;
    else process.env.SKINTWIN_CHAIN_LEDGER = previousLedger;
    if (previousHub === undefined) delete process.env.SKINTWIN_HUB_ROOT;
    else process.env.SKINTWIN_HUB_ROOT = previousHub;
  }
});
