import assert from "node:assert/strict";
import test from "node:test";
import { canManageRestrictedAdmin } from "../lib/admin-permissions.ts";

test("owner can manage restricted admin surfaces", () => {
  assert.equal(canManageRestrictedAdmin({ isOwner: true, organizationRole: null }), true);
});

test("organization admin can manage restricted admin surfaces", () => {
  assert.equal(canManageRestrictedAdmin({ isOwner: false, organizationRole: "org:admin" }), true);
});

test("organization member cannot read restricted admin core", () => {
  assert.equal(canManageRestrictedAdmin({ isOwner: false, organizationRole: "org:member" }), false);
});

test("unscoped user cannot manage restricted admin surfaces", () => {
  assert.equal(canManageRestrictedAdmin({ isOwner: false, organizationRole: null }), false);
});
