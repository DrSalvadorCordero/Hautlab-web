import test from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../next.config.mjs";

function matchesApexCanonicalRule(rule, pathname) {
  // The catch-all uses Next.js's :path(regex) syntax; inspect the actual
  // negative lookahead rather than relying on a substring in the source.
  const sourceMatch = /^\\/:path\\(([\\s\\S]*)\\)$/.exec(rule.source);
  assert.ok(sourceMatch, "canonical redirect must retain its named catch-all route");
  const matcher = new RegExp(`^(?:${sourceMatch[1]})$`);
  return matcher.test(pathname.replace(/^\\//, ""));
}

test("authenticated admin API routes remain on the Clerk apex host", async () => {
  const redirects = await nextConfig.redirects();
  const apexCanonical = redirects.find(
    (rule) =>
      rule.destination === "https://www.hautlabmx.com/:path" &&
      rule.has?.some(
        (condition) =>
          condition.type === "host" && condition.value === "hautlabmx.com",
      ),
  );
  assert.ok(apexCanonical, "apex to www marketing redirect must exist");

  for (const pathname of [
    "/admin/whatsapp",
    "/admin/iniciar-sesion",
    "/__clerk/v1/client",
    "/private-care",
    "/api/admin",
    "/api/admin/nimbo",
    "/api/admin/whatsapp-console",
    "/api/admin/whatsapp-inbox",
  ]) {
    assert.equal(
      matchesApexCanonicalRule(apexCanonical, pathname),
      false,
      `${pathname} must not leave authenticated apex origin`,
    );
  }

  for (const pathname of [
    "/",
    "/contacto",
    "/cabina",
    "/api/health",
    "/api/administrator",
    "/api/admin-extra",
  ]) {
    assert.equal(
      matchesApexCanonicalRule(apexCanonical, pathname),
      true,
      `${pathname} must preserve existing public canonical routing`,
    );
  }

  const wwwAdminRule = redirects.find(
    (rule) =>
      rule.source === "/admin/:path*" &&
      rule.destination === "https://hautlabmx.com/admin/:path*" &&
      rule.has?.some(
        (condition) =>
          condition.type === "host" && condition.value === "www.hautlabmx.com",
      ),
  );
  assert.ok(wwwAdminRule, "www admin pages must continue routing to Clerk apex");
});
