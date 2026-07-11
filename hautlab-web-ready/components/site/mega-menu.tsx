"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

const groups = [
  {
    title: "Diseño facial",
    items: [
      ["Rinomodelación", "/tratamientos/rinomodelacion"],
      ["Toxina botulínica", "/tratamientos/toxina-botulinica"],
      ["Labios", "/tratamientos/labios"],
      ["Ojeras", "/tratamientos/ojeras"],
      ["Mentón y mandíbula", "/tratamientos/menton-mandibula"]
    ]
  },
  {
    title: "Piel y textura",
    items: [
      ["Cicatrices", "/tratamientos/cicatrices"],
      ["Microneedling", "/tratamientos/microneedling"],
      ["Radiofrecuencia", "/tratamientos/radiofrecuencia"],
      ["Peelings", "/tratamientos/peelings"],
      ["Manchas y textura", "/tratamientos/manchas-textura"]
    ]
  },
  {
    title: "Condiciones de piel",
    items: [
      ["Acné", "/tratamientos/acne"],
      ["Rosácea", "/tratamientos/rosacea"],
      ["Melasma", "/tratamientos/melasma"],
      ["Dermatitis", "/tratamientos/dermatitis"],
      ["Alopecia", "/tratamientos/alopecia"]
    ]
  },
  {
    title: "Procedimientos focales",
    items: [
      ["Verrugas", "/tratamientos/verrugas"],
      ["Quistes", "/tratamientos/quistes"],
      ["Lunares", "/tratamientos/lunares"],
      ["Dermatoscopia", "/tratamientos/dermatoscopia"],
      ["Procedimientos focales", "/tratamientos/procedimientos-focales"]
    ]
  }
] as const;

export function MegaMenu() {
  return (
    <div className="group relative">
      <button className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-bone" type="button">
        Áreas de atención <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 mt-5 w-[min(900px,calc(100vw-48px))] -translate-x-1/2 translate-y-2 rounded-[2rem] border border-line bg-[#0d0c0b]/98 p-6 opacity-0 shadow-calm backdrop-blur-2xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-champagne">{group.title}</p>
              <div className="grid gap-2">
                {group.items.map(([label, href]) => (
                  <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-white/[0.05] hover:text-bone">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <Link href="/procedimientos" className="text-sm text-bone">
            Ver todas las áreas y procedimientos →
          </Link>
        </div>
      </div>
    </div>
  );
}
