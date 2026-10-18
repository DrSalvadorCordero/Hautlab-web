# Nimbo clinical notes: implementation and release gate

Status: implemented behind disabled server flags; NOT verified against Nimbo staging or production. No real patient records were modified. Do not merge/deploy/enable writes without the owner's release authorization. Each clinical write additionally requires its own explicit approval.

## Verified documentation

Nimbo's public Postman workspace documents:

- POST `/medical_notes`, encounter note body: `medical_note` containing `person_id`, `consultation_id`, `account_id`, `comment`, `note_type: consultation`, `created_at: null`, `voice_note_url: null`.
  https://www.postman.com/nimbo-x/nimbo-apis-public-documentation/request/qf7smih/medical-note-encounter-note
- GET `/medical_notes?consultation_id=...&page=...&per_page=...`.
  https://www.postman.com/nimbo-x/nimbo-apis-public-documentation/request/r31uza1/medical-note-encounter
- GET `/people/{person_id}` and `/consultations/{consultation_id}` are in the same collection.
  https://www.postman.com/nimbo-x/nimbo-apis-public-documentation/collection/4w1kze8/nimbo-api
- The collection directs integrators to staging and explicitly prohibits real data there.

Public documentation proves that the capability exists, not that the production account has permission. The consulted examples do not establish an idempotency-key guarantee, full response schemas, rich-text normalization, signature/finalization semantics, or a scopes/introspection endpoint. No such guarantees are assumed. Strict adapter checks fail closed if the actual schema differs. `per_page=100` and response envelopes must be validated in staging; unexpected pagination/shape is a release blocker.

## Delivered flow

Private owner-only page: `/admin/notas-clinicas`.
Private same-origin session endpoint: `POST /api/admin/nimbo/notes`.

1. Paste a clinician-authored or ChatGPT-drafted note. This feature does not infer findings, generate diagnoses, or call a model.
2. Supply an existing Nimbo person ID and consultation ID plus full name, date of birth and registered phone. Name-only selection is intentionally unsupported. No patient or encounter is created automatically.
3. Validate identity and encounter/doctor/organization association from Nimbo. No fallback when fields are absent or conflict.
4. Store an AES-256-GCM encrypted draft, with actor/digest authenticated as associated data. Preview the exact text and destination. Approval expires in 15 minutes.
5. The same verified owner approves this specific draft and digest. Non-owner organization administrators cannot sign.
6. Recheck identity and duplicates. Claim the operation atomically in Postgres before the single POST. A unique keyed digest prevents a new operation ID from resending the same content to the same encounter.
7. Read the note back and compare ID, patient, consultation, account, type and exact text. Only a successful readback AND audit persistence yield `verified` with remote ID and verification timestamp.
8. Any failure after claim leaves `uncertain` or `submitting`. No automatic resend. Status checks are read-only.

The database audit is transactional and contains operation ID, actor, state and time, not clinical text. Anonymous/authenticated roles have no grants; service access is server-only. The encrypted draft contains sensitive data and is still subject to the clinic's access/retention policy. The key must be retained securely; changing it also changes keyed deduplication. Do not rotate it without a migration/reconciliation plan.

## Configuration (not configured by this change)

- `NIMBO_NOTES_ENABLED=true`: enables preparation and status endpoint after schema deployment.
- `NIMBO_NOTES_WRITES_ENABLED=true`: separate explicit write gate; leave unset until validation and authorization.
- `NIMBO_NOTES_BASE_URL`: exact allowlisted match to the existing Nimbo connection URL. Prevents a draft moving across account/environment changes.
- `NIMBO_NOTES_ENCRYPTION_KEY`: independently generated 32-byte key encoded as 64 hexadecimal characters; server secret only, never `NEXT_PUBLIC_`.
- Existing Supabase and Nimbo server-side configuration are reused. No tokens are returned to the client.

Apply the included migration only to an isolated test database first. Production schema/configuration has NOT been changed. Vercel automatic deployment is disabled specifically for this PR branch in both repository configurations; production branch settings remain unchanged.

## Release blockers and required validation

1. Provide an authorized Nimbo staging account and synthetic person/consultation in a separate test integration/database. Never replace production global OAuth configuration with staging credentials. Do not place secrets in GitHub, chat or logs.
2. Confirm actual response envelopes and field types for patient, encounter and medical notes; all required relationship fields must be independently verifiable. Adapt tests to sanitized staging fixtures if necessary.
3. Perform one approved synthetic staging write/readback. Check permission-denied, timeout and remote normalization behavior. Confirm Nimbo UI displays it in the intended encounter and determine whether additional clinical signing/finalization is required.
4. Run migration tests against PostgreSQL, access-control tests, owner-session UI checks and race/retry tests. Validate session/CSRF enforcement in a real authenticated test session.
5. Review the PR, CI and dependency audit. Obtain explicit deployment authorization. Configure isolated preview without production OAuth secrets. Production activation is a separate reviewed step.
6. First real patient write requires approval of that exact patient, consultation and note. Verify its remote ID/readback and appearance in Nimbo.

## Recovery and boundaries

- Never reset a `submitting`/`uncertain` operation to draft or delete its digest to bypass duplicate protection. Inspect Nimbo read-only, reconcile against the exact approved content and record an operator-reviewed outcome. A reconciliation UI is not implemented in this PR.
- Expired drafts remain locked by digest. Recover through a reviewed maintenance procedure; never create ad hoc duplicate notes. Automated retention/purge is not enabled.
- Exact-text readback may deliberately reject rich-text normalization; do not relax it without evidence and tests.
- Duplicate checks coordinate writes from this integration. They cannot make unrelated simultaneous writes from the Nimbo UI atomic.
- This is not a ChatGPT connector. Conversational execution still needs an authenticated Action/MCP integration with user identity and a separate per-operation approval step. Existing HAUTLAB session cookies must never be turned into shared API credentials. Until that integration is configured and tested, use the private review page.
- Nimbo's documented API supports writes, so UI automation is not the primary path. If this account is denied API write access, obtain Nimbo's authorization/plan clarification; do not probe undocumented endpoints. An authorized signed-in browser workflow can be evaluated separately, preserving per-note approval.

## Validation commands

`npm run test:nimbo-notes` — synthetic remote and store; never calls Nimbo.
`npm run type-check` — includes the new tests and existing regression suites.
`npm run lint`
`npm run build`

Mocks demonstrate workflow behavior, not Nimbo compatibility or production readiness.

## Local results (2026-10-18)

- 16 synthetic workflow tests passed; TypeScript and existing `type-check` regression suites passed.
- Lint passed with no warnings/errors; Next.js production build and performance budget passed.
- Migration executed in isolated PGlite 0.5.10 (PostgreSQL): anonymous/authenticated denials, service-role access, duplicate constraint, immutable drafts, compare-and-set claim, required remote receipt, transaction audit, and delete restrictions passed. This does not replace staging Supabase verification.
- To reproduce the database test, install `@electric-sql/pglite@0.5.10` in a temporary directory, then set `PGLITE_MODULE_PATH` to its `dist/index.js` and run `node --test scripts/nimbo-notes-db.test.mjs`. No production database is contacted.
- Live inspection was read-only: correct Vercel project identified with READY production deployment; Supabase Nimbo configuration enabled, both token entries present in Vault, RLS enabled, secret RPC execution denied to anon/authenticated. Token values were not retrieved or printed. These observations do not prove current Nimbo API permissions.
