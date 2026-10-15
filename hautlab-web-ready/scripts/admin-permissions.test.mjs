import assert from "node:assert/strict";
import test from "node:test";
import {
  canExportRestrictedOperationalData,
  canManageRestrictedAdmin,
} from "../lib/admin-permissions.ts";

test("validated owner can manage restricted admin surfaces", () => {
  assert.equal(canManageRestrictedAdmin({ allowed: true, isOwner: true, organizationRole: null }), true);
});

test("validated organization admin can manage restricted admin surfaces", () => {
  assert.equal(canManageRestrictedAdmin({ allowed: true, isOwner: false, organizationRole: "org:admin" }), true);
});

test("organization member cannot read restricted admin core", () => {
  assert.equal(canManageRestrictedAdmin({ allowed: true, isOwner: false, organizationRole: "org:member" }), false);
});

test("unvalidated session fails closed even if role claims admin", () => {
  assert.equal(canManageRestrictedAdmin({ allowed: false, isOwner: false, organizationRole: "org:admin" }), false);
});

test("unscoped user cannot manage restricted admin surfaces", () => {
  assert.equal(canManageRestrictedAdmin({ allowed: false, isOwner: false, organizationRole: null }), false);
});

test("validated owner can export restricted operational data", () => {
  assert.equal(
    canExportRestrictedOperationalData({
      allowed: true,
      userId: "owner_test",
      isOwner: true,
      organizationRole: null,
    }),
    true,
  );
});

test("validated organization admin can export restricted operational data", () => {
  assert.equal(
    canExportRestrictedOperationalData({
      allowed: true,
      userId: "admin_test",
      isOwner: false,
      organizationRole: "org:admin",
    }),
    true,
  );
});

test("organization member cannot export the operational base", () => {
  assert.equal(
    canExportRestrictedOperationalData({
      allowed: true,
      userId: "member_test",
      isOwner: false,
      organizationRole: "org:member",
    }),
    false,
  );
});

test("export fails closed without a validated session", () => {
  assert.equal(
    canExportRestrictedOperationalData({
      allowed: false,
      userId: null,
      isOwner: false,
      organizationRole: "org:admin",
    }),
    false,
  );
});
