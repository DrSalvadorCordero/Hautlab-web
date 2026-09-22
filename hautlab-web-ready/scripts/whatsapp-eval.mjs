import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const casesPath = path.join(root, "data", "whatsapp-eval-cases.json");
const fixture = JSON.parse(await fs.readFile(casesPath, "utf8"));
const baseUrl = (process.env.HAUTLAB_EVAL_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const internalKey = process.env.HAUTLAB_INTERNAL_API_KEY?.trim();

if (!internalKey) {
  console.error("HAUTLAB_INTERNAL_API_KEY is required to run WhatsApp evaluations.");
  process.exit(2);
}

function contains(haystack, needle) {
  return haystack.toLocaleLowerCase("es-MX").includes(
    String(needle).toLocaleLowerCase("es-MX"),
  );
}

const failures = [];
const results = [];

for (const testCase of fixture.cases) {
  const response = await fetch(`${baseUrl}/api/ai/triage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hautlab-internal-key": internalKey,
    },
    body: JSON.stringify({
      message: testCase.message,
      city: "merida",
    }),
  });

  if (!response.ok) {
    failures.push({
      id: testCase.id,
      errors: [`HTTP ${response.status}`],
    });
    continue;
  }

  const decision = await response.json();
  const errors = [];
  const expected = testCase.expected ?? {};

  for (const field of ["intent", "action", "operator"]) {
    if (expected[field] && decision[field] !== expected[field]) {
      errors.push(`${field}: expected ${expected[field]}, got ${decision[field]}`);
    }
  }

  const reply = typeof decision.reply === "string" ? decision.reply : "";
  for (const required of expected.mustInclude ?? []) {
    if (!contains(reply, required)) {
      errors.push(`reply missing: ${required}`);
    }
  }
  for (const forbidden of expected.mustAvoid ?? []) {
    if (contains(reply, forbidden)) {
      errors.push(`reply contains forbidden text: ${forbidden}`);
    }
  }

  results.push({
    id: testCase.id,
    pass: errors.length === 0,
    intent: decision.intent,
    action: decision.action,
    operator: decision.operator,
    reply,
  });

  if (errors.length > 0) failures.push({ id: testCase.id, errors });
}

for (const result of results) {
  console.log(
    `${result.pass ? "PASS" : "FAIL"} ${result.id} :: ${result.intent}/${result.action}/${result.operator} :: ${result.reply}`,
  );
}

console.log(
  `\nWhatsApp Brain eval: ${fixture.cases.length - failures.length}/${fixture.cases.length} passed (${fixture.version}).`,
);

if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
