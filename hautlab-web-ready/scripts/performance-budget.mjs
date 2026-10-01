import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = join(process.cwd(), ".next", "static");
const limits = { js: 750 * 1024, css: 250 * 1024 };
const violations = [];

async function walk(dir) {
  for (const name of await readdir(dir).catch(() => [])) {
    const file = join(dir, name);
    const info = await stat(file);
    if (info.isDirectory()) await walk(file);
    else {
      const ext = name.endsWith(".js") ? "js" : name.endsWith(".css") ? "css" : null;
      if (ext && info.size > limits[ext]) violations.push({ file: relative(process.cwd(), file), bytes: info.size, limit: limits[ext] });
    }
  }
}
await walk(root);
if (violations.length) {
  console.error("performance_budget_exceeded", violations);
  process.exit(1);
}
console.log("performance_budget_ok", limits);
