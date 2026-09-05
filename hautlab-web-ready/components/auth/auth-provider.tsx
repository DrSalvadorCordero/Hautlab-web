import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured()) return <>{children}</>;

  return (
    <ClerkProvider
      signInUrl="/admin/iniciar-sesion"
      afterSignOutUrl="/"
      proxyUrl="https://hautlabmx.com/__clerk"
      appearance={{
        variables: {
          colorPrimary: "#c5a46d",
          colorBackground: "#151311",
          colorForeground: "#f5efe6",
          colorMutedForeground: "#aaa198",
          borderRadius: "1rem"
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}
