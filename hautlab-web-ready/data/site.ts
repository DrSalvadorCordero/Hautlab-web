import { Activity, BadgeCheck, CircleDollarSign, Microscope, ShieldCheck, Sparkles, Stethoscope, Syringe } from "lucide-react";

export const methodSteps = [
  {
    title: "Diagnóstico primero",
    text: "Piel, anatomía, movimiento, antecedentes y expectativas se evalúan antes de indicar cualquier procedimiento.",
    icon: Stethoscope
  },
  {
    title: "Procedimientos por indicación",
    text: "Se elige qué hacer, qué evitar y en qué secuencia. No todo rostro necesita más volumen.",
    icon: Microscope
  },
  {
    title: "Diseño facial contenido",
    text: "No hago procedimientos. Rediseño rostros. El cambio debe integrarse al rostro, no imponerse sobre él.",
    icon: Sparkles
  },
  {
    title: "Resultados sobrios",
    text: "El objetivo es verse mejor, descansado y proporcionado, sin perder identidad ni parecer intervenido.",
    icon: ShieldCheck
  }
];

export const treatmentFamilies = [
  {
    slug: "medicina-estetica-facial",
    title: "Medicina estética facial",
    icon: Syringe,
    summary: "Toxina botulínica, rinomodelación, rellenos y armonización con enfoque conservador.",
    approach: "Diseño anatómico y proporción facial. Se prioriza naturalidad, soporte y límites seguros.",
    treats: ["Rinomodelación", "Toxina botulínica", "Labios", "Ojeras", "Mentón", "Mandíbula", "Armonización facial"],
    investment: "Desde $3,500 a $15,000+ MXN según zona, producto e indicación.",
    whatsappLabel: "Quiero valoración para medicina estética facial"
  },
  {
    slug: "dermatologia-clinica",
    title: "Dermatología clínica",
    icon: Stethoscope,
    summary: "Acné, rosácea, manchas, dermatitis, alopecia, uñas y piel sensible.",
    approach: "Consulta médica con diagnóstico, rutina terapéutica y seguimiento. Se evita tratar síntomas sin entender la causa.",
    treats: ["Acné", "Rosácea", "Melasma", "Dermatitis", "Alopecia", "Uñas", "Lesiones benignas"],
    investment: "Consulta dermatológica desde $1,300 MXN. Tratamientos según diagnóstico.",
    whatsappLabel: "Quiero consulta dermatológica"
  },
  {
    slug: "calidad-de-piel-y-soporte",
    title: "Calidad de piel y soporte",
    icon: Activity,
    summary: "Bioestimulación, peelings, textura, poros, cicatrices, estrías y tecnología.",
    approach: "Se trabaja barrera, textura, pigmento, colágeno y soporte. A veces el cambio correcto no es volumen.",
    treats: ["Textura", "Poros", "Manchas", "Cicatrices", "Estrías", "Bioestimulación", "Peelings médicos"],
    investment: "Desde $2,500 a $18,000+ MXN según técnica, zona y número de sesiones.",
    whatsappLabel: "Quiero mejorar calidad de piel"
  },
  {
    slug: "dermatologia-procedimental",
    title: "Dermatología procedimental",
    icon: BadgeCheck,
    summary: "Lesiones benignas, verrugas, dermatoscopia y procedimientos focales.",
    approach: "Procedimientos focales con criterio médico, evaluación previa y explicación clara de límites, cuidados y evolución.",
    treats: ["Verrugas", "Lesiones benignas", "Dermatoscopia", "Cauterización", "Procedimientos focales", "Revisión de lunares"],
    investment: "Desde $1,300 MXN valoración. Procedimientos según lesión, número y técnica.",
    whatsappLabel: "Quiero valoración de lesión o procedimiento dermatológico"
  }
];

export const testimonials = [
  {
    name: "Paciente HAUTLAB",
    detail: "Medicina estética facial",
    quote: "Me gustó que primero me explicaran qué sí convenía y qué no. El resultado se ve natural, no exagerado."
  },
  {
    name: "Paciente HAUTLAB",
    detail: "Dermatología clínica",
    quote: "La consulta fue muy ordenada. Salí entendiendo mi piel y con un plan claro, no solo con una lista de productos."
  },
  {
    name: "Paciente HAUTLAB",
    detail: "Calidad de piel",
    quote: "Buscaba verme mejor sin cambiar mi cara. El enfoque fue muy cuidadoso y eso me dio confianza."
  },
  {
    name: "Paciente HAUTLAB",
    detail: "Procedimiento dermatológico",
    quote: "Todo fue claro desde la valoración hasta los cuidados. Se siente una atención privada y muy médica."
  }
];

export const trustBadges = [
  "Valoración médica previa",
  "Pago seguro",
  "Atención privada en Mérida",
  "Resultados contenidos",
  "Procedimientos por indicación"
];

export const paymentOptions = [
  { label: "Stripe", href: "https://buy.stripe.com/fZuaEYcd8fU5dGT7LW9sk0m", icon: CircleDollarSign },
  { label: "Mercado Pago", href: "https://mpago.la/2WjpWKf", icon: CircleDollarSign }
];
