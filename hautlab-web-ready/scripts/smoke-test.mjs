const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const productionOrigin = "https://www.hautlabmx.com";
const failures = [];

function record(condition, message) {
  if (condition) return;
  failures.push(message);
  console.error(`✗ ${message}`);
}

async function request(path, options = {}) {
  const url = new URL(path, baseUrl);
  return fetch(url, { redirect: "manual", ...options });
}

function attributeFromTag(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"));
  return match?.[1] || null;
}

function canonicalFromHtml(html) {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  const canonical = links.find((tag) => attributeFromTag(tag, "rel")?.toLowerCase() === "canonical");
  return canonical ? attributeFromTag(canonical, "href") : null;
}

function hasLanguageAlternate(html, language, expectedHref) {
  const normalizedLanguage = language.toLowerCase();
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);

  return links.some((tag) => {
    const rel = attributeFromTag(tag, "rel")?.toLowerCase().split(/\s+/) ?? [];
    const hrefLang = attributeFromTag(tag, "hreflang")?.toLowerCase();
    const href = attributeFromTag(tag, "href");
    return rel.includes("alternate") && hrefLang === normalizedLanguage && href === expectedHref;
  });
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
  const lastModifiedDates = [...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((match) => match[1]);
  record(locs.length === 31, `sitemap contiene 31 URLs canónicas (encontradas: ${locs.length})`);
  record(lastModifiedDates.length === locs.length, "cada URL del sitemap declara una fecha editorial");
  record(
    new Set(lastModifiedDates).size > 1,
    "el sitemap conserva fechas editoriales reales y no asigna una fecha de compilación idéntica"
  );
  record(locs.includes(`${productionOrigin}/en`), "sitemap incluye la versión internacional en inglés");
  record(locs.includes(`${productionOrigin}/contacto`), "sitemap incluye la página de contacto");
  record(locs.includes(`${productionOrigin}/publicaciones`), "sitemap incluye la página de publicaciones");
  record(locs.includes(`${productionOrigin}/cabina`), "sitemap incluye la Cabina Dermatocosmética");
  record(locs.includes(`${productionOrigin}/cabina/karen-cruz`), "sitemap incluye el perfil de Karen Cruz");

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
  record(homeHtml.includes("Pregunta a HAUTLAB"), "el asistente virtual está montado en la página");
  record(homeHtml.includes("Cabina Dermatocosmética"), "la navegación pública incluye la cabina");
  record(homeHtml.includes("href=\"/en\""), "la navegación española expone la versión inglesa");
  record(hasLanguageAlternate(homeHtml, "es-MX", productionOrigin), "la portada declara alterna en español");
  record(hasLanguageAlternate(homeHtml, "en", `${productionOrigin}/en`), "la portada declara alterna en inglés");
  record(hasLanguageAlternate(homeHtml, "x-default", productionOrigin), "la portada declara x-default");
  record(!homeHtml.includes("connect.facebook.net"), "Meta Pixel no se carga en HTML inicial");
  record(!homeHtml.includes("fbevents.js"), "fbevents.js no se carga antes del consentimiento");
  record(!homeHtml.includes("Physician"), "el schema no infla la acreditación profesional");
  record(homeHtml.includes("MedicalClinic"), "la portada identifica la clínica con schema");

  const englishResponse = await request("/en");
  const englishHtml = await englishResponse.text();
  record(englishResponse.status === 200, "/en responde 200");
  record(/<html[^>]*lang=["']en["']/i.test(englishHtml), "/en declara el idioma HTML en inglés");
  record(canonicalFromHtml(englishHtml) === `${productionOrigin}/en`, "/en declara canonical internacional correcto");
  record(englishHtml.includes("Clinical judgment. Restrained aesthetics."), "/en muestra el posicionamiento internacional aprobado");
  record(hasLanguageAlternate(englishHtml, "es-MX", productionOrigin), "/en declara alterna en español");
  record(hasLanguageAlternate(englishHtml, "x-default", productionOrigin), "/en declara x-default");
  record(!englishHtml.includes("Pregunta a HAUTLAB"), "la versión inglesa no monta el asistente exclusivamente español");
  record(englishHtml.includes("Mexican Professional License 11804418"), "/en conserva la identificación profesional");

  const quintanaResponse = await request("/", {
    headers: {
      "x-vercel-ip-country": "MX",
      "x-vercel-ip-country-region": "ROO",
      "x-vercel-ip-city": "Cancun"
    }
  });
  const quintanaHtml = await quintanaResponse.text();
  record(
    quintanaHtml.includes("Atención en Mérida para pacientes de Quintana Roo"),
    "la portada adapta el mensaje para Quintana Roo sin redirección"
  );

  const internationalResponse = await request("/", {
    headers: {
      "x-vercel-ip-country": "US",
      "x-vercel-ip-country-region": "TX",
      "x-vercel-ip-city": "Austin"
    }
  });
  const internationalHtml = await internationalResponse.text();
  record(
    internationalHtml.includes("English information for visiting patients"),
    "la portada ofrece la versión inglesa a visitantes internacionales"
  );

  const cabinaResponse = await request("/cabina");
  const cabinaHtml = await cabinaResponse.text();
  record(cabinaResponse.status === 200, "/cabina responde 200");
  record(cabinaHtml.includes("Cabina Dermatocosmética HAUTLAB"), "/cabina muestra el H1 aprobado");
  record(cabinaHtml.includes("Karen Cruz"), "/cabina identifica a Karen Cruz");
  record(cabinaHtml.includes("Cédula Profesional 11804418"), "/cabina muestra el respaldo médico");
  record(cabinaHtml.includes("HealthAndBeautyBusiness"), "/cabina publica schema de la unidad");
  record(!hasLanguageAlternate(cabinaHtml, "en", `${productionOrigin}/en`), "/cabina no declara una traducción inglesa inexistente");
  record(!hasLanguageAlternate(cabinaHtml, "x-default", productionOrigin), "/cabina no hereda x-default de la portada");

  const karenResponse = await request("/cabina/karen-cruz");
  const karenHtml = await karenResponse.text();
  record(karenResponse.status === 200, "/cabina/karen-cruz responde 200");
  record(karenHtml.includes("Coordinadora de Cabina Dermatocosmética HAUTLAB"), "el perfil conserva la jerarquía de HAUTLAB");

  const contactResponse = await request("/contacto");
  const contactHtml = await contactResponse.text();
  record(contactResponse.status === 200, "/contacto responde 200");
  record(contactHtml.includes('id="contacto-hautlab"'), "/contacto presenta el formulario estructurado");
  record(contactHtml.includes("aviso de privacidad"), "el formulario enlaza el aviso de privacidad");
  record(contactHtml.includes("Tipo de atención"), "el formulario segmenta la ruta de atención");

  const deletionResponse = await request("/data-deletion");
  const deletionHtml = await deletionResponse.text();
  record(deletionResponse.status === 200, "/data-deletion responde 200");
  record(deletionHtml.includes("Data deletion instructions"), "/data-deletion publica instrucciones verificables");
  record(
    /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(deletionHtml) ||
      /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots/i.test(deletionHtml),
    "/data-deletion evita indexación"
  );

  const clinicalHubResponse = await request("/tratamientos/dermatologia-clinica");
  const clinicalHubHtml = await clinicalHubResponse.text();
  record(clinicalHubResponse.status === 200, "el hub de dermatología clínica responde 200");
  record(clinicalHubHtml.includes("Consulta médica en Mérida"), "el hub explica el proceso local de consulta");
  record(clinicalHubHtml.includes("Última revisión médica"), "el hub declara revisión médica");

  for (const slug of [
    "rinomodelacion",
    "toxina-botulinica",
    "acne",
    "cicatrices-acne",
    "melasma",
    "alopecia"
  ]) {
    const response = await request(`/procedimientos/${slug}`);
    const html = await response.text();
    record(response.status === 200, `/procedimientos/${slug} responde 200`);
    record(html.includes("Revisión médica y fuentes"), `/procedimientos/${slug} declara revisión y fuentes`);
    record(html.includes("Riesgos y límites"), `/procedimientos/${slug} explica riesgos y límites`);
    record(html.includes("Alternativas"), `/procedimientos/${slug} presenta alternativas`);
  }

  for (const imagePath of [
    "/visuals/hautlab-rinomodelacion.webp",
    "/visuals/hautlab-armonizacion.webp",
    "/visuals/hautlab-menton.webp",
    "/visuals/hautlab-mandibula-hombre.webp"
  ]) {
    const response = await request(imagePath);
    const image = await response.arrayBuffer();
    record(response.status === 200, `${imagePath} responde 200`);
    record(response.headers.get("content-type")?.startsWith("image/webp"), `${imagePath} sirve un WebP válido`);
    record(image.byteLength > 20_000, `${imagePath} conserva resolución editorial`);
  }

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
    "Permissions-Policy bloquea cámara, micrófono y geolocalización del navegador"
  );

  const invalidAssistantResponse = await request("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [] })
  });
  record(invalidAssistantResponse.status === 400, "el asistente rechaza conversaciones inválidas");

  const emergencyAssistantResponse = await request("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Tengo pérdida súbita de visión" }]
    })
  });
  const emergencyAssistantPayload = await emergencyAssistantResponse.json();
  record(emergencyAssistantResponse.status === 200, "el asistente responde sin IA ante una urgencia");
  record(
    typeof emergencyAssistantPayload.reply === "string" && emergencyAssistantPayload.reply.includes("urgencias"),
    "el asistente canaliza señales de alarma a urgencias"
  );

  const ambiguousEmergencyResponse = await request("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: "Me estoy quedando ciega tras el relleno de ácido hialurónico, ¿cuánto cuesta corregirlo?"
        }
      ]
    })
  });
  const ambiguousEmergencyPayload = await ambiguousEmergencyResponse.json();
  const ambiguousEmergencyReply = ambiguousEmergencyPayload.reply || "";
  record(ambiguousEmergencyResponse.status === 200, "el asistente intercepta una urgencia aunque mencione precio");
  record(
    /urgencias/i.test(ambiguousEmergencyReply) &&
      !ambiguousEmergencyReply.includes("$7,500") &&
      !ambiguousEmergencyReply.includes("$5,500"),
    "una señal de alarma siempre tiene prioridad sobre la respuesta comercial"
  );

  const tearTroughAssistantResponse = await request("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Quiero información de ojeras" }]
    })
  });
  const tearTroughAssistantPayload = await tearTroughAssistantResponse.json();
  const tearTroughReply = tearTroughAssistantPayload.reply || "";
  record(tearTroughAssistantResponse.status === 200, "el asistente responde la consulta inicial de ojeras");
  record(
    tearTroughReply.includes("$7,500") &&
      tearTroughReply.includes("$5,500") &&
      tearTroughReply.includes("6 meses sin intereses"),
    "la respuesta de ojeras explica las tres condiciones de pago vigentes"
  );
  record(
    /hundimiento/i.test(tearTroughReply) && /color oscuro/i.test(tearTroughReply) && /bolsas/i.test(tearTroughReply),
    "la respuesta de ojeras distingue hundimiento, color y bolsas"
  );
  record(
    !tearTroughReply.includes("$1,300") && !/papada/i.test(tearTroughReply),
    "la respuesta de ojeras no desvía a consulta dermatológica ni mezcla papada"
  );

  const legacyPriceAssistantResponse = await request("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "A mí me dijeron que costaba $4,900" }]
    })
  });
  const legacyPriceAssistantPayload = await legacyPriceAssistantResponse.json();
  const legacyPriceReply = legacyPriceAssistantPayload.reply || "";
  record(legacyPriceAssistantResponse.status === 200, "el asistente responde cuando mencionan $4,900");
  record(/verific/i.test(legacyPriceReply), "el asistente envía la referencia de $4,900 a verificación");
  record(
    !/ácido hialurónico/i.test(legacyPriceReply) &&
      !legacyPriceReply.includes("$7,500") &&
      !legacyPriceReply.includes("$5,500"),
    "la referencia aislada de $4,900 permanece neutral hasta identificar el servicio"
  );

  const fillerLegacyPriceResponse = await request("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "user", content: "Quiero información de ojeras" },
        { role: "assistant", content: "¿Qué notas más: hundimiento, color oscuro o bolsas?" },
        { role: "user", content: "A mí me dijeron que costaba $4,900" }
      ]
    })
  });
  const fillerLegacyPricePayload = await fillerLegacyPriceResponse.json();
  const fillerLegacyPriceReply = fillerLegacyPricePayload.reply || "";
  record(fillerLegacyPriceResponse.status === 200, "el asistente conserva el contexto de relleno al verificar $4,900");
  record(
    /verific/i.test(fillerLegacyPriceReply) &&
      fillerLegacyPriceReply.includes("$7,500") &&
      fillerLegacyPriceReply.includes("$5,500") &&
      fillerLegacyPriceReply.includes("6 meses sin intereses"),
    "la verificación contextual de relleno conserva las condiciones vigentes"
  );

  const adminContentResponse = await request("/api/admin/cabina-content");
  record(adminContentResponse.status === 401, "la API de contenido administrativo rechaza acceso anónimo");

  const adminPageResponse = await request("/admin");
  const adminPageHtml = await adminPageResponse.text();
  record(adminPageResponse.status === 200, "/admin permanece cerrado sin responder 500 cuando Clerk no está configurado");
  record(
    adminPageHtml.includes("Autenticación pendiente de configuración"),
    "/admin explica qué falta configurar sin exponer el panel"
  );

  const adminPublishResponse = await request("/api/admin/cabina-content", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Origin: "https://example.com" },
    body: JSON.stringify({ core: {}, services: [], faq: [] })
  });
  record(adminPublishResponse.status === 403, "la API administrativa bloquea publicaciones sin autorización");

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
  await checkRedirect("/aviso-privacidad", "/aviso-de-privacidad", [308]);

  if (failures.length > 0) {
    console.error(`\nSmoke test falló con ${failures.length} problema(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`Smoke test correcto: ${locs.length} URLs canónicas, contenido clínico, contacto, inglés, geolocalización, cabina, asistente, privacidad, cabeceras y 404 validados.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
