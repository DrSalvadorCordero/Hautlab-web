import { readFileSync } from "node:fs";

const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
const entries = Object.entries(lock.packages ?? {}).filter(([key]) =>
  key === "node_modules/sharp" ||
  key === "node_modules/source-map-js" ||
  key.startsWith("node_modules/@img/sharp")
);
for (const [key, value] of entries) {
  console.log("HAUTLAB_LOCK_ENTRY " + key + " " + JSON.stringify(value));
}
