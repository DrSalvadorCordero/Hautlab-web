import Link from "next/link";
import { Clock, ExternalLink, Instagram, MapPin, ShieldCheck } from "lucide-react";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const mapsUrl = "https://maps.app.goo.gl/8CoPkGjpuYDi8QqE6?g_st=ic";

export function FooterEn() {
  const year = new Date().getFullYear();
  const linkClass = "rounded-full border border-line px-4 py-2 text-sm transition hover:border-bone/30 hover:text-bone";
  const bookingMessage =
    "Hello, I would like information about a private evaluation at HAUTLAB in Mérida. I am contacting you through the English website.";

  return (
    <footer className="border-t border-line bg-[#070706] text-muted" id="contact">
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 py-12 lg:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-bone">
              HAUTLAB | Clinical Dermatology, Medical Aesthetics and Dermatocosmetic Care
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7">
              Medical precision, restrained aesthetics and individualized planning in Mérida. Every medical procedure begins with an in-person evaluation and a clear indication.
            </p>
            <div className="mt-5 space-y-1 text-xs leading-5 text-quiet">
              <p className="text-bone">Dr. Salvador Cordero</p>
              <p>Medical Doctor · Clinical and Aesthetic Dermatology Practice</p>
              <p>Mexican Professional License 11804418</p>
              <p className="pt-2">Dermatocosmetic Studio coordinated by Karen Cruz within HAUTLAB.</p>
              <p>Appointments only.</p>
            </div>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-3xl border border-line bg-white/[0.03] p-5">
              <MapPin className="mb-4 h-5 w-5 text-champagne" />
              <p className="text-bone">Address</p>
              <p className="mt-2 leading-6">{siteConfig.address}</p>
            </div>
            <div className="rounded-3xl border border-line bg-white/[0.03] p-5">
              <Clock className="mb-4 h-5 w-5 text-champagne" />
              <p className="text-bone">Appointments</p>
              <p className="mt-2 leading-6">Private care by appointment. Availability is confirmed directly before travel.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a className={`${linkClass} text-bone`} href={buildWhatsAppLink(bookingMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_en_footer">
              WhatsApp {siteConfig.whatsappDisplay}
            </a>
            <Link className={linkClass} href="/cabina">Dermatocosmetic Studio</Link>
            <Link className={linkClass} href="/en#research">Published research</Link>
            <a className={linkClass} href={siteConfig.instagram} target="_blank" rel="noreferrer">
              <Instagram className="mr-2 inline h-4 w-4" /> {siteConfig.instagramHandle}
            </a>
            <Link className={linkClass} href="/pagos">Secure payments</Link>
            <Link className={linkClass} href="/aviso-de-privacidad">Privacy notice</Link>
            <CookieSettingsButton label="Cookie preferences" className={linkClass} />
          </div>
        </div>

        <div className="flex min-h-[320px] flex-col justify-between rounded-[2rem] border border-line bg-white/[0.03] p-7 shadow-calm sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Mérida, Yucatán</p>
            <h2 className="mt-5 font-serif text-[clamp(2.4rem,5vw,4.4rem)] leading-[.92] tracking-[-.055em] text-bone">
              Private care in San Ramón Norte.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-muted">
              HAUTLAB and its Dermatocosmetic Studio operate at the same address. The map opens only when you choose to view it.
            </p>
          </div>
          <a className="mt-8 inline-flex w-fit items-center gap-2 text-sm text-bone transition hover:text-champagne" href={mapsUrl} target="_blank" rel="noreferrer">
            Open in Google Maps <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col gap-4 py-6 text-xs leading-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} HAUTLAB. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-champagne" />
            General information only. It does not replace an individual medical evaluation.
          </p>
        </div>
      </div>
    </footer>
  );
}
