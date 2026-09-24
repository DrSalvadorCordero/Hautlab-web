import type { TreatmentPageContent } from "@/components/treatments/treatment-page-layout";

type ClinicalDetails = NonNullable<TreatmentPageContent["clinicalDetails"]>;
type MedicalReview = NonNullable<TreatmentPageContent["medicalReview"]>;

export type PrioritySeoPage = {
  title: string;
  description: string;
  pageSummary: string;
  schema: {
    type: "MedicalProcedure" | "MedicalCondition";
    name: string;
    alternateName?: string[];
    offerPrice?: string;
  };
  additionalFaq: TreatmentPageContent["faq"];
  clinicalDetails?: ClinicalDetails;
  medicalReview?: MedicalReview;
};

export const prioritySeoPages: Record<string, PrioritySeoPage> = {
  rinomodelacion: {
    title: "Rinomodelación en Mérida | Precio y valoración | HAUTLAB",
    description:
      "Valoración anatómica para rinomodelación con ácido hialurónico en Mérida. Conoce candidatura, límites, riesgos, recuperación y precio de referencia.",
    pageSummary:
      "Valoración anatómica y rinomodelación con ácido hialurónico en Mérida para casos seleccionados, con enfoque conservador, explicación de límites y seguimiento.",
    schema: {
      type: "MedicalProcedure",
      name: "Rinomodelación con ácido hialurónico",
      alternateName: ["Relleno nasal no quirúrgico", "Corrección nasal con ácido hialurónico"],
      offerPrice: "5500"
    },
    additionalFaq: [
      {
        question: "¿Cuánto cuesta una rinomodelación en Mérida?",
        answer:
          "En HAUTLAB la inversión de referencia es de $5,500 MXN e incluye valoración, aplicación, revisión y retoque cuando existe indicación clínica. La candidatura y la cantidad de producto se confirman antes del procedimiento."
      },
      {
        question: "¿Quién no es candidato a una rinomodelación?",
        answer:
          "No se recomienda cuando la anatomía aumenta el riesgo, existe antecedente complejo de cirugía o rellenos, el objetivo requiere reducción estructural o las expectativas no pueden alcanzarse con un procedimiento no quirúrgico."
      }
    ]
  },
  "toxina-botulinica": {
    title: "Toxina botulínica en Mérida | Valoración facial | HAUTLAB",
    description:
      "Toxina botulínica en Mérida con valoración del movimiento facial. Información sobre zonas, inicio del efecto, duración, riesgos y precio del tercio superior.",
    pageSummary:
      "Aplicación de toxina botulínica en Mérida basada en fuerza, asimetrías y patrón de movimiento, para suavizar líneas dinámicas sin borrar la expresión.",
    schema: {
      type: "MedicalProcedure",
      name: "Aplicación estética de toxina botulínica",
      alternateName: ["Toxina botulínica facial", "Tratamiento de líneas dinámicas"],
      offerPrice: "3500"
    },
    additionalFaq: [
      {
        question: "¿Cuánto cuesta la toxina botulínica en Mérida?",
        answer:
          "La inversión de referencia para tercio superior en HAUTLAB es de $3,500 MXN. Otras zonas y dosis se definen después de valorar fuerza muscular, asimetrías y objetivo."
      },
      {
        question: "¿La toxina botulínica deja el rostro sin expresión?",
        answer:
          "No debería. La dosis y los puntos se individualizan para modular músculos concretos. Un resultado contenido conserva gestos y evita aplicar el mismo mapa a todos los rostros."
      }
    ]
  },
  acne: {
    title: "Tratamiento del acné en Mérida | Consulta médica | HAUTLAB",
    description:
      "Consulta médica para acné en Mérida. Diagnóstico del tipo de lesión, severidad, pigmentación y riesgo de cicatriz; tratamiento y seguimiento individualizados.",
    pageSummary:
      "Consulta médica para acné en Mérida con evaluación de lesiones, inflamación, pigmentación, hábitos, tratamientos previos y riesgo de cicatrices.",
    schema: {
      type: "MedicalCondition",
      name: "Acné",
      alternateName: ["Acné vulgar", "Brotes de acné"],
      offerPrice: "1300"
    },
    additionalFaq: [
      {
        question: "¿Cuánto tarda en mejorar el acné?",
        answer:
          "La respuesta no se valora en pocos días. El tiempo depende del tipo y severidad del acné, la tolerancia, la constancia y el tratamiento indicado. El plan se ajusta según evolución y efectos adversos."
      },
      {
        question: "¿Se puede tratar el acné y las cicatrices al mismo tiempo?",
        answer:
          "La prioridad suele ser controlar el acné activo. Tratar cicatrices mientras siguen apareciendo lesiones puede producir recuperación innecesaria y nuevas secuelas; después se clasifica cada tipo de cicatriz."
      }
    ]
  },
  rosacea: {
    title: "Tratamiento de rosácea en Mérida | Consulta médica | HAUTLAB",
    description:
      "Consulta médica para rosácea en Mérida: enrojecimiento, vasos visibles, brotes y síntomas oculares. Evaluación por manifestaciones, barrera cutánea y tratamiento individualizado.",
    pageSummary:
      "Consulta médica para rosácea en Mérida con evaluación por manifestaciones clínicas: enrojecimiento persistente, vasos visibles, lesiones inflamatorias, ardor, síntomas oculares y cambios de la piel.",
    schema: {
      type: "MedicalCondition",
      name: "Rosácea",
      alternateName: ["Rosacea", "Rosácea facial"],
      offerPrice: "1300"
    },
    additionalFaq: [
      {
        question: "¿Cómo saber si es rosácea o acné?",
        answer:
          "Ambas pueden producir pápulas y pústulas, pero la rosácea suele acompañarse de enrojecimiento persistente, ardor, sensibilidad o vasos visibles. La exploración permite valorar el patrón completo y descartar acné, dermatitis, foliculitis y otras causas."
      },
      {
        question: "¿La rosácea puede afectar los ojos?",
        answer:
          "Sí. Puede acompañarse de sequedad, ardor, sensación de cuerpo extraño, enrojecimiento ocular o inflamación de los párpados. Dolor ocular, sensibilidad marcada a la luz o visión borrosa nueva requieren valoración oportuna y pueden justificar evaluación oftalmológica."
      },
      {
        question: "¿El láser es obligatorio para tratar la rosácea?",
        answer:
          "No. El tratamiento se elige según las manifestaciones predominantes. Láser y otras fuentes de luz pueden ser útiles sobre todo para vasos visibles y eritema persistente en pacientes seleccionados, pero no sustituyen el manejo de inflamación, síntomas oculares, barrera cutánea y desencadenantes relevantes."
      }
    ],
    clinicalDetails: {
      evaluation: [
        "Se identifican las manifestaciones predominantes en lugar de asumir un solo subtipo: enrojecimiento persistente o episódico, telangiectasias, pápulas y pústulas, edema, cambios fimatosos y síntomas oculares.",
        "Se revisan ardor, sensibilidad, sequedad ocular, sensación de cuerpo extraño, cambios palpebrales, desencadenantes, exposición solar, productos utilizados y tratamientos previos.",
        "Se consideran diagnósticos diferenciales como acné, dermatitis perioral, dermatitis seborreica, lupus, foliculitis o reacción a productos cuando el patrón no es típico.",
        "La intensidad del tratamiento se decide según las manifestaciones, su gravedad, impacto cotidiano, tolerancia y antecedentes; no existe un protocolo único para todas las personas con rosácea."
      ],
      recovery: [
        "El control suele ser progresivo y puede requerir ajustes según la manifestación predominante y la tolerancia de la piel.",
        "El cuidado de barrera y la fotoprotección forman parte del manejo diario, incluso cuando se utilizan medicamentos o procedimientos.",
        "Después de láser o luz pueden aparecer enrojecimiento, inflamación o sensibilidad transitorios; la recuperación depende del dispositivo, parámetros, fototipo y respuesta individual.",
        "Los procedimientos vasculares suelen integrarse dentro de un plan y no se consideran una corrección única de todos los componentes de la rosácea."
      ],
      risks: [
        "Rutinas agresivas, exfoliación excesiva o procedimientos durante un brote pueden intensificar ardor y enrojecimiento.",
        "Los tratamientos tópicos, sistémicos y basados en energía tienen perfiles de efectos adversos diferentes; la selección depende de la manifestación tratada y del paciente.",
        "Láser o luz pueden producir inflamación, cambios transitorios de color y, en determinados fototipos o parámetros, alteraciones pigmentarias; por eso requieren selección y ajustes individualizados.",
        "Tratar únicamente vasos o color persistente puede dejar sin tratar lesiones inflamatorias, síntomas oculares u otros componentes de la enfermedad."
      ],
      alternatives: [
        "Cuidado suave de barrera, fotoprotección y reducción de desencadenantes que sean relevantes para esa persona.",
        "Tratamiento tópico u oral seleccionado según la manifestación predominante y la gravedad, en lugar de aplicar el mismo esquema a todos los pacientes.",
        "Láser o luz para telangiectasias y eritema persistente cuando existe una indicación clara y la piel puede tratarse con seguridad.",
        "Valoración oftalmológica cuando los síntomas oculares son moderados, persistentes, atípicos o presentan señales de alarma."
      ],
      warningSigns: [
        "Dolor ocular, sensibilidad marcada a la luz, visión borrosa nueva o disminución visual requieren valoración médica oportuna y no deben atribuirse automáticamente a rosácea leve.",
        "Inflamación facial rápida, ronchas, dificultad respiratoria o reacción intensa después de un producto requieren atención inmediata.",
        "Enrojecimiento unilateral, fiebre, dolor intenso, úlceras o lesiones que no corresponden al patrón habitual justifican reconsiderar el diagnóstico."
      ]
    },
    medicalReview: {
      author: "Dr. Salvador Cordero Romero",
      professionalTitle: "Médico Cirujano",
      practiceArea: "Dermatología Clínica y Estética",
      license: "Cédula Profesional 11804418",
      reviewedAt: "Pendiente de revisión médica — 23 de septiembre de 2026",
      sources: [
        {
          label: "American Academy of Dermatology · Diagnóstico y tratamiento de la rosácea",
          href: "https://www.aad.org/public/diseases/rosacea/treatment/diagnosis-treat"
        },
        {
          label: "American Academy of Dermatology · Láser y luz en rosácea",
          href: "https://www.aad.org/public/diseases/rosacea/treatment/lasers-lights"
        },
        {
          label: "Global ROSacea COnsensus · diagnóstico, clasificación y manejo por fenotipo",
          href: "https://pubmed.ncbi.nlm.nih.gov/31392722/"
        },
        {
          label: "JAMA Dermatology 2024 · dominios clínicos esenciales en rosácea",
          href: "https://pubmed.ncbi.nlm.nih.gov/38656294/"
        },
        {
          label: "JDDG 2026 · consenso Delphi sobre láser y tecnologías basadas en energía para rosácea",
          href: "https://pubmed.ncbi.nlm.nih.gov/41414941/"
        }
      ]
    }
  },
  alopecia: {
    title: "Caída de cabello y alopecia en Mérida | HAUTLAB",
    description:
      "Consulta médica por caída de cabello y alopecia en Mérida. Evaluación de patrón, cuero cabelludo, antecedentes, tricoscopia y estudios cuando están indicados.",
    pageSummary:
      "Consulta médica por caída de cabello y alopecia en Mérida con evaluación del patrón, cuero cabelludo, antecedentes y factores asociados antes de indicar tratamiento.",
    schema: {
      type: "MedicalCondition",
      name: "Alopecia y caída de cabello",
      alternateName: ["Pérdida de cabello", "Caída capilar"],
      offerPrice: "1300"
    },
    additionalFaq: [
      {
        question: "¿Cuándo la caída de cabello requiere valoración médica?",
        answer:
          "Conviene valorar una caída nueva o progresiva, pérdida en placas, disminución de densidad, dolor, ardor, descamación, pústulas o pérdida de cejas. Algunas alopecias pueden dejar pérdida permanente si se retrasa el diagnóstico."
      },
      {
        question: "¿Las vitaminas sirven para cualquier tipo de caída de cabello?",
        answer:
          "No. Los suplementos solo corrigen una deficiencia cuando existe. Tomarlos sin diagnóstico puede no ayudar y, en exceso, algunos nutrientes incluso pueden empeorar la caída."
      }
    ]
  }
};
