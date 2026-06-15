import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand-lockup" aria-label="Inicio">
          <span className="brand-mark">SC</span>
          <span>
            <span className="brand-kicker">HAUTLAB</span>
            <span className="brand-title">Dr. Salvador Cordero</span>
            <span className="brand-subtitle">Dermatología clínica · Medicina estética avanzada</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Navegación principal">
          <Link href="/#metodo">Método</Link>
          <Link href="/#tratamientos">Tratamientos</Link>
          <Link href="/#consulta">Consulta</Link>
          <Link href="/contacto">Contacto</Link>
          <a className="nav-cta" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
            Agendar
          </a>
        </nav>
      </div>
    </header>
  );
}
