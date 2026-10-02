#!/usr/bin/env node
// Practitioner certificates issued by the training LMS.

import { readFileSync } from "node:fs";

const request = JSON.parse(readFileSync(0, "utf8"));
const args = request.args || {};

function fail(message) {
  process.stdout.write(JSON.stringify({ ok: false, error: message }));
  process.exit(1);
}

function text(value, label) {
  if (typeof value !== "string" || value.trim() === "") fail(`${label} is required`);
  return value.trim();
}

if (request.command !== "certify_practitioner") fail(`unknown command ${request.command}`);

process.stdout.write(JSON.stringify({
  ok: true,
  artifact: {
    certificate_id: text(args.certificate_id, "certificate_id"),
    practitioner_id: text(args.practitioner_id, "practitioner_id"),
    course: text(args.course, "course"),
  },
}));
