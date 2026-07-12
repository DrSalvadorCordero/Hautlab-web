import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function NotFound() {
  return (
    <main className="grid min-h-[72svh] place-items-center border-b border-line bg-aurora px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-champagne">404 · Página no encontrada</p>
        <h1 className="mt-6 font-serif text-[clamp(3.2rem,8vw,7rem)] leading-[.88] tracking-[-.07em] text-bone">
          Esta ruta todavía no existe.
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-muted">
          Puede tratarse de una página en desarrollo dentro de la biblioteca HAUTLAB. Regresa a las áreas de atención o solicita orientación directa.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" size="lg">
            <Link href="/procedimientos"><ArrowLeft className="h-4 w-4" /> Ver procedimientos</Link>
          </Button>
          <Button asChild size="lg">
            <a href={buildWhatsAppLink("Hola, necesito orientación para encontrar el tratamiento o la consulta adecuada.")} target="_blank" rel="noreferrer">
              <CalendarDays className="h-4 w-4" /> Agendar valoración
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
