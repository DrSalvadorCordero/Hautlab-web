"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  careDb,
  getPrivateCarePatient,
  getPublishedCarePlan,
  normalizePatientEmail,
  requireCareOwner,
  validateCarePhases,
  type PrivateCarePatient,
  type PrivateCarePhase,
  type PrivateCarePlan,
  type PrivateCareFollowup,
} from "@/lib/server/private-care";

const ownerPath = "/admin/private-care";
const patientPath = "/private-care";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function textValue(data: FormData, key: string, max = 1200) {
  const value = data.get(key);
  return typeof value === "string" ? value.trim().slice(0, max + 1) : "";
}
function validId(value: string) {
  return uuid.test(value) ? value : null;
}
function okOwner() {
  revalidatePath(ownerPath);
  redirect(ownerPath + "?ok=1");
}
function invalidOwner(): never {
  redirect(ownerPath + "?error=validacion");
}

export async function enrollCarePatient(form: FormData) {
  const actor = await requireCareOwner();
  const email = normalizePatientEmail(textValue(form, "email", 254));
  const name = textValue(form, "name", 120);
  if (!email || name.length < 2 || name.length > 120) invalidOwner();
  const existing = await careDb<PrivateCarePatient[]>(
    "private_care_patients?email=eq." + encodeURIComponent(email) + "&select=id&limit=1"
  );
  if (existing.length > 0) redirect(ownerPath + "?error=duplicado");

  await careDb<unknown>("private_care_patients", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      email, display_name: name, status: "active", created_by_clerk_id: actor,
    }),
  });
  okOwner();
}

export async function createCarePlan(form: FormData) {
  const actor = await requireCareOwner();
  const patientId = validId(textValue(form, "patientId", 50));
  const title = textValue(form, "title", 140);
  const summary = textValue(form, "summary", 1200);
  if (!patientId || title.length < 2 || title.length > 140 || summary.length < 4 || summary.length > 1200) invalidOwner();

  const patients = await careDb<PrivateCarePatient[]>(
    "private_care_patients?id=eq." + patientId + "&status=eq.active&select=id&limit=1"
  );
  if (!patients.length) invalidOwner();
  const phases: PrivateCarePhase[] = [];
  for (let n = 1; n <= 4; n += 1) {
    const phaseTitle = textValue(form, "phase" + n + "Title", 100);
    const phaseBody = textValue(form, "phase" + n + "Items", 6400);
    if (!phaseTitle && !phaseBody) continue;
    const items = phaseBody.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    phases.push({ title: phaseTitle, items });
  }
  if (!validateCarePhases(phases)) invalidOwner();

  const previous = await careDb<Array<{ revision: number }>>(
    "private_care_plans?patient_id=eq." + patientId + "&select=revision&order=revision.desc&limit=1"
  );
  await careDb<unknown>("private_care_plans", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      patient_id: patientId, title, summary, phases,
      revision: (previous[0]?.revision ?? 0) + 1,
      status: "draft", created_by_clerk_id: actor,
    }),
  });
  okOwner();
}

export async function publishCarePlan(form: FormData) {
  const actor = await requireCareOwner();
  const planId = validId(textValue(form, "planId", 50));
  if (!planId) invalidOwner();
  const plans = await careDb<PrivateCarePlan[]>(
    "private_care_plans?id=eq." + planId +
    "&status=eq.draft&select=id,patient_id,title,summary,phases,status,revision,published_at,created_at&limit=1"
  );
  const plan = plans[0];
  if (!plan || !validateCarePhases(plan.phases)) invalidOwner();

  // Single DB transaction archives the previous published version and approves the new one.
  await careDb<unknown>("rpc/private_care_publish_plan", {
    method: "POST",
    body: JSON.stringify({ p_plan_id: planId, p_actor: actor }),
  });
  okOwner();
}

export async function archiveCarePlan(form: FormData) {
  const actor = await requireCareOwner();
  const planId = validId(textValue(form, "planId", 50));
  if (!planId) invalidOwner();
  await careDb<unknown>("private_care_plans?id=eq." + planId + "&status=eq.published", {
    method: "PATCH", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ status: "archived", updated_by_clerk_id: actor }),
  });
  okOwner();
}

