import Link from "next/link";
import { Clock, ExternalLink, Instagram, MapPin, ShieldCheck } from "lucide-react";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const mapsUrl = "https://maps.app.goo.gl/8CoPkGjpuYDi8QqE6?g_st=ic";

export function Footer() {
  const year = new Date().getFullYear();
  const linkClass = "rounded-full border border-line px-4 py-2 text-sm transition hover:border-bone/30 hover:text-bone";

  return (
    <footer className="border-t border-line bg-[#070706] text-muted" id="contacto">
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 py-12 lg:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-bone">HAUTLAB | Dermatología, Medicina Estética y Cabina Dermatocosmética</p>
            <p className="mt-4 max-w-xl text-sm leading-7">
              {siteConfig.tagline} Valoración de piel, diseño facial y protocolos dermatocosméticos con criterio, seguimiento y resultados sobrios.
            </p>
            <div className="mt-5 space-y-1 text-xs leading-5 text-quiet">
              <p className="text-bone">Dr. Salvador Cordero</p>
              <p>Médico Cirujano · Dermatología Clínica y Estética</p>
              <p>Cédula Profesional 11804418</p>
              <p className="pt-2">Cabina Dermatocosmética coordinada por Karen Cruz.</p>
              <p>Atención únicamente con cita previa.</p>
            </div>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-3xl border border-line bg-white/[0.03] p-5">
              <MapPin className="mb-4 h-5 w-5 text-champagne" />
              <p className="text-bone">Dirección</p>
              <p className="mt-2 leading-6">{siteConfig.address}</p>
            </div>
            <div className="rounded-3xl border border-line bg-white/[0.03] p-5">
              <Clock className="mb-4 h-5 w-5 text-champagne" />
              <p className="text-bone">Horarios</p>
              <p className="mt-2 leading-6">Atención únicamente con cita previa. Los horarios de la cabina se confirman de manera independiente.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a className={`${linkClass} text-bone`} href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
              WhatsApp {siteConfig.whatsappDisplay}
            </a>
            <Link className={linkClass} href="/cabina" data-event="cabina_footer_link">Cabina Dermatocosmética</Link>
            <a className={linkClass} href={siteConfig.instagram} target="_blank" rel="noreferrer">
              <Instagram className="mr-2 inline h-4 w-4" /> {siteConfig.instagramHandle}
            </a>
            <Link className={linkClass} href="/pagos">Pagos seguros</Link>
            <Link className={linkClass} href="/aviso-de-privacidad">Aviso de privacidad</Link>
            <CookieSettingsButton className={linkClass} />
          </div>
        </div>

        <div className="flex min-h-[320px] flex-col justify-between rounded-[2rem] border border-line bg-white/[0.03] p-7 shadow-calm sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Ubicación</p>
            <h2 className="mt-5 font-serif text-[clamp(2.4rem,5vw,4.4rem)] leading-[.92] tracking-[-.055em] text-bone">San Ramón Norte.</h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-muted">
              HAUTLAB y su Cabina Dermatocosmética operan dentro de la misma dirección física en Mérida. El mapa se abre únicamente cuando decides consultarlo.
            </p>
          </div>
          <a className="mt-8 inline-flex w-fit items-center gap-2 text-sm text-bone transition hover:text-champagne" href={mapsUrl} target="_blank" rel="noreferrer">
            Abrir en Google Maps <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col gap-4 py-6 text-xs leading-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} HAUTLAB. Todos los derechos reservados.</p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-champagne" />
            Información orientativa. La cabina no sustituye una valoración médica individual.
          </p>
        </div>
      </div>
    </footer>
  );
}
