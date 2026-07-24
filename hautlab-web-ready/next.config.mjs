/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/icon.svg", permanent: true },
      { source: "/favicon.png", destination: "/icon.svg", permanent: true },
      { source: "/tratamientos", destination: "/procedimientos", permanent: true },
      { source: "/rinomodelacion", destination: "/procedimientos/rinomodelacion", permanent: true },
      { source: "/botox", destination: "/procedimientos/toxina-botulinica", permanent: true },
      { source: "/tratamientos/botox", destination: "/procedimientos/toxina-botulinica", permanent: true },
      { source: "/dermatologia-clinica", destination: "/tratamientos/dermatologia-clinica", permanent: true },
      { source: "/tratamientos/cicatrices", destination: "/procedimientos/cicatrices-acne", permanent: true },
      { source: "/tratamientos/peelings", destination: "/procedimientos/peelings-medicos", permanent: true },
      { source: "/tratamientos/menton-mandibula", destination: "/tratamientos/medicina-estetica-facial", permanent: true },
      { source: "/aviso-privacidad", destination: "/aviso-de-privacidad", permanent: true }
    ];
  },
  async headers() {
    return [
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
