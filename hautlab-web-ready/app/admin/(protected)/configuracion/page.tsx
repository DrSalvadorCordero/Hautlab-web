const phases = [
  {
    title: "Usuarios internos",
    state: "En implementación",
    detail: "Acceso, organización, invitaciones y roles básicos."
  },
  {
    title: "Agenda y anticipos",
    state: "Siguiente",
    detail: "Selección de servicio, disponibilidad, confirmación y pago."
  },
  {
    title: "Contenido y artículos",
    state: "Pendiente",
    detail: "Borradores supervisados, aprobación médica y publicación programada."
  },
  {
    title: "Galería y casos",
    state: "Pendiente",
    detail: "Casos con consentimiento, clasificación y resultados estandarizados."
  }
];

export default function AdminConfigurationPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">Configuración</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Ruta de finalización</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          El sitio se cerrará por módulos independientes para mantener producción estable y revisar cada cambio antes de publicarlo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {phases.map((phase) => (
          <article key={phase.title} className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-medium">{phase.title}</h2>
              <span className="rounded-full border border-line px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                {phase.state}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">{phase.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <h2 className="text-lg font-medium">Seguridad activa</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted sm:grid-cols-2">
          <li>Rutas internas excluidas de indexación.</li>
          <li>Acceso separado del sitio público.</li>
          <li>Invitaciones individuales, sin compartir credenciales.</li>
          <li>Roles de propietario, administrador y miembro.</li>
        </ul>
      </section>
    </div>
  );
}
