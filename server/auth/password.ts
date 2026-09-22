import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PREFIX = "scrypt";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${PREFIX}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, expected] = stored.split("$");
  if (scheme !== PREFIX || !salt || !expected) {
    return false;
  }

  const actual = scryptSync(password, salt, 64).toString("hex");
  const actualBuf = Buffer.from(actual, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (actualBuf.length !== expectedBuf.length) {
    return false;
  }
  return timingSafeEqual(actualBuf, expectedBuf);
}

export function isHashedPassword(value: string): boolean {
  return value.startsWith(`${PREFIX}$`);
}
