import "server-only";
import { currentUser, auth } from "@clerk/nextjs/server";
import { getAdminAccess } from "@/lib/admin-access";
import { isClerkConfigured } from "@/lib/auth-config";

export type PrivateCarePhase = { title: string; items: string[] };
export type PrivateCarePatient = {
  id: string; email: string; display_name: string; status: "active" | "suspended";
  clerk_user_id?: string | null;
  consent_at: string | null; consent_version: string | null; created_at: string;
};
export type PrivateCarePlan = {
  id: string; patient_id: string; title: string; summary: string; phases: PrivateCarePhase[];
  status: "draft" | "published" | "archived"; revision: number;
  published_at: string | null; created_at: string;
};
export type PrivateCareAccessRequest = {
  id: string; email: string; clerk_user_id: string; display_name: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string; reviewed_at: string | null; patient_id: string | null;
};
export type PrivateCareReceipt = { item_key: string; read_at: string };
export type PrivateCareFollowup = {
  id: string; patient_id: string; plan_id: string; reported_state: "better" | "same" | "worse";
  message: string; review_status: "new" | "reviewed"; created_at: string;
};

function config() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key) throw new Error("private_care_storage_unavailable");
  return { url, key };
}

export async function careDb<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = config();
  const response = await fetch(url + "/rest/v1/" + path, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      ...(key.startsWith("sb_") ? {} : { Authorization: "Bearer " + key }),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    // Never leak database payloads containing patient data or internal SQL details.
    throw new Error("private_care_storage_error_" + response.status);
  }
  const body = await response.text();
  // PostgREST often returns HTTP 201 with an intentionally empty body for return=minimal.
  return body ? JSON.parse(body) as T : [] as T;
}

export function normalizePatientEmail(value: string) {
  const email = value.trim().toLowerCase();
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email) && email.length <= 254
    ? email : null;
}

export async function requireCareOwner() {
  const access = await getAdminAccess();
  // No implicit permissions for org:member or org:admin: the clinical pilot belongs to the owner only.
  if (!access.configured || !access.userId || !access.isOwner) throw new Error("private_care_forbidden");
  return access.userId;
}

export async function verifiedCareIdentity() {
  if (!isClerkConfigured()) return null;
  const session = await auth();
  if (!session.userId) return null;
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress;
  if (!primaryEmail || primaryEmail.verification?.status !== "verified") return null;
  const email = normalizePatientEmail(primaryEmail.emailAddress);
  if (!email) return null;
  const displayName = (user?.fullName ?? [user?.firstName, user?.lastName].filter(Boolean).join(" ")).trim().slice(0, 120);
  return { clerkId: session.userId, email, displayName };
}

export async function getPrivateCarePatient() {
  const identity = await verifiedCareIdentity();
  if (!identity) return null;
  const records = await careDb<PrivateCarePatient[]>(
    "private_care_patients?email=eq." + encodeURIComponent(identity.email) +
    "&status=eq.active&select=id,email,display_name,status,clerk_user_id,consent_at,consent_version,created_at&limit=1"
  );
  const patient = records[0] ?? null;
  if (!patient || patient.clerk_user_id !== identity.clerkId) return null;
  return { patient, clerkId: identity.clerkId };
}

export async function getCareAccessRequest() {
  const identity = await verifiedCareIdentity();
  if (!identity) return null;
  const records = await careDb<PrivateCareAccessRequest[]>(
    "private_care_access_requests?clerk_user_id=eq." + encodeURIComponent(identity.clerkId) +
    "&email=eq." + encodeURIComponent(identity.email) +
    "&select=id,email,clerk_user_id,display_name,status,requested_at,reviewed_at,patient_id&limit=1"
  );
  return { identity, request: records[0] ?? null };
}

export async function getPublishedCarePlan(patientId: string) {
  const plans = await careDb<PrivateCarePlan[]>(
    "private_care_plans?patient_id=eq." + encodeURIComponent(patientId) +
    "&status=eq.published&select=id,patient_id,title,summary,phases,status,revision,published_at,created_at" +
    "&order=published_at.desc&limit=1"
  );
  return plans[0] ?? null;
}

export async function patientCareSnapshot() {
  const access = await getPrivateCarePatient();
  if (!access) return null;
  if (!access.patient.consent_at) return { ...access, plan: null, receipts: [] as PrivateCareReceipt[], followups: [] as PrivateCareFollowup[] };
  const plan = await getPublishedCarePlan(access.patient.id);
  if (!plan) return { ...access, plan: null, receipts: [] as PrivateCareReceipt[], followups: [] as PrivateCareFollowup[] };
  const [receipts, followups] = await Promise.all([
    careDb<PrivateCareReceipt[]>(
      "private_care_read_receipts?patient_id=eq." + access.patient.id +
      "&plan_id=eq." + plan.id + "&select=item_key,read_at"
    ),
    careDb<PrivateCareFollowup[]>(
      "private_care_followups?patient_id=eq." + access.patient.id +
      "&plan_id=eq." + plan.id +
      "&select=id,patient_id,plan_id,reported_state,message,review_status,created_at&order=created_at.desc&limit=10"
    ),
  ]);
  return { ...access, plan, receipts, followups };
}

export async function ownerCareSnapshot() {
  await requireCareOwner();
  const [patients, plans, followups, requests] = await Promise.all([
    careDb<PrivateCarePatient[]>(
      "private_care_patients?select=id,email,display_name,status,consent_at,consent_version,created_at&order=created_at.desc&limit=100"
    ),
    careDb<PrivateCarePlan[]>(
      "private_care_plans?select=id,patient_id,title,summary,phases,status,revision,published_at,created_at&order=created_at.desc&limit=150"
    ),
    careDb<PrivateCareFollowup[]>(
      "private_care_followups?select=id,patient_id,plan_id,reported_state,message,review_status,created_at&order=created_at.desc&limit=30"
    ),
    careDb<PrivateCareAccessRequest[]>(
      "private_care_access_requests?select=id,email,clerk_user_id,display_name,status,requested_at,reviewed_at,patient_id&order=requested_at.desc&limit=100"
    ),
  ]);
  return { patients, plans, followups, requests };
}

export function validateCarePhases(phases: PrivateCarePhase[]) {
  return phases.length >= 1 && phases.length <= 5 && phases.every(
    (phase) =>
      phase.title.length >= 2 && phase.title.length <= 100 &&
      phase.items.length >= 1 && phase.items.length <= 12 &&
      phase.items.every((item) => item.length >= 3 && item.length <= 500)
  );
}
