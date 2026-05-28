import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <strong>{siteConfig.title}</strong>
          <p className="muted" style={{ marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
            Comunicación informativa. La indicación de cualquier procedimiento requiere valoración médica individual.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/tratamientos">Tratamientos</Link>
          <Link href="/contacto">Contacto</Link>
          <a href={buildWhatsAppLink()} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
    </footer>
  );
}
