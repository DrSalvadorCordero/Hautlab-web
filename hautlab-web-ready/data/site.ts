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
    title: "Diseño facial",
    icon: Syringe,
    summary: "Rinomodelación, toxina botulínica, labios, ojeras y soporte facial con enfoque conservador.",
    approach: "Lectura anatómica y proporción facial. Se priorizan naturalidad, soporte, movimiento y límites seguros.",
    treats: ["Rinomodelación", "Toxina botulínica", "Labios", "Ojeras", "Mentón", "Mandíbula", "Armonización facial"],
    investment: "Desde $3,500 MXN según zona, producto e indicación.",
    whatsappLabel: "Quiero valoración para diseño facial"
  },
  {
    slug: "calidad-de-piel-y-soporte",
    title: "Piel y textura",
    icon: Activity,
    summary: "Textura, poros, cicatrices, estrías, pigmento, bioestimulación y procedimientos de soporte.",
    approach: "Se trabaja barrera, textura, pigmento, colágeno y soporte. A veces el cambio correcto no es añadir volumen.",
    treats: ["Textura", "Poros", "Manchas", "Cicatrices", "Estrías", "Bioestimulación", "Peelings"],
    investment: "La inversión depende de técnica, extensión y número de sesiones.",
    whatsappLabel: "Quiero valoración para piel y textura"
  },
  {
    slug: "dermatologia-clinica",
    title: "Condiciones de piel",
    icon: Stethoscope,
    summary: "Acné, rosácea, melasma, dermatitis, caída de cabello, uñas y piel sensible.",
    approach: "Consulta médica con diagnóstico, rutina terapéutica y seguimiento. Se evita tratar síntomas sin entender el patrón completo.",
    treats: ["Acné", "Rosácea", "Melasma", "Dermatitis", "Alopecia", "Uñas", "Piel sensible"],
    investment: "Valoración médica desde $1,300 MXN. Tratamiento según diagnóstico.",
    whatsappLabel: "Quiero una valoración médica de piel"
  },
  {
    slug: "dermatologia-procedimental",
    title: "Procedimientos focales",
    icon: BadgeCheck,
    summary: "Verrugas, lunares, quistes, dermatoscopia y procedimientos dirigidos a lesiones específicas.",
    approach: "Evaluación previa y selección de técnica según diagnóstico, localización, seguridad y resultado esperado.",
    treats: ["Verrugas", "Lunares", "Quistes", "Dermatoscopia", "Cauterización", "Biopsias", "Lesiones benignas"],
    investment: "Valoración desde $1,300 MXN. Procedimientos según lesión, número y técnica.",
    whatsappLabel: "Quiero valoración de una lesión o procedimiento focal"
  }
];

export const testimonials = [
  {
    name: "L. M.",
    detail: "Encuesta verificada",
    quote: "Maravilloso tratamiento. El profesionalismo del Dr. Salvador es altamente recomendable. Genera confianza en su trato y explicación."
  },
  {
    name: "C. C.",
    detail: "Diseño facial",
    quote: "Es el mejor. Atento, amable, con mucha dedicación y experiencia. Me encanta su trabajo."
  },
  {
    name: "C. C.",
    detail: "Encuesta verificada",
    quote: "Excelente atención, súper cuidadoso. Muy profesional y amable."
  },
  {
    name: "I. C.",
    detail: "Procedimiento estético",
    quote: "Me gustó mucho su trabajo. Explica muy claramente cada procedimiento. Muy satisfecha."
  },
  {
    name: "S. C.",
    detail: "Consulta de piel",
    quote: "Excelente consulta, súper completa y explicada a la perfección."
  },
  {
    name: "F. G.",
    detail: "Atención y seguimiento",
    quote: "Atento en todo momento, brinda indicaciones específicas y responde todas tus dudas. Excelente servicio."
  },
  {
    name: "T. S.",
    detail: "Patient survey",
    quote: "Dr. Salvador listened to what I wanted instead of telling me what he thought I should get. I appreciated that."
  },
  {
    name: "J. R.",
    detail: "Resultados",
    quote: "El mejor de todos, encantada con mis resultados. Definitivamente la mejor opción."
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
