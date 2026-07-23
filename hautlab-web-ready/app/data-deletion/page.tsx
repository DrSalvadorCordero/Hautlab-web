import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";

const pageUrl = `${siteConfig.url}/data-deletion`;

export const metadata: Metadata = {
  title: "Data Deletion Instructions | HAUTLAB",
  description:
    "Instructions for requesting deletion of personal data associated with HAUTLAB digital services.",
  alternates: { canonical: pageUrl },
  robots: { index: false, follow: true, nocache: true },
  openGraph: {
    title: "Data Deletion Instructions | HAUTLAB",
    description: "How to request deletion of data associated with HAUTLAB digital services.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "en_US",
    type: "website"
  }
};

export default function DataDeletionPage() {
  const emailHref = `mailto:${siteConfig.privacyEmail}?subject=${encodeURIComponent(
    "Solicitud de eliminación de datos / Data deletion request"
  )}`;

  return (
    <main className="border-b border-line bg-background py-16 lg:py-24">
      <div className="mx-auto w-[min(900px,calc(100%-32px))]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-bone"
        >
          <ArrowLeft className="h-4 w-4" /> Return to HAUTLAB
        </Link>

        <div className="mt-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne">Privacy request</p>
          <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,5.8rem)] leading-[.92] tracking-[-.06em] text-bone">
            Data deletion instructions
          </h1>
          <p className="mt-7 text-base leading-8 text-muted">
            This page explains how to request deletion of personal data associated with HAUTLAB,
            including information provided through services connected to Facebook, Instagram or
            WhatsApp.
          </p>
        </div>

        <div className="mt-12 grid gap-5">
          <Card className="p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">How to submit a request</p>
            <ol className="mt-6 grid gap-4 text-sm leading-7 text-muted">
              <li>1. Send an email from the address associated with your request.</li>
              <li>
                2. Use the subject line <span className="text-bone">“Data deletion request”</span>.
              </li>
              <li>
                3. State which HAUTLAB digital service you used and provide only the minimum
                information needed to locate the record.
              </li>
              <li>
                4. Do not include medical photographs, diagnoses, identification documents or
                additional health information in the first email.
              </li>
            </ol>

            <a
              href={emailHref}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-champagne px-6 text-sm font-medium text-background transition hover:bg-bone"
            >
              <Mail className="h-4 w-4" /> Email {siteConfig.privacyEmail}
            </a>
          </Card>

          <Card className="p-7">
            <ShieldCheck className="h-6 w-6 text-champagne" />
            <h2 className="mt-6 text-2xl font-medium tracking-[-0.04em] text-bone">
              Verification and completion
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
              <p>
                HAUTLAB may request limited information to verify identity and prevent unauthorized
                deletion. Once verified, eligible records will be deleted or de-identified, and the
                requester will receive confirmation.
              </p>
              <p>
                Certain clinical, billing or legal records may need to be retained for the period
                required by applicable Mexican law. When deletion is not legally available, access
                will remain restricted and the reason will be explained.
              </p>
              <p>
                Requests are reviewed without using this page to provide medical advice or handle
                urgent clinical concerns.
              </p>
            </div>
          </Card>
        </div>

        <p className="mt-8 text-xs leading-6 text-quiet">
          For additional information, consult the{" "}
          <Link
            href="/aviso-de-privacidad"
            className="text-bone underline decoration-line underline-offset-4"
          >
            HAUTLAB Privacy Notice
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