export async function reviewCareReport(form: FormData) {
  const actor = await requireCareOwner();
  const reportId = validId(textValue(form, "reportId", 50));
  if (!reportId) invalidOwner();
  const recent = await careDb<PrivateCareFollowup[]>(
    "private_care_followups?id=eq." + reportId +
    "&review_status=eq.new&select=id,patient_id,plan_id,reported_state,message,review_status,created_at&limit=1"
  );
  if (!recent.length) invalidOwner();
  await careDb<unknown>(
    "private_care_followups?id=eq." + reportId + "&review_status=eq.new",
    {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        review_status: "reviewed", reviewed_by_clerk_id: actor, reviewed_at: new Date().toISOString(),
      }),
    }
  );
  okOwner();
}


export async function setCarePatientAccess(form: FormData) {
  const actor = await requireCareOwner();
  const patientId = validId(textValue(form, "patientId", 50));
  const status = textValue(form, "status", 20);
  if (!patientId || !["active", "suspended"].includes(status)) invalidOwner();
  await careDb<unknown>("private_care_patients?id=eq." + patientId, {
    method: "PATCH", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ status, updated_by_clerk_id: actor, updated_at: new Date().toISOString() }),
  });
  okOwner();
}

export async function revokeCareConsent() {
  const access = await getPrivateCarePatient();
  if (!access) redirect(patientPath + "?error=acceso");
  await careDb<unknown>("private_care_patients?id=eq." + access.patient.id + "&status=eq.active", {
    method: "PATCH", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      consent_version: null, consent_at: null,
      consent_actor_clerk_id: null, updated_by_clerk_id: access.clerkId,
      updated_at: new Date().toISOString(),
    }),
  });
  revalidatePath(patientPath);
  redirect(patientPath);
}

export async function acceptCareConsent(form: FormData) {
  if (textValue(form, "consent", 8) !== "acepto") redirect(patientPath + "?error=consentimiento");
  const access = await getPrivateCarePatient();
  if (!access) redirect(patientPath + "?error=acceso");
  if (!access.patient.consent_at) {
    await careDb<unknown>(
      "private_care_patients?id=eq." + access.patient.id + "&status=eq.active&consent_at=is.null",
      {
        method: "PATCH", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          consent_version: "care-v1-2026-10",
          consent_at: new Date().toISOString(),
          consent_actor_clerk_id: access.clerkId,
        }),
      }
    );
  }
  revalidatePath(patientPath);
  redirect(patientPath);
}

export async function acknowledgeCareItem(form: FormData) {
  const access = await getPrivateCarePatient();
  if (!access || !access.patient.consent_at) redirect(patientPath + "?error=acceso");
  const plan = await getPublishedCarePlan(access.patient.id);
  const planId = validId(textValue(form, "planId", 50));
  const key = textValue(form, "itemKey", 40);
  const match = /^phase-([0-4])-item-([0-9]{1,2})$/.exec(key);
  if (!plan || plan.id !== planId || !match) redirect(patientPath + "?error=plan");
  const phase = plan.phases[Number(match[1])];
  if (!phase?.items[Number(match[2])]) redirect(patientPath + "?error=plan");

  await careDb<unknown>("private_care_read_receipts?on_conflict=patient_id,plan_id,item_key", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({
      patient_id: access.patient.id, plan_id: plan.id, item_key: key,
      actor_clerk_id: access.clerkId,
    }),
  });
  revalidatePath(patientPath);
}

export async function reportCareEvolution(form: FormData) {
  const access = await getPrivateCarePatient();
  if (!access || !access.patient.consent_at) redirect(patientPath + "?error=acceso");
  const plan = await getPublishedCarePlan(access.patient.id);
  if (!plan) redirect(patientPath + "?error=plan");
  const reportedState = textValue(form, "state", 12);
  const message = textValue(form, "message", 1000);
  if (!["better", "same", "worse"].includes(reportedState) || message.length < 3 || message.length > 1000) {
    redirect(patientPath + "?error=validacion");
  }
  const reports = await careDb<Array<{ created_at: string }>>(
    "private_care_followups?patient_id=eq." + access.patient.id +
    "&plan_id=eq." + plan.id + "&select=created_at&order=created_at.desc&limit=1"
  );
  if (reports.length && Date.now() - new Date(reports[0].created_at).getTime() < 15 * 60_000) {
    redirect(patientPath + "?error=frecuencia");
  }
  await careDb<unknown>("private_care_followups", {
    method: "POST", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      patient_id: access.patient.id, plan_id: plan.id,
      reported_state: reportedState, message,
      actor_clerk_id: access.clerkId,
    }),
  });
  revalidatePath(patientPath);
  redirect(patientPath + "?enviado=1");
}
