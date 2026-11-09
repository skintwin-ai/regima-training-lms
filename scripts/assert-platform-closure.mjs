#!/usr/bin/env node
/**
 * Exit 0 only when platform-mesh-verification.json reports closureGate.goalComplete.
 * Run after verify-platform-mesh.mjs (default path: repo root output file).
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../platform-mesh-verification.json',
);
const file = process.env.MESH_VERIFY_OUTPUT || defaultFile;

if (!fs.existsSync(file)) {
  console.error(`Missing verification output: ${file}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(file, 'utf8'));
const gate = report.closureGate;
if (!gate?.goalComplete) {
  console.error('Platform closure gate not satisfied:', JSON.stringify(gate?.blockedBy || gate, null, 2));
  process.exit(2);
}

console.log('Platform closure gate satisfied:', JSON.stringify(gate, null, 2));
