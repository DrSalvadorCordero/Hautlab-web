# Tickets sugeridos para Codex

## Ticket 001 — Auditar mobile

Objetivo: refinar espaciado, jerarquía visual y CTAs en mobile.

Alcance:
- `app/globals.css`
- componentes visuales si es necesario

No tocar:
- Copy principal
- Posicionamiento
- Tracking

Criterios:
- Legible en iPhone
- Sin secciones pesadas
- CTA visible sin tapar contenido crítico

---

## Ticket 002 — Integrar SEO local

Objetivo: mejorar metadata y estructura semántica para Mérida y CDMX.

Alcance:
- `app/layout.tsx`
- páginas principales

No tocar:
- Diseño general

Criterios:
- Titles y descriptions únicos
- Open Graph correcto
- Sin keyword stuffing

---

## Ticket 003 — Integrar página de campaña

Objetivo: crear una landing específica para un tratamiento.

Alcance:
- crear `app/campanas/[tratamiento]/page.tsx` o página fija
- componentes reutilizables

Criterios:
- CTA WhatsApp con mensaje específico
- Sin claims exagerados
- Lista de criterios de candidatura

---

## Ticket 004 — Verificar tracking

Objetivo: confirmar que Meta Pixel y Google Tag disparan eventos básicos.

Alcance:
- `app/layout.tsx`
- `lib/tracking.ts`
- CTAs relevantes

Criterios:
- PageView
- whatsapp_click
- lead_submit
- Sin claves privadas expuestas
