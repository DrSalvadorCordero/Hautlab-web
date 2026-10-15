export type RestrictedAdminAccess = {
  allowed: boolean;
  isOwner: boolean;
  organizationRole: string | null;
};

export function canManageRestrictedAdmin(access: RestrictedAdminAccess) {
  return Boolean(
    access.allowed &&
      (access.isOwner || access.organizationRole === "org:admin"),
  );
}
