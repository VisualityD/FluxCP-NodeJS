import crypto from "node:crypto";

export function hashMd5(value: string): string {
  return crypto.createHash("md5").update(value).digest("hex");
}
