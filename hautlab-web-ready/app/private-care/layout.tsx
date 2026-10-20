import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Private Care · HAUTLAB",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function PatientCareLayout({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured()) return <>{children}</>;
  return (
    <ClerkProvider
      signInUrl="/private-care/iniciar-sesion"
      afterSignOutUrl="/"
      proxyUrl="https://hautlabmx.com/__clerk"
      appearance={{
        variables: {
          colorPrimary: "#c5a46d", colorBackground: "#151311",
          colorForeground: "#f5efe6", colorMutedForeground: "#aaa198",
          borderRadius: "1rem"
        }
      }}
    >{children}</ClerkProvider>
  );
}
