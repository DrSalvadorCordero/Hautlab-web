# PR #203 — outbound deduplication evidence

Verification date: 2026-10-20 UTC. No production deployment, migration application,
patient data access, patient outbound, Nimbo booking or clinical record writes.

## Inspection and scope

- Remote main verified through GitHub: `871de8d661d0a3d18a058d3e6a012123ce503c76`.
- PR #204 already integrated `wa_claim_auto_reply`; the draft #203 RPC was unused.
- Read-only catalog inspection confirmed the deployed RPC suppresses distinct inbound
  bubbles using prior sent timestamps. Its table/function were missing from git.
- Consolidate on the existing ledger and RPC. Remove the unused draft migration.
  Keep row locking, unique per-conversation/inbound claims, stale-turn rejection,
  service-role access, and sticky operator pause.
- Distinct inbound turns remain eligible, even if their reply text is identical or
  another turn is still sending. Burst coalescing remains before generation.
- Ambiguous transport failures retain reservations and pause for protected operator
  review. No automatic retry; at-most-once attempts cannot guarantee delivery.
- Team response timestamps advance only after a real outbound is stored.
- Issue #99 reviewed: #231/#232 merged; overdue triage/alerts, inbox retry timestamp
  false positives, Nimbo notes and payment E2E remain separate open work.

## Local verification

- Node 24.19.0; TypeScript and all `npm run type-check` regression suites PASS.
- `npm run lint` PASS (Next lint deprecation notice only).
- `npm run build` PASS, including `performance_budget_ok`.
- Production-build local smoke test PASS: 49 canonical URLs, content, headers and 404.
- Eight dedicated dedupe tests PASS: 100 concurrent helper attempts, denied/stale
  claims, RPC errors, timeout, missing Meta ID, confirmation failure, distinct turns.
- Actual migration executed twice in isolated PGlite PostgreSQL with synthetic
  messages; same-turn uniqueness, rapid distinct turns, conversation isolation,
  stale input, manual pause, invalid input and denied anon/authenticated access PASS.
- PGlite uses one connection; this does NOT prove multi-connection row-lock behavior.
  Dedicated CI workflow runs 32 independent psql connections on disposable PG17.

## Deployment gate and limitations

- Git CLI push lacks credentials. Connected GitHub account has admin permission;
  publication uses the authenticated connector with an expected-head lease.
- Multi-connection PostgreSQL CI and clean-install CI must pass before merge.
- Updated migration has NOT been applied to Supabase. Until applied, production
  retains the old burst suppression behavior. Do not treat source tests as live proof.
- After authorized migration/deployment, use synthetic test accounts for Meta/Nimbo
  E2E, verify one reply per inbound, rapid follow-ups, paused takeover, uncertain-send
  operator visibility and sanitized logs. No claim of zero loss in production.
- Worker termination between reservation and transport can leave a reserved unsent
  turn. Protected overdue triage/reconciliation remains necessary; no distributed
  exactly-once transport guarantee is claimed.
