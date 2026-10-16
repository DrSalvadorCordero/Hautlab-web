const protectedBranches = new Set(["main", "master"]);

export function safeContentPublishingBranch(value: string | null | undefined) {
  const branch = value?.trim().replace(/^refs\/heads\//, "");
  if (!branch || protectedBranches.has(branch.toLowerCase())) return null;
  return branch;
}
