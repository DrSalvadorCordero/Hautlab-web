export type RestrictedAdminAccess = {
  isOwner: boolean;
  organizationRole: string | null;
};

export function canManageRestrictedAdmin(access: RestrictedAdminAccess) {
  return Boolean(access.isOwner || access.organizationRole === "org:admin");
}
