import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-access";
import { exceedsContentLength, isSameOriginRequest } from "@/lib/server/admin-request-security";
import { getNimboConfig } from "@/lib/server/nimbo";
import { approveNote, prepareNote } from "@/lib/server/nimbo-notes-core";
import { noteRemote, noteStore } from "@/lib/server/nimbo-notes";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const id = z.number().int().positive().safe();
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("prepare"), personId: id, consultationId: id,
    fullName: z.string().min(3).max(200), phone: z.string().min(10).max(30),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), comment: z.string().min(1).max(32000) }).strict(),
  z.object({ action: z.literal("approve"), id: z.string().uuid(), digest: z.string().regex(/^[a-f0-9]{64}$/), approved: z.literal(true) }).strict(),
  z.object({ action: z.literal("status"), id: z.string().uuid() }).strict(),
]);
function json(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }); }
export async function POST(request: NextRequest) {
  const access = await getAdminAccess();
  // An organization admin/receptionist is not automatically a clinical-note signer.
  if (!access.allowed || !access.isOwner || !access.userId) return json({ error: "unauthorized" }, 403);
  if (!isSameOriginRequest(request)) return json({ error: "invalid_origin" }, 403);
  if (process.env.NIMBO_NOTES_ENABLED !== "true") return json({ error: "notes_disabled" }, 503);
  if (exceedsContentLength(request, 40000)) return json({ error: "payload_too_large" }, 413);
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > 40000) return json({ error: "payload_too_large" }, 413);
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success) return json({ error: "invalid_payload" }, 400);
    const input = parsed.data;
    if (input.action === "status") {
      const op = await noteStore.get(input.id, access.userId);
      return op ? json({ id: op.id, state: op.state, remoteId: op.remote_id, verifiedAt: op.verified_at }) : json({ error: "not_found" }, 404);
    }
    const secret = process.env.NIMBO_NOTES_ENCRYPTION_KEY ?? "";
    if (input.action === "approve") return json(await approveNote(input, access.userId, secret, noteStore, noteRemote, process.env.NIMBO_NOTES_WRITES_ENABLED === "true"));
    const config = await getNimboConfig();
    if (!config.base_url || !config.doctor_account_id || !config.organization_id) return json({ error: "notes_not_configured" }, 409);
    return json(await prepareNote({ ...input, baseUrl: config.base_url, accountId: config.doctor_account_id,
      organizationId: config.organization_id }, access.userId, secret, noteStore, noteRemote));
  } catch (error) {
    // Never echo upstream response bodies, clinical text, credentials, or database diagnostics.
    const safe = new Set(["notes_writes_disabled", "approval_required", "approval_mismatch", "approval_expired", "reconciliation_required", "operation_claimed_or_expired", "patient_identity_mismatch", "encounter_identity_mismatch", "note_already_exists", "duplicate_operation", "notes_environment_mismatch", "invalid_note", "notes_contract_unverified"]);
    const code = error instanceof Error && safe.has(error.message) ? error.message : "notes_request_failed";
    return json({ error: code }, 409);
  }
}
