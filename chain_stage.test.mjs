import assert from "node:assert/strict";
import test from "node:test";
import { handleStage } from "./chain_stage.mjs";

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
