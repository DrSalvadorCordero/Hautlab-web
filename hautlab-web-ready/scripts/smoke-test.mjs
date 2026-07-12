const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const productionOrigin = "https://www.hautlabmx.com";
const failures = [];

function record(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
  } else {
    failures.push(message);
    console.error(`✗ ${message}`);
  }
}

async function request(path, options = {}) {
  const url = new URL(path, baseUrl);
  return fetch(url, { redirect: "manual", ...options });
}

function canonicalFromHtml(html) {
  const relFirst = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (relFirst) return relFirst[1];
  const hrefFirst = html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  return hrefFirst?.[1] || null;
}

async function checkRedirect(path, expectedPath, allowedStatuses = [307, 308]) {
  const response = await request(path);
  record(allowedStatuses.includes(response.status), `${path} responde con redirección (${response.status})`);
  const location = response.headers.get("location");
  const actualPath = location ? new URL(location, baseUrl).pathname : null;
  record(actualPath === expectedPath, `${path} redirige a ${expectedPath}`);
}

async function main() {
  const sitemapResponse = await request("/sitemap.xml");
  record(sitemapResponse.status === 200, "/sitemap.xml responde 200");
  const sitemap = await sitemapResponse.text();
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  record(locs.length === 27, `sitemap contiene 27 URLs canónicas (encontradas: ${locs.length})`);
  record(locs.includes(`${productionOrigin}/contacto`), "sitemap incluye la página de contacto");

  for (const loc of locs) {
    const productionUrl = new URL(loc);
    const response = await request(`${productionUrl.pathname}${productionUrl.search}`);
    record(response.status === 200, `${productionUrl.pathname} responde 200`);

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const html = await response.text();
      record(canonicalFromHtml(html) === loc, `${productionUrl.pathname} declara canonical correcto`);
    }
  }

  const homeResponse = await request("/");
  const homeHtml = await homeResponse.text();
  record(!homeHtml.includes("connect.facebook.net"), "Meta Pixel no se carga en HTML inicial");
  record(!homeHtml.includes("fbevents.js"), "fbevents.js no se carga antes del consentimiento");

  const expectedHeaders = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
    "referrer-policy": "strict-origin-when-cross-origin"
  };

  for (const [header, expected] of Object.entries(expectedHeaders)) {
    record(homeResponse.headers.get(header) === expected, `cabecera ${header} = ${expected}`);
  }

  record(
    (homeResponse.headers.get("strict-transport-security") || "").includes("max-age=31536000"),
    "HSTS está configurado"
  );
  record(
    (homeResponse.headers.get("permissions-policy") || "").includes("camera=()"),
    "Permissions-Policy bloquea cámara, micrófono y geolocalización"
  );

  const robotsResponse = await request("/robots.txt");
  const robots = await robotsResponse.text();
  record(robotsResponse.status === 200, "/robots.txt responde 200");
  record(robots.includes(`Sitemap: ${productionOrigin}/sitemap.xml`), "robots.txt referencia el sitemap canónico");

  const notFoundResponse = await request("/ruta-que-no-existe-hautlab");
  record(notFoundResponse.status === 404, "una ruta inexistente responde 404");

  await checkRedirect("/rinomodelacion", "/procedimientos/rinomodelacion", [308]);
  await checkRedirect("/botox", "/procedimientos/toxina-botulinica", [308]);
  await checkRedirect("/tratamientos", "/procedimientos", [308]);
  await checkRedirect("/dermatologia-clinica", "/tratamientos/dermatologia-clinica", [308]);
  await checkRedirect("/tratamientos/rinomodelacion", "/procedimientos/rinomodelacion", [307, 308]);

  if (failures.length > 0) {
    console.error(`\nSmoke test falló con ${failures.length} problema(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`\nSmoke test correcto: ${locs.length} URLs canónicas, redirecciones, privacidad, cabeceras y 404 validados.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
