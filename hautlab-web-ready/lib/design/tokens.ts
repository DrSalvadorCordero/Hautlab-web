export const designTokens = {
  color: {
    ink: "#0B0A09",
    carbon: "#151310",
    bone: "#F3EFE8",
    ivory: "#E8E0D5",
    taupe: "#A38F7A",
    champagne: "#C6AF94",
    muted: "#A99F94",
    line: "rgba(243,239,232,0.12)"
  },
  spacing: {
    page: "clamp(1rem, 4vw, 4rem)",
    section: "clamp(5rem, 10vw, 9rem)",
    compactSection: "clamp(3.5rem, 7vw, 6rem)"
  },
  radius: {
    card: "1.75rem",
    panel: "2.25rem",
    pill: "999px"
  },
  typography: {
    display: "clamp(3rem, 7vw, 7.25rem)",
    sectionTitle: "clamp(2.5rem, 5vw, 5rem)",
    bodyLarge: "clamp(1.05rem, 1.5vw, 1.3rem)"
  },
  motion: {
    durationFast: 0.2,
    durationBase: 0.55,
    durationSlow: 0.85,
    easePremium: [0.22, 1, 0.36, 1] as const
  }
} as const;

export type DesignTokens = typeof designTokens;
