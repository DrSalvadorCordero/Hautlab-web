import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0a09",
        foreground: "#f2eee7",
        bone: "#f2eee7",
        muted: "#b9afa2",
        quiet: "#8e8378",
        line: "rgba(242,238,231,.12)",
        champagne: "#c8b39a",
        taupe: "#8f765e",
        panel: "#151412",
        soft: "#1d1b18"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"]
      },
      boxShadow: {
        calm: "0 32px 100px rgba(0,0,0,.34)",
        hairline: "inset 0 0 0 1px rgba(242,238,231,.10)"
      },
      borderRadius: {
        luxe: "2rem"
      },
      backgroundImage: {
        aurora: "radial-gradient(circle at 80% 12%, rgba(200,179,154,.13), transparent 34%), radial-gradient(circle at 12% 84%, rgba(242,238,231,.055), transparent 28%), linear-gradient(180deg,#0b0a09 0%,#141210 62%,#0b0a09 100%)"
      }
    }
  },
  plugins: []
};

export default config;
