import { auth, currentUser } from "@clerk/nextjs/server";
import { getOwnerEmails, isClerkConfigured } from "@/lib/auth-config";

export type AdminAccess = {
  configured: boolean;
  userId: string | null;
  organizationId: string | null;
  organizationRole: string | null;
  email: string | null;
  isOwner: boolean;
  allowed: boolean;
};

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!isClerkConfigured()) {
    return {
      configured: false,
      userId: null,
      organizationId: null,
      organizationRole: null,
      email: null,
      isOwner: false,
      allowed: false
    };
  }

  const session = await auth();
  if (!session.userId) {
    return {
      configured: true,
      userId: null,
      organizationId: null,
      organizationRole: null,
      email: null,
      isOwner: false,
      allowed: false
    };
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;
  const isOwner = Boolean(email && getOwnerEmails().includes(email));
  const hasOrganizationAccess = Boolean(
    session.orgId &&
      session.orgRole &&
      ["org:admin", "org:member"].includes(session.orgRole)
  );

  return {
    configured: true,
    userId: session.userId,
    organizationId: session.orgId ?? null,
    organizationRole: session.orgRole ?? null,
    email,
    isOwner,
    allowed: isOwner || hasOrganizationAccess
  };
}
