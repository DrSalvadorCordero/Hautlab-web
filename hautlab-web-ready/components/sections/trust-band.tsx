import { trustBadges } from "@/data/site";

export function TrustBand() {
  return (
    <section className="border-b border-line bg-bone py-5 text-background">
      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] gap-3 overflow-x-auto text-xs font-medium uppercase tracking-[0.16em]">
        {trustBadges.map((badge) => (
          <span key={badge} className="whitespace-nowrap rounded-full border border-background/10 px-4 py-2">
            {badge}
          </span>
        ))}
      </div>
    </section>
  );
}
