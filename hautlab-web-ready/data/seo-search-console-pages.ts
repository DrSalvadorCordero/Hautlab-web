import type { PrioritySeoPage } from "@/data/seo-priority-pages";

export const searchConsoleSeoPages: Record<string, PrioritySeoPage> = {
  verrugas: {
    title: "Verrugas en Mérida | Diagnóstico y retiro | HAUTLAB",
    description:
      "Valoración médica de verrugas en Mérida para confirmar el diagnóstico y definir si pueden retirarse en consulta, con técnica según tipo de lesión y localización.",
    pageSummary:
      "Valoración médica de verrugas en Mérida para confirmar que la lesión corresponda a una verruga y elegir tratamiento o retiro según tipo, localización, número y características de la piel.",
    schema: {
      type: "MedicalCondition",
      name: "Verrugas cutáneas",
      alternateName: ["Verrugas", "Verrugas virales"]
    },
    additionalFaq: [
      {
        question: "¿Todas las verrugas se tratan de la misma forma?",
        answer:
          "No. La técnica depende del tipo de lesión, ubicación, número, tamaño, antecedentes y diagnóstico. Antes de retirarla conviene confirmar que realmente se trate de una verruga y no de otra lesión cutánea."
      },
      {
        question: "¿Se puede quitar una verruga en la misma consulta?",
        answer:
          "En algunos casos sí, después de la valoración. En otros conviene estudiar la lesión, preparar la zona o elegir una estrategia distinta según localización y diagnóstico."
      }
    ],
    medicalReview: {
      author: "Dr. Salvador Cordero Romero",
      professionalTitle: "Médico Cirujano",
      practiceArea: "Dermatología Clínica y Estética",
      license: "Cédula Profesional 11804418",
      reviewedAt: "8 de septiembre de 2026",
      sources: [
        {
          label: "American Academy of Dermatology · Warts: diagnosis and treatment",
          href: "https://www.aad.org/public/diseases/a-z/warts-treatment"
        }
      ]
    }
  },
  melasma: {
    title: "Melasma en Mérida | Diagnóstico y tratamiento | HAUTLAB",
    description:
      "Consulta médica para melasma en Mérida. Evaluación de patrón de pigmentación, fototipo, desencadenantes, rutina y tratamientos previos antes de elegir un plan.",
    pageSummary:
      "Consulta médica para melasma en Mérida con evaluación del patrón de pigmentación, fototipo, exposición solar, desencadenantes y tratamientos previos antes de indicar manejo.",
    schema: {
      type: "MedicalCondition",
      name: "Melasma",
      alternateName: ["Melasma facial", "Paño facial"]
    },
    additionalFaq: [
      {
        question: "¿El melasma se puede quitar definitivamente?",
        answer:
          "El melasma suele requerir control continuo porque puede recurrir. El objetivo es reducir pigmento, limitar desencadenantes y mantener resultados con fotoprotección y un plan tolerable para la piel."
      },
      {
        question: "¿El láser siempre mejora el melasma?",
        answer:
          "No. Algunos pacientes pueden beneficiarse de procedimientos seleccionados, pero la energía mal indicada puede irritar o empeorar la pigmentación. La elección depende del fototipo, estabilidad y tratamiento previo."
      }
    ],
    medicalReview: {
      author: "Dr. Salvador Cordero Romero",
      professionalTitle: "Médico Cirujano",
      practiceArea: "Dermatología Clínica y Estética",
      license: "Cédula Profesional 11804418",
      reviewedAt: "10 de agosto de 2026",
      sources: [
        {
          label: "American Academy of Dermatology · Melasma: diagnosis and treatment",
          href: "https://www.aad.org/public/diseases/a-z/melasma-treatment"
        }
      ]
    }
  },
  "armonizacion-facial": {
    title: "Armonización facial en Mérida | Diseño facial | HAUTLAB",
    description:
      "Armonización facial en Mérida: análisis de proporciones, movimiento y soporte antes de indicar toxina, rellenos u otros procedimientos.",
    pageSummary:
      "Armonización facial en Mérida basada en una valoración global del rostro para definir prioridades, evitar tratamientos aislados y elegir solo los procedimientos que tengan una indicación coherente.",
    schema: {
      type: "MedicalProcedure",
      name: "Armonización facial",
      alternateName: ["Diseño facial", "Plan de armonización facial"]
    },
    additionalFaq: [
      {
        question: "¿La armonización facial significa poner relleno en varias zonas?",
        answer:
          "No. Una valoración global puede concluir que conviene tratar una sola zona, trabajar movimiento, calidad de piel o no añadir volumen. El plan depende de anatomía, proporciones, antecedentes y objetivo."
      },
      {
        question: "¿Cómo se decide qué zona tratar primero?",
        answer:
          "Se prioriza el cambio que tenga mayor impacto proporcional con la menor intervención razonable. Nariz, mentón, labios, mandíbula, ojeras y movimiento facial se valoran en relación entre sí, no como procedimientos independientes."
      }
    ]
  },
  "skin-booster": {
    title: "Skin booster en Mérida | Calidad e hidratación de piel | HAUTLAB",
    description:
      "Skin booster en Mérida con valoración previa de hidratación, textura, sensibilidad y objetivo. Información sobre candidatura, sesiones, recuperación y expectativas reales.",
    pageSummary:
      "Skin booster en Mérida orientado a mejorar hidratación y calidad visual de la piel en pacientes seleccionados, sin buscar modificar la estructura o proporciones del rostro.",
    schema: {
      type: "MedicalProcedure",
      name: "Skin booster",
      alternateName: ["Tratamiento inyectable de calidad de piel", "Hidratación inyectable de piel"]
    },
    additionalFaq: [
      {
        question: "¿Un skin booster da volumen al rostro?",
        answer:
          "No es su objetivo principal. Se utiliza para calidad de piel y puede generar inflamación temporal después de la aplicación, pero no sustituye a un relleno cuando se necesita soporte estructural."
      },
      {
        question: "¿Cómo saber si necesito skin booster o bioestimulador?",
        answer:
          "Depende de si el problema predominante es hidratación y textura, pérdida de soporte, flacidez o una combinación. La valoración evita elegir el producto solo por tendencia o nombre comercial."
      }
    ]
  }
};
