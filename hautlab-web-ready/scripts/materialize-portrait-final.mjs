import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const sourceDir = path.join(root, "assets-src", "portrait-final");
const outputDir = path.join(root, "public", "visuals");
const outputPath = path.join(outputDir, "dr-salvador-cordero-portrait-final.webp");
const sourceParts = Array.from(
  { length: 12 },
  (_, index) => `part${String(index).padStart(2, "0")}.b64`
);

const base64 = (await Promise.all(
  sourceParts.map((part) => readFile(path.join(sourceDir, part), "utf8"))
)).join("").replace(/\s+/g, "");

const bytes = Buffer.from(base64, "base64");
const hash = crypto.createHash("sha256").update(bytes).digest("hex");
const expectedHash = "f0346e0c206d4efe4b65d5f6a27c4bd7724038c4a8606d31900887bd1135c445";

if (bytes.length !== 99858) {
  throw new Error(`Unexpected portrait size: ${bytes.length}`);
}
if (hash !== expectedHash) {
  throw new Error(`Unexpected portrait hash: ${hash}`);
}
if (
  bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
  bytes.subarray(8, 12).toString("ascii") !== "WEBP"
) {
  throw new Error("Invalid WebP signature");
}

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, bytes);
console.log(`Materialized verified portrait: ${bytes.length} bytes`);
