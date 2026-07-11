# HAUTLAB v2 Architecture

## Goal
Build a premium, scalable medical-content platform without changing production until the `v2` branch is reviewed and approved.

## Current public information architecture
- `/` — seven-screen editorial home
- `/procedimientos` — complete library grouped by four public areas
- `/procedimientos/[slug]` — canonical individual procedure or condition pages
- `/tratamientos/[slug]` — area hubs and legacy redirects
- `/pagos` — secure payment options
- `/aviso-de-privacidad` — integral privacy notice
- `/sitemap.xml` — dynamic sitemap
- `/robots.txt` — crawler policy

Public labels avoid overemphasizing professional category boundaries:
1. Diseño facial
2. Piel y textura
3. Condiciones de piel
4. Procedimientos focales

## Stack
- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS
- shadcn-style components
- Framer Motion
- `next/image`
- React Hook Form + Zod
- Vercel
- Typed local content layer, prepared for a future Sanity adapter

## Current content system
The current source of truth is typed TypeScript data. Individual pages share one reusable layout and include:
- definition
- possible indications
- limits and situations in which treatment is not forced
- HAUTLAB approach
- expectations
- orientative investment
- FAQ
- related pages
- contextual WhatsApp CTA
- metadata, canonical URL, Open Graph and JSON-LD

The v2 branch currently contains 18 individual pages. New pages should be added through the same typed model instead of creating isolated templates.

## Editorial and medical rules
- Do not invent credentials, certifications, protocols or outcomes.
- Do not promise guaranteed results.
- Keep prices orientative and subject to assessment when appropriate.
- No public before/after gallery until consent, selection criteria and publication policy are approved.
- Avoid unsupported professional-title claims.
- Present information as educational and subordinate final indication to individual assessment.

## Privacy and analytics
- Optional Meta analytics remains disabled until explicit consent.
- Tracking is limited to general pages and does not activate on condition- or procedure-specific routes.
- Names, messages, diagnoses, clinical photographs and treatment-specific parameters are not sent to the pixel.
- Cookie preferences can be changed from the footer.
- Google Maps opens only after a deliberate user action.

## Accessibility and performance
- Keyboard skip link is included.
- Reduced-motion preferences are respected.
- Navigation, cards and accordions expose visible focus states.
- Images use `next/image` and responsive size hints.
- CI runs dependency installation, TypeScript validation and the Next.js production build on every `v2` change.

## Content governance for the future CMS
Planned states:
- `draft`
- `medical_review`
- `approved`
- `published`
- `archived`

Planned governance fields:
- `status`
- `reviewedBy`
- `reviewedAt`
- `lastUpdated`
- `sources`
- `disclaimer`

## Release rule
Production remains on `main`. Merge `v2` only after:
1. successful CI;
2. exact preview review;
3. medical-content and price approval;
4. deliberate production authorization.
