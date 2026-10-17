import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/20261017143000_private_care_existing_patient_claim.sql",
    import.meta.url,
  ),
  "utf8",
);

test("legacy patient claim keeps the invitation and patient rows locked", () => {
  assert.match(
    migration,
    /from public\.private_care_invitations[\s\S]*for update;/,
  );
  assert.match(
    migration,
    /from public\.private_care_patients[\s\S]*where email = p_email[\s\S]*for update;/,
  );
});

test("legacy patient claim binds only an active unbound or same-account row", () => {
  assert.match(migration, /if v_patient_status <> 'active'/);
  assert.match(
    migration,
    /v_existing_clerk_id is not null and v_existing_clerk_id <> p_clerk_user_id/,
  );
  assert.match(
    migration,
    /clerk_user_id is null or clerk_user_id = p_clerk_user_id/,
  );
  assert.match(migration, /raise exception 'patient_binding_changed'/);
});

test("legacy patient claim preserves atomic one-use redemption", () => {
  assert.match(
    migration,
    /where id = v_invite\.id and redeemed_at is null;/,
  );
  assert.match(migration, /raise exception 'invitation_already_used'/);
  assert.match(
    migration,
    /grant execute on function public\.private_care_claim_invitation\(text,text,text\)[\s\S]*to service_role;/,
  );
});
