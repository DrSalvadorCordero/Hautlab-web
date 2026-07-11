# HAUTLAB v2 — Release checklist

## Gate 1 · Before merge

- [ ] The exact current `v2` commit has a Vercel preview in `READY` state.
- [ ] GitHub Actions passes dependency installation, TypeScript and `next build`.
- [ ] The pull request is mergeable and `v2` is not behind `main`.
- [ ] Medical copy, prices and public professional wording have been reviewed.
- [ ] Home, four area pages, procedure library and at least one page per area are reviewed on mobile and desktop.
- [ ] Cookie consent is tested in a clean/private browser session.
- [ ] Rejecting analytics does not load Meta Pixel or create `_fbp` / `_fbc` cookies.
- [ ] Accepting analytics tracks only general pages allowed by the consent implementation.
- [ ] Stripe, Mercado Pago, WhatsApp, Instagram and Google Maps links open correctly.
- [ ] `/sitemap.xml`, `/robots.txt`, `/aviso-de-privacidad` and the custom 404 respond correctly.
- [ ] Legacy URLs redirect to their intended canonical routes.

## Gate 2 · Merge and production deployment

1. Record the current production commit SHA from `main` as the rollback point.
2. Merge PR #2 into `main` using the repository's normal merge method.
3. Confirm Vercel starts a production deployment from the resulting `main` commit.
4. Do not change DNS or project aliases during the deployment.
5. Wait for production state `READY` before testing the public domain.

## Gate 3 · Production smoke test

Test on `https://www.hautlabmx.com`:

- [ ] `/`
- [ ] `/procedimientos`
- [ ] `/procedimientos/rinomodelacion`
- [ ] `/procedimientos/acne`
- [ ] `/procedimientos/lunares`
- [ ] `/tratamientos/medicina-estetica-facial`
- [ ] `/tratamientos/dermatologia-clinica`
- [ ] `/pagos`
- [ ] `/aviso-de-privacidad`
- [ ] `/sitemap.xml`
- [ ] `/robots.txt`
- [ ] a non-existent URL for the custom 404

Also verify:

- [ ] header and mobile navigation
- [ ] WhatsApp CTA messages
- [ ] payment links
- [ ] cookie preferences reopened from the footer
- [ ] no visible runtime error or broken image
- [ ] canonical URL and social metadata on Home and one procedure page
- [ ] redirects: `/rinomodelacion`, `/botox`, `/dermatologia-clinica`

## Rollback

Rollback is required if production shows a blocking navigation error, repeated 5xx responses, broken payments, missing core pages or a privacy/analytics regression.

Preferred rollback order:

1. Use Vercel's rollback/promote mechanism to restore the last known-good production deployment.
2. If repository state must also be restored, revert the merge commit on `main` rather than force-pushing history.
3. Confirm the restored deployment is `READY` and rerun the production smoke test.
4. Keep `v2` or a repair branch available for correction; do not patch production blindly without CI.

## Post-release

- [ ] Submit or refresh the sitemap in Google Search Console.
- [ ] Monitor Vercel runtime errors and 4xx/5xx responses during the first 24 hours.
- [ ] Verify Search Console can read canonical URLs and structured data.
- [ ] Confirm Meta analytics receives only consented general-page events.
- [ ] Record launch commit, production deployment ID and rollback deployment ID in the PR.
