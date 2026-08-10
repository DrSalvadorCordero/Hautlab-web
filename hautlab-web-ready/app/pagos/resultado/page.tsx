import type { Metadata } from "next";
import { PaymentResult } from "@/components/payments/payment-result";

export const metadata: Metadata = {
  title: "Estado de pago | HAUTLAB",
  description: "Consulta segura del estado de un pago de valoración HAUTLAB.",
  robots: { index: false, follow: false }
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentResultPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const reference = first(params.reference) ?? null;
  const paymentId = first(params.payment_id) ?? first(params.collection_id) ?? null;

  return (
    <main className="border-b border-line bg-aurora py-20 lg:py-28">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <PaymentResult reference={reference} paymentId={paymentId} />
      </div>
    </main>
  );
}
