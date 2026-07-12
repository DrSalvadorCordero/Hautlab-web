import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import part1 from "../assets-src/dr-salvador-cordero/part1.mjs";
import part2 from "../assets-src/dr-salvador-cordero/part2.mjs";
import part3 from "../assets-src/dr-salvador-cordero/part3.mjs";
import part4 from "../assets-src/dr-salvador-cordero/part4.mjs";

const output = resolve("public/visuals/dr-salvador-cordero.webp");
const bytes = Buffer.from([...part1, ...part2, ...part3, ...part4]);

await mkdir(dirname(output), { recursive: true });
await writeFile(output, bytes);
console.log(`Materialized ${output} (${bytes.length} bytes)`);
