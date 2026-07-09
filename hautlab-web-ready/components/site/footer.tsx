import Link from "next/link";
import { Clock, Instagram, MapPin, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const encodedMap = encodeURIComponent(siteConfig.mapQuery);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-[#070706] text-muted" id="contacto">
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 py-12 lg:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-bone">HAUTLAB + Dr. Salvador Cordero</p>
            <p className="mt-4 max-w-xl text-sm leading-7">
              {siteConfig.tagline} Dermatología clínica y medicina estética con diagnóstico primero, procedimientos por indicación y resultados sobrios.
            </p>
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
              <p className="mt-2 leading-6">{siteConfig.hours}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a className="rounded-full border border-line px-4 py-2 text-sm text-bone transition hover:border-bone/30" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
              WhatsApp {siteConfig.whatsappDisplay}
            </a>
            <a className="rounded-full border border-line px-4 py-2 text-sm transition hover:text-bone" href={siteConfig.instagram} target="_blank" rel="noreferrer">
              <Instagram className="mr-2 inline h-4 w-4" /> {siteConfig.instagramHandle}
            </a>
            <Link className="rounded-full border border-line px-4 py-2 text-sm transition hover:text-bone" href="/pagos">
              Pagos seguros
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-line bg-white/[0.03] shadow-calm">
          <iframe
            title="Mapa HAUTLAB San Ramón Norte Mérida"
            src={`https://www.google.com/maps?q=${encodedMap}&output=embed`}
            className="h-[320px] w-full border-0 grayscale"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col gap-4 py-6 text-xs leading-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} HAUTLAB. Todos los derechos reservados.</p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-champagne" />
            Uso informativo · La valoración médica no sustituye una consulta presencial · Aviso de privacidad disponible a solicitud.
          </p>
        </div>
      </div>
    </footer>
  );
}
