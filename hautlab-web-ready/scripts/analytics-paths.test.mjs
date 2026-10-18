import assert from "node:assert/strict";
import test from "node:test";
import { isPublicAnalyticsPath, publicAnalyticsLocation } from "../lib/analytics-config.ts";

test("tracks public editorial and procedure landing pages", () => {
  for (const path of [
    "/", "/en", "/contacto", "/agenda", "/pagos", "/journal",
    "/journal/dermatitis-seborreica-por-que-vuelve",
    "/procedimientos/rinomodelacion", "/procedimientos/toxina-botulinica",
    "/merida/dermatologia", "/publicaciones", "/dr-salvador-cordero",
    "/experiencia", "/cabina/karen-cruz"
  ]) {
    assert.equal(isPublicAnalyticsPath(path), true, `public route ${path} should be measured`);
  }
});

test("clinical routes, token-bearing URLs and transactions never reach marketing analytics", () => {
  for (const path of [
    "/admin", "/admin/private-care",
    "/private-care", "/private-care/empezar", "/private-care/activar",
    "/mi-hautlab/patient-secret-code", "/seguimiento",
    "/api/agenda/disponibilidad", "/pagos/resultado",
    "/experiencia/mi-plan", "/journal?name=patient",
    "/contacto#diagnosis", "/private-care/registro",
    "/en/private-care"
  ]) {
    assert.equal(isPublicAnalyticsPath(path), false, `private route ${path} must be excluded`);
    assert.equal(publicAnalyticsLocation("https://www.hautlabmx.com", path), null);
  }
});

test("analytics page locations never include query parameters or fragments", () => {
  assert.equal(
    publicAnalyticsLocation("https://www.hautlabmx.com/?utm_source=campaign#secret", "/journal/dermatitis-seborreica-por-que-vuelve"),
    "https://www.hautlabmx.com/journal/dermatitis-seborreica-por-que-vuelve"
  );
  assert.equal(publicAnalyticsLocation("https://hautlabmx.com", "/"), "https://hautlabmx.com/");
  assert.equal(publicAnalyticsLocation("javascript:alert(1)", "/contacto"), null);
});
