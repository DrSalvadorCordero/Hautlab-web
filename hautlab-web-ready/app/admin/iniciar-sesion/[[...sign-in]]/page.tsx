import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

const clerkProxyUrl = "https://www.hautlabmx.com/__clerk";

type ClerkDomain = {
  id?: string;
  name?: string;
  is_satellite?: boolean;
  proxy_url?: string | null;
};

type ClerkErrorPayload = {
  errors?: Array<{ code?: string; message?: string; long_message?: string }>;
};

async function ensureClerkProxyConfigured() {
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) {
    console.error("Clerk proxy repair: missing secret key");
    return;
  }

  try {
    const listResponse = await fetch("https://api.clerk.com/v1/domains", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });

    if (!listResponse.ok) {
      const error = await listResponse.json().catch(() => null) as ClerkErrorPayload | null;
      console.error("Clerk proxy repair: domain list failed", {
        status: listResponse.status,
        code: error?.errors?.[0]?.code ?? null
      });
      return;
    }

    const payload = await listResponse.json() as { data?: ClerkDomain[] } | ClerkDomain[];
    const domains = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
    const domain =
      domains.find((item) => item.name === "hautlabmx.com") ??
      domains.find((item) => item.name === "www.hautlabmx.com") ??
      domains.find((item) => item.is_satellite === false) ??
      domains[0];

    if (!domain?.id) {
      console.error("Clerk proxy repair: no domain found", { count: domains.length });
      return;
    }

    if (domain.proxy_url === clerkProxyUrl) {
      console.info("Clerk proxy repair: already configured", { domain: domain.name ?? null });
      return;
    }

    const patchResponse = await fetch(`https://api.clerk.com/v1/domains/${encodeURIComponent(domain.id)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ proxy_url: clerkProxyUrl }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000)
    });

    if (!patchResponse.ok) {
      const error = await patchResponse.json().catch(() => null) as ClerkErrorPayload | null;
      console.error("Clerk proxy repair: patch failed", {
        status: patchResponse.status,
        code: error?.errors?.[0]?.code ?? null,
        message: error?.errors?.[0]?.message ?? null
      });
      return;
    }

    console.info("Clerk proxy repair: patch succeeded", { domain: domain.name ?? null });
  } catch (error) {
    console.error("Clerk proxy repair: unexpected failure", {
      message: error instanceof Error ? error.message : "unknown"
    });
  }
}

export default async function AdminSignInPage() {
  const configured = isClerkConfigured();
  if (configured) await ensureClerkProxyConfigured();

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0a09] px-6 py-12 text-bone">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-champagne">HAUTLAB · Acceso interno</p>
          <h1 className="mt-5 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
            Operación privada, separada del sitio público.
          </h1>
          <p className="mt-6 max-w-xl leading-7 text-muted">
            Este espacio está reservado para el Dr. Salvador Cordero y personal autorizado. No contiene un portal clínico para pacientes.
          </p>
          <Link href="/" className="mt-8 inline-flex text-sm text-muted transition hover:text-bone">
            ← Volver a hautlabmx.com
          </Link>
        </section>

        {configured ? (
          <SignIn
            path="/admin/iniciar-sesion"
            routing="path"
            fallbackRedirectUrl="/admin/facturacion"
            appearance={{ elements: { rootBox: "w-full", cardBox: "shadow-calm" } }}
          />
        ) : (
          <section className="w-full max-w-md rounded-[2rem] border border-line bg-white/[0.035] p-8 shadow-calm">
            <p className="text-sm font-medium">Configuración pendiente</p>
            <p className="mt-4 text-sm leading-6 text-muted">
              Las pantallas están listas. Falta conectar las claves del proveedor de identidad en Vercel antes de habilitar el acceso.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
