# HAUTLAB v2 Architecture

## Goal
Build a premium, scalable medical-content platform without changing production until the v2 branch is reviewed and approved.

## Public information architecture
- `/` — editorial home
- `/areas` — four public-facing areas
- `/tratamientos/[slug]` — treatment pages
- `/condiciones/[slug]` — skin concern pages
- `/recursos/[slug]` — educational content
- `/pagos` — secure payment options

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
- next/image
- React Hook Form + Zod
- Vercel
- Content layer: typed local content first, Sanity adapter prepared for phase 2

## Content strategy
The initial source of truth is typed TypeScript data validated with Zod. This keeps the build stable and lets the visual/content model be approved before adding CMS infrastructure.

Once the model is approved, the same interface can be backed by Sanity without rewriting page components.

## Editorial rules
- Do not invent credentials, certifications, protocols or outcomes.
- Clinical copy must be marked `medicalReview: pending` until approved.
- No public before/after gallery until consent, selection criteria and publication policy are approved.
- Avoid unsupported professional-title claims.
- Use clear descriptions of services, assessment and treatment planning.

## Content workflow
- `draft`
- `medical_review`
- `approved`
- `published`
- `archived`

Required governance fields:
- `status`
- `reviewedBy`
- `reviewedAt`
- `lastUpdated`
- `sources`
- `disclaimer`

## Phase 1 deliverables
- v2 branch
- architecture document
- design tokens
- typed content model
- CMS-agnostic content repository interface
- six initial page records as draft shells

## Phase 2
- new seven-screen editorial home
- mega menu
- breadcrumbs
- related-content sidebar
- reusable treatment page layout

## Phase 3
Complete and medically review the first six reference pages:
- Rinomodelación
- Toxina botulínica
- Labios
- Acné
- Melasma
- Verrugas

## Release rule
Production remains on `main`. The `v2` branch is merged only after visual review, build verification and content approval.