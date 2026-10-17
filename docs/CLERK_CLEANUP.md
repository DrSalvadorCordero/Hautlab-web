# Clerk cleanup — HAUTLAB

Ledger for agents. Do not push Clerk/Vercel/web changes to `main`. Use a branch + PR. Hotfix to `main` only with explicit approval from Salvador.

Related: issue #91.

## What was removed (already on `main` as of 5159c0b7)

Another agent deleted this on `main` at 2026-09-07T09:45Z, before this branch existed:

- `hautlab-web-ready/app/api/internal/clerk-direct-repair/route.ts` — temporary debug endpoint. Commit `5159c0b7`.
- Debug / proxy-repair logic inside `hautlab-web-ready/app/admin/iniciar-sesion/[[...sign-in]]/page.tsx`. Commit `918e8f27`.

This branch does **not** re-edit those runtime files. Re-editing them while another agent just touched `main` would collide. The code change is already in production via `hautlabmx.com` deploy `dpl_AboFzfPJCr4VRjjGMzJznbbqweQS` (READY).

## What is kept

Production Clerk wiring only:

- `hautlab-web-ready/middleware.ts` — Clerk runs only on `/admin/*`. Public pages never depend on Clerk.
- `hautlab-web-ready/components/auth/auth-provider.tsx` — `ClerkProvider` when keys exist; pass-through otherwise. No `proxyUrl`.
- `hautlab-web-ready/lib/auth-config.ts` — `isClerkConfigured()` + owner emails.
- `hautlab-web-ready/lib/admin-access.ts` and attendance access.
- Admin shell (`UserButton`, `OrganizationSwitcher`).
- Sign-in page: stock `<SignIn path="/admin/iniciar-sesion" routing="path" />` or a closed-state card if keys are missing.

No `clerk-direct-repair` route remains under `app/api/`.

## How to validate

1. Public site: `https://www.hautlabmx.com/` and `/sitemap.xml` load without Clerk errors.
2. Sign-in: `https://www.hautlabmx.com/admin/iniciar-sesion` shows Clerk widget **or** the "Configuración pendiente" card. It must not call `/api/internal/clerk-direct-repair` (that route must 404).
3. Logged-out `/admin` redirects to `/admin/iniciar-sesion`.
4. Logged-in owner reaches `/admin` and `/admin/facturacion`.
5. Do not rotate `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, or `HAUTLAB_OWNER_EMAILS` in this PR.

## Agent lane

- Grok: Vercel pause of clone projects + this ledger. Branch `grok/clerk-cleanup`.
- ChatGPT/Codex: do not edit Clerk runtime files while this PR is open unless Salvador reassigns the lane here in #91.
