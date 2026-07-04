import Script from 'next/script';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://www.hautlabmx.com'),
  title: 'Dr. Salvador Cordero | HAUTLAB - Dermatología clínica y medicina estética en Mérida',
  description:
    'HAUTLAB es una práctica médica de dermatología clínica y medicina estética en Mérida, enfocada en diagnóstico, proporción facial, estética contenida y tratamientos con criterio médico.',
  keywords: [
    'dermatólogo en Mérida',
    'medicina estética Mérida',
    'armonización facial Mérida',
    'toxina botulínica Mérida',
    'rinomodelación Mérida',
    'acné Mérida',
    'melasma Mérida',
    'HAUTLAB',
    'Dr Salvador Cordero'
  ],
  alternates: {
    canonical: 'https://www.hautlabmx.com/'
  },
  openGraph: {
    title: 'Dr. Salvador Cordero | HAUTLAB',
    description: 'Dermatología clínica y medicina estética en Mérida. Precisión médica. Estética contenida.',
    url: 'https://www.hautlabmx.com/',
    siteName: 'HAUTLAB',
    locale: 'es_MX',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Salvador Cordero | HAUTLAB',
    description: 'Dermatología clínica y medicina estética en Mérida. Precisión médica. Estética contenida.'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: 'HAUTLAB',
    alternateName: 'Dr. Salvador Cordero | HAUTLAB',
    url: 'https://www.hautlabmx.com',
    telephone: '+529992809758',
    priceRange: '$$',
    medicalSpecialty: ['Dermatology', 'Aesthetic Medicine'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle 43 número 299A x 32A, San Ramón Norte',
      addressLocality: 'Mérida',
      addressRegion: 'Yucatán',
      postalCode: '97117',
      addressCountry: 'MX'
    },
    founder: {
      '@type': 'Person',
      name: 'Dr. Salvador Cordero Romero',
      jobTitle: 'Médico'
    },
    sameAs: ['https://www.instagram.com/hautlabmx']
  };

  return (
    <html lang="es-MX">
      <body>
        {children}
        <Script id="hautlab-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-GJ8ZHDB9YM" strategy="afterInteractive" />
        <Script id="hautlab-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GJ8ZHDB9YM');
            document.addEventListener('click', function(event) {
              const link = event.target.closest('[data-event]');
              if (!link || typeof gtag !== 'function') return;
              gtag('event', link.dataset.event, {
                event_category: 'engagement',
                event_label: link.href || link.textContent
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
