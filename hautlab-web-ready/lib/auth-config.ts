export function isClerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      process.env.CLERK_SECRET_KEY?.trim()
  );
}

export function getOwnerEmails() {
  const configured = process.env.HAUTLAB_OWNER_EMAILS
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return configured?.length ? configured : ["dr.salvadorcordero@gmail.com"];
}
