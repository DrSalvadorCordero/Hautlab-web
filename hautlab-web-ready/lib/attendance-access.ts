import { currentUser } from "@clerk/nextjs/server";
import { getAdminAccess, type AdminAccess } from "@/lib/admin-access";

export type AttendanceAccess = AdminAccess & {
  displayName: string;
  canManage: boolean;
  canPunch: boolean;
};

export async function getAttendanceAccess(): Promise<AttendanceAccess> {
  const access = await getAdminAccess();
  const user = access.userId ? await currentUser() : null;
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    access.email ||
    "Usuario HAUTLAB";
  const canManage = Boolean(access.isOwner || access.organizationRole === "org:admin");

  return {
    ...access,
    displayName,
    canManage,
    canPunch: Boolean(access.allowed && access.userId && access.email)
  };
}
