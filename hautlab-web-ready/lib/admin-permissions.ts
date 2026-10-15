export type RestrictedAdminAccess = {
  allowed: boolean;
  isOwner: boolean;
  organizationRole: string | null;
};

export type RestrictedExportAccess = RestrictedAdminAccess & {
  userId: string | null;
};

export function canManageRestrictedAdmin(access: RestrictedAdminAccess) {
  return Boolean(
    access.allowed &&
      (access.isOwner || access.organizationRole === "org:admin"),
  );
}

export function canExportRestrictedOperationalData(access: RestrictedExportAccess) {
  return Boolean(access.userId && canManageRestrictedAdmin(access));
}
