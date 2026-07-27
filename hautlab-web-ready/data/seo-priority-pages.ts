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
      "Consulta médica para rosácea en Mérida: enrojecimiento, ardor, vasos visibles y brotes. Diagnóstico diferencial, barrera cutánea y tratamiento individualizado.",
    pageSummary:
      "Consulta médica para rosácea en Mérida enfocada en enrojecimiento, sensibilidad, vasos visibles, brotes, desencadenantes y estado de la barrera cutánea.",
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
          "Ambas pueden producir pápulas y pústulas, pero la rosácea suele acompañarse de enrojecimiento persistente, ardor, sensibilidad o vasos visibles. La exploración permite descartar dermatitis, foliculitis y otras causas."
      },
      {
        question: "¿El láser es obligatorio para tratar la rosácea?",
        answer:
          "No. El plan puede incluir cuidado suave, fotoprotección y medicamentos. Láser o luz se consideran principalmente para vasos o enrojecimiento persistente y no sustituyen el control de inflamación y desencadenantes."
      }
    ],
    clinicalDetails: {
      evaluation: [
        "Distribución del enrojecimiento, vasos visibles, pápulas, pústulas, ardor, edema y síntomas oculares.",
        "Desencadenantes, productos utilizados, exposición solar, medicamentos y antecedentes de tratamientos irritantes.",
        "Diagnósticos diferenciales como acné, dermatitis perioral, dermatitis seborreica, lupus o reacción a productos."
      ],
      recovery: [
        "El control suele ser progresivo y puede requerir ajustes según tolerancia y tipo de manifestación.",
        "La barrera cutánea y la fotoprotección forman parte del tratamiento diario.",
        "Los procedimientos vasculares o de luz se espacian y se indican cuando la piel está suficientemente estable."
      ],
      risks: [
        "Rutinas agresivas, exfoliación excesiva o procedimientos durante un brote pueden intensificar ardor y enrojecimiento.",
        "Algunos medicamentos pueden causar irritación o cambios temporales de color y requieren ajuste individual.",
        "Tratar solo el enrojecimiento visible sin controlar inflamación y desencadenantes puede producir una respuesta incompleta."
      ],
      alternatives: [
        "Cuidado suave de barrera, fotoprotección y reducción de desencadenantes relevantes.",
        "Tratamiento tópico u oral según predominio de enrojecimiento, inflamación o síntomas oculares.",
        "Láser o luz para vasos y color persistente en pacientes seleccionados."
      ],
      warningSigns: [
        "Dolor ocular, sensibilidad marcada a la luz, visión borrosa nueva o sensación persistente de cuerpo extraño.",
        "Inflamación facial rápida, ronchas, dificultad respiratoria o reacción intensa después de un producto.",
        "Enrojecimiento unilateral, fiebre, dolor intenso o lesiones que no corresponden al patrón habitual."
      ]
    },
    medicalReview: {
      author: "Dr. Salvador Cordero Romero",
      professionalTitle: "Médico Cirujano",
      practiceArea: "Dermatología Clínica y Estética",
      license: "Cédula Profesional 11804418",
      reviewedAt: "27 de julio de 2026",
      sources: [
        {
          label: "American Academy of Dermatology · Diagnóstico y tratamiento de la rosácea",
          href: "https://www.aad.org/public/diseases/rosacea/treatment/diagnosis-treat"
        },
        {
          label: "American Academy of Dermatology · Panorama general de la rosácea",
          href: "https://www.aad.org/public/diseases/rosacea/what-is/overview"
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
