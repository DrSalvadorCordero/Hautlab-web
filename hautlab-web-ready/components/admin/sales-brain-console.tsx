"use client";

import { useEffect, useMemo, useState } from "react";

type Service = {
  serviceKey: "dermatology_consultation" | "upper_face_botulinum_toxin" | "hyaluronic_acid_one_syringe";
  label: string;
  preferredPrice: number;
  installmentPrice: number;
};

type Quote = {
  publicValue: number;
  targetPrice: number;
  lastConcession: number;
  commercialFloor: number;
  discountPercent: number;
  lastDiscountPercent: number;
  contributionAfterDirectCosts: number;
  closeScore: number;
  band: "protect_price" | "controlled_package" | "reduce_friction";
  nextMove: string;
  patientCopy: string;
  internalReason: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);

export function SalesBrainConsole() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({
    hyaluronic_acid_one_syringe: 2,
    upper_face_botulinum_toxin: 1,
  });
  const [leadTemperature, setLeadTemperature] = useState("warm");
  const [objection, setObjection] = useState("none");
  const [history, setHistory] = useState("new");
  const [paymentMode, setPaymentMode] = useState("preferential");
  const [askedDiscount, setAskedDiscount] = useState(false);
  const [prepaid, setPrepaid] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/admin/sales-brain", { cache: "no-store" });
      if (!response.ok) {
        setError("No fue posible cargar el motor de ventas.");
        return;
      }
      const payload = (await response.json()) as { services: Service[] };
      setServices(payload.services ?? []);
    })();
  }, []);

  const items = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, quantity]) => quantity > 0)
        .map(([serviceKey, quantity]) => ({ serviceKey, quantity })),
    [selected],
  );

  useEffect(() => {
    if (!services.length || !items.length) {
      setQuote(null);
      return;
    }
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/admin/sales-brain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            leadTemperature,
            objection,
            history,
            paymentMode,
            askedDiscount,
            prepaid,
          }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("quote_failed");
        const payload = (await response.json()) as { quote: Quote };
        setQuote(payload.quote);
        setError(null);
      } catch (value) {
        if ((value as Error).name !== "AbortError") {
          setError("No fue posible calcular la cotización.");
        }
      }
    })();
    return () => controller.abort();
  }, [services.length, items, leadTemperature, objection, history, paymentMode, askedDiscount, prepaid]);

  function setQuantity(serviceKey: string, quantity: number) {
    setSelected((current) => ({
      ...current,
      [serviceKey]: Math.max(0, Math.min(12, Math.round(quantity || 0))),
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div>
          <h2 className="text-lg font-medium text-bone">Caso</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Selecciona lo que quiere hacerse y describe la fricción comercial real.</p>
        </div>

        <div className="space-y-3">
          {services.map((service) => (
            <label key={service.serviceKey} className="grid grid-cols-[1fr_90px] items-center gap-4 rounded-2xl border border-line bg-black/15 p-4">
              <span>
                <span className="block text-sm text-bone">{service.label}</span>
                <span className="mt-1 block text-xs text-muted">
                  Preferencial {money(service.preferredPrice)}
                  {service.installmentPrice !== service.preferredPrice
                    ? ` · MSI ${money(service.installmentPrice)}`
                    : ""}
                </span>
              </span>
              <input
                aria-label={`Cantidad de ${service.label}`}
                type="number"
                min="0"
                max="12"
                value={selected[service.serviceKey] ?? 0}
                onChange={(event) => setQuantity(service.serviceKey, Number(event.target.value))}
                className="min-h-11 rounded-xl border border-line bg-black/25 px-3 text-bone outline-none focus:border-champagne"
              />
            </label>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-muted">
            Intención
            <select value={leadTemperature} onChange={(e) => setLeadTemperature(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-[#11100e] px-3 text-bone">
              <option value="cold">Fría / cotizando</option>
              <option value="warm">Interés real</option>
              <option value="hot">Quiere hacerlo / agendar</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Objeción
            <select value={objection} onChange={(e) => setObjection(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-[#11100e] px-3 text-bone">
              <option value="none">Ninguna</option>
              <option value="price">Precio</option>
              <option value="trust">Confianza</option>
              <option value="fear">Miedo</option>
              <option value="timing">Tiempo</option>
              <option value="comparison">Comparación</option>
              <option value="uncertainty">Incertidumbre</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Historial
            <select value={history} onChange={(e) => setHistory(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-[#11100e] px-3 text-bone">
              <option value="new">Nuevo</option>
              <option value="repeat">Recurrente</option>
              <option value="high_value">Ticket alto comprobado</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Pago
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-[#11100e] px-3 text-bone">
              <option value="preferential">Modalidad preferencial</option>
              <option value="card">Tarjeta al contado</option>
              <option value="installments">Hasta 6 MSI</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-5 text-sm text-muted">
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={askedDiscount} onChange={(e) => setAskedDiscount(e.target.checked)} />
            Ya pidió descuento
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={prepaid} onChange={(e) => setPrepaid(e.target.checked)} />
            Prepago completo
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-champagne">Decisión comercial</p>
          <h2 className="mt-2 text-xl font-medium text-bone">{quote?.nextMove ?? "Selecciona al menos un procedimiento."}</h2>
          {quote ? <p className="mt-2 text-sm leading-6 text-muted">{quote.internalReason}</p> : null}
        </div>

        {quote ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Valor individual" value={money(quote.publicValue)} />
              <Metric label="Oferta objetivo" value={money(quote.targetPrice)} />
              <Metric label="Última concesión" value={money(quote.lastConcession)} />
              <Metric label="Piso interno" value={money(quote.commercialFloor)} privateValue />
              <Metric label="Descuento objetivo" value={`${quote.discountPercent}%`} />
              <Metric label="Close score" value={`${quote.closeScore}/100`} />
            </div>

            <div className="rounded-2xl border border-champagne/30 bg-champagne/[0.06] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Texto sugerido</p>
              <p className="mt-3 leading-7 text-bone">{quote.patientCopy}</p>
            </div>

            <div className="rounded-2xl border border-line bg-black/15 p-5 text-sm leading-6 text-muted">
              <p><span className="text-bone">Contribución estimada:</span> {money(quote.contributionAfterDirectCosts)}</p>
              <p className="mt-1">Incluye costo directo conservador y reserva de tiempo médico. El piso nunca debe compartirse con el paciente.</p>
            </div>
          </>
        ) : null}

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  privateValue = false,
}: {
  label: string;
  value: string;
  privateValue?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-black/15 p-4">
      <p className="text-xs text-muted">{label}{privateValue ? " · privado" : ""}</p>
      <p className="mt-2 text-xl font-medium text-bone">{value}</p>
    </div>
  );
}
