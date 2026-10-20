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
  try {
    return await operation();
  } finally {
    await handoff();
  }
}
