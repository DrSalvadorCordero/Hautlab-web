export type GeoAudience = "merida" | "quintana-roo" | "campeche" | "international" | "general";

export type GeoContext = {
  audience: GeoAudience;
  country: string;
  region: string;
  city: string;
};

type HeaderReader = Pick<Headers, "get">;

function decodeHeader(value: string | null) {
  if (!value) return "";

  try {
    return decodeURIComponent(value.replace(/\+/g, " ")).trim();
  } catch {
    return value.trim();
  }
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function resolveGeoContext(headers: HeaderReader): GeoContext {
  const country = decodeHeader(headers.get("x-vercel-ip-country")).toUpperCase();
  const region = decodeHeader(headers.get("x-vercel-ip-country-region")).toUpperCase();
  const city = decodeHeader(headers.get("x-vercel-ip-city"));
  const normalizedCity = normalize(city);

  if (country && country !== "MX") {
    return { audience: "international", country, region, city };
  }

  if (
    region === "ROO" ||
    ["cancun", "playa del carmen", "tulum", "chetumal", "cozumel"].includes(normalizedCity)
  ) {
    return { audience: "quintana-roo", country, region, city };
  }

  if (region === "CAM" || ["campeche", "san francisco de campeche", "ciudad del carmen"].includes(normalizedCity)) {
    return { audience: "campeche", country, region, city };
  }

  if (region === "YUC" || ["merida", "progreso", "valladolid"].includes(normalizedCity)) {
    return { audience: "merida", country, region, city };
  }

  return { audience: "general", country, region, city };
}

export function geoHeaders(requestHeaders: HeaderReader, pathname: string) {
  const context = resolveGeoContext(requestHeaders);
  const headers = new Headers(requestHeaders as Headers);

  headers.set("x-hautlab-locale", pathname === "/en" || pathname.startsWith("/en/") ? "en" : "es-MX");
  headers.set("x-hautlab-audience", context.audience);
  headers.set("x-hautlab-country", context.country);
  headers.set("x-hautlab-region", context.region);
  headers.set("x-hautlab-city", context.city);

  return headers;
}
