/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    // Clerk proxying is configured explicitly in ClerkProvider/middleware.
    // Keep stale project-level proxy variables from changing runtime behavior.
    NEXT_PUBLIC_CLERK_PROXY_URL: "",
    CLERK_PROXY_URL: ""
  },
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async redirects() {
    return [
      // The production Clerk Frontend API is bound to the apex host.
      // Keep all authenticated pages and the proxy on the *same* host:
      // proxy calls made on www return Clerk's host_invalid error.
      {
        source: "/admin",
        has: [{ type: "host", value: "www.hautlabmx.com" }],
        destination: "https://hautlabmx.com/admin",
        permanent: false
      },
      {
        source: "/admin/:path*",
        has: [{ type: "host", value: "www.hautlabmx.com" }],
        destination: "https://hautlabmx.com/admin/:path*",
        permanent: false
      },
      {
        source: "/private-care",
        has: [{ type: "host", value: "www.hautlabmx.com" }],
        destination: "https://hautlabmx.com/private-care",
        permanent: false
      },
      {
        source: "/private-care/:path*",
        has: [{ type: "host", value: "www.hautlabmx.com" }],
        destination: "https://hautlabmx.com/private-care/:path*",
        permanent: false
      },
      {
        // Public marketing pages remain canonically on www.
        // Authentication, Clerk proxy, and authenticated admin APIs must stay on apex.
        source: "/:path((?!__clerk(?:/|$)|admin(?:/|$)|private-care(?:/|$)|api/admin(?:/|$)).*)",
        has: [{ type: "host", value: "hautlabmx.com" }],
        destination: "https://www.hautlabmx.com/:path",
        permanent: true
      },
      { source: "/favicon.ico", destination: "/icon.svg", permanent: true },
      { source: "/favicon.png", destination: "/icon.svg", permanent: true },
      { source: "/tratamientos", destination: "/procedimientos", permanent: true },
      { source: "/rinomodelacion", destination: "/procedimientos/rinomodelacion", permanent: true },
      { source: "/botox", destination: "/procedimientos/toxina-botulinica", permanent: true },
      { source: "/tratamientos/botox", destination: "/procedimientos/toxina-botulinica", permanent: true },
      { source: "/dermatologia-clinica", destination: "/merida/dermatologia", permanent: true },
      { source: "/tratamientos/cicatrices", destination: "/procedimientos/cicatrices-acne", permanent: true },
      { source: "/tratamientos/peelings", destination: "/procedimientos/peelings-medicos", permanent: true },
      { source: "/tratamientos/menton-mandibula", destination: "/merida/medicina-estetica", permanent: true },
      { source: "/aviso-privacidad", destination: "/aviso-de-privacidad", permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: "/private-care/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
        ]
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }
        ]
      }
    ];
  }
};

export default nextConfig;
