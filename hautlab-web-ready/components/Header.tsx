import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand-lockup" aria-label="Inicio">
          <span>
            <span className="brand-kicker">DR. SALVADOR CORDERO | HAUTLAB</span>
            <span className="brand-title">Precisión médica. Estética contenida.</span>
            <span className="brand-subtitle">Dermatología clínica · Medicina estética</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Navegación principal">
          <Link href="/#tratamientos">Procedimientos</Link>
          <Link href="/#metodo">Método</Link>
          <Link href="/#consulta">Valoración</Link>
          <a className="nav-cta" href={buildWhatsAppLink()}>WhatsApp</a>
        </nav>
      </div>
    </header>
  );
}
