// At-most-once transport attempt per persisted inbound reservation.
// An uncertain transport result must retain its reservation and enter human review.
export async function sendClaimedReply(deps: {
 claim: () => Promise<string | null>;
 send: () => Promise<string | null>;
 confirm: (claimId: string, messageId: string) => Promise<void>;
 review: () => Promise<void>;
 confirmationFailed: () => void;
}): Promise<string | null> {
 let claimId: string | null;
 let messageId: string | null;
 try {
  claimId = await deps.claim();
  if (!claimId) return null;
  messageId = await deps.send();
  if (!messageId) throw new Error("whatsapp_meta_send_unverified");
 } catch (error) {
  try {
   await deps.review();
  } catch (reviewError) {
   // Retain both causes: transport may have succeeded despite its timeout.
   throw new AggregateError(
    [error, reviewError],
    "whatsapp_claim_or_send_failed_and_review_failed",
   );
  }
  throw error;
 }
 try { await deps.confirm(claimId, messageId); }
 catch { deps.confirmationFailed(); }
 return messageId;
}
