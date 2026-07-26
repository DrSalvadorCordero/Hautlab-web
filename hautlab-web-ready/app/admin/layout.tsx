import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: "Panel interno | HAUTLAB",
  description: "Área privada de operación de HAUTLAB.",
  robots: { index: false, follow: false, nocache: true }
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
