import { readFileSync } from "node:fs";

const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
const entries = Object.fromEntries(
  Object.entries(lock.packages ?? {}).filter(([key]) =>
    key === "node_modules/sharp" ||
    key === "node_modules/source-map-js" ||
    key.startsWith("node_modules/@img/sharp")
  ),
);
console.log("HAUTLAB_LOCK_SECURITY_FIXES=" + JSON.stringify(entries));
