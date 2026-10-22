// Keep delivery bookkeeping from blocking safety-critical human escalation.
export async function persistSentReply(deps: {
  metaMessageId: string | null;
  save: () => Promise<unknown>;
  markAnswered: () => Promise<unknown>;
  onTimestampError: () => void;
}): Promise<boolean> {
  if (!deps.metaMessageId) return false;
  // A missing outbound record is not success: callers must still see this failure.
  await deps.save();
  try {
    await deps.markAnswered();
  } catch {
    // The reply was persisted. Timestamp maintenance must never abort handoff.
    deps.onTimestampError();
  }
  return true;
}

// Attempt the human handoff even when automatic transport/persistence fails.
export async function withRequiredHandoff<T>(
  operation: () => Promise<T>,
  handoff: () => Promise<void>,
): Promise<T> {
  let result: T;
  try {
    result = await operation();
  } catch (operationError) {
    try {
      await handoff();
    } catch (handoffError) {
      // Preserve the initial Meta/persistence failure and the failed escalation.
      throw new AggregateError(
        [operationError, handoffError],
        "whatsapp_operation_and_handoff_failed",
      );
    }
    throw operationError;
  }
  // A successful automatic reply does not make a mandatory handoff optional.
  await handoff();
  return result;
}


// Attempt both Nimbo review persistence and escalation. Neither failure may hide
// the other: operators need to distinguish failed state writes from failed alerts.
export async function persistReviewAndEscalate(
  persistReview: () => Promise<unknown>,
  escalate: () => Promise<unknown>,
): Promise<void> {
  let reviewError: unknown;
  let escalationError: unknown;
  try {
    await persistReview();
  } catch (error) {
    reviewError = error;
  }
  try {
    await escalate();
  } catch (error) {
    escalationError = error;
  }
  if (reviewError !== undefined && escalationError !== undefined) {
    throw new AggregateError(
      [reviewError, escalationError],
      "nimbo_review_and_escalation_failed",
    );
  }
  if (reviewError !== undefined) throw reviewError;
  if (escalationError !== undefined) throw escalationError;
}
