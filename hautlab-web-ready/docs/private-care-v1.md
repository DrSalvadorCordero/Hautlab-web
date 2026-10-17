# HAUTLAB Private Care v1 · deployment, roles and clinical boundaries

## What exists

- \`/admin/private-care\`: **owner-only** patient enrollment by verified email, draft creation, explicit clinical approval, versioned publication, suspension, archival and review of reports.
- \`/private-care/iniciar-sesion\`: Clerk account login.
- \`/private-care\`: verified-email-gated and consent-gated patient plan viewer, read acknowledgements (not clinical adherence), non-urgent progress reports, consent withdrawal.
- Five dedicated tables in Supabase, no public/client-side grants, RLS enabled, audit triggers.
- Publication RPC archives the formerly published plan and publishes the new revision **atomically**, avoiding reappearing superseded plans.
- The application denies record access when Clerk/Supabase are not configured. No patient clinical info in Git or build assets.

## Access model

- Owner: only a Clerk session whose **verified primary email** matches \`HAUTLAB_OWNER_EMAILS\`. No implied access for other organization members.
- Patient: Clerk signed-in and verified primary email must match one active record in \`private_care_patients\`. There is no bearer URL, shared code, patient id in a URL, or client-side Supabase service credential.
- Revoking consent blocks clinical data display but does not itself destroy audit records; suspending enrollment blocks access.
- Server-side queries always select the current verified patient's ID and only the latest approved plan.
- The server uses the Supabase secret/service-role credential only server-side. No direct database grants to \`anon\` or \`authenticated\` roles.

## Clinical safety

- The program supplements professional care; it does not replace the primary medical record in Nimbo.
- A clinician must verify, save as draft, then **explicitly publish** a plan. The patient cannot authorize a treatment adjustment or advance phases.
- Read confirmations are **not** doses taken or treatment compliance.
- Reports are not a live medical chat or urgent channel. The patient is warned to seek immediate attention for emergency signs.
- No automatic diagnostic conclusions, medication recommendations, dosing changes or AI-generated prescriptions are issued.

## Privacy/security acceptance

- No patient should be enrolled before reviewing the relevant HAUTLAB privacy notice and its applicability to this digital portal.
- Record access must be tested with two independent verified patient accounts: one must not see the other's record.
- Test clinician account without owner privileges and without Clerk: deny private clinical information.
- Test publish/archive/version replacement and concurrent publication.
- Test consent withdrawal, suspension and report throttling.
- Evaluate retention, access logs, operational backups, data subject access/correction and breach response under applicable Mexican privacy and medical record requirements before scaling beyond the clinical pilot.
- No photos, medical record import or Nimbo synchronization are included.

## Verification commands

Inside \`hautlab-web-ready\`:
\`\`\`bash
npm ci
npm run lint
npm run type-check
npm run build
npm run smoke-test
\`\`\`

Next.js \`/private-care\` responses should send \`Cache-Control: private, no-store\`, \`Referrer-Policy: no-referrer\` and \`X-Robots-Tag: noindex\`.

## Data migration

\`supabase/migrations/20261017070000_private_care_v1.sql\` was applied via the connected Supabase project as an additive migration. Schema contains no user patient records by default.

## Pilot readiness

Infrastructure and code can be deployed without real patients. **Do not describe individual access or clinical delivery as end-to-end validated until the verified patient sign-in and owner publishing path are manually exercised.** Register the first clinical patient and publish a reviewed plan only after that gate.
