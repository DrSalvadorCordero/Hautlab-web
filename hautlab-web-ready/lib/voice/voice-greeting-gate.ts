/** Prevent repeated initial speech when Live repeats lifecycle/ack events. */
export function createVoiceGreetingGate() {
  let greetingSent = false;
  let startSent = false;

  return {
    claimGreeting(): boolean {
      if (greetingSent) return false;
      greetingSent = true;
      return true;
    },
    claimStart(): boolean {
      if (!greetingSent || startSent) return false;
      startSent = true;
      return true;
    },
    reset(): void {
      greetingSent = false;
      startSent = false;
    },
  };
}
