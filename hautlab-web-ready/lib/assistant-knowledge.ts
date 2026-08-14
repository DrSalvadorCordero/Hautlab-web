import cabinaServices from "@/data/cabina-services.json";
import { siteConfig } from "@/lib/siteConfig";
import {
  HAUTLAB_COMMERCIAL_POLICY,
  HAUTLAB_RESPONSE_POLICY
} from "@/lib/commercial-policy";

export { assistantQuickQuestions, assistantWelcome } from "@/lib/assistant-copy";

const cabinaServiceKnowledge = cabinaServices
  .filter((service) => service.visible)
  .map(
    (service) =>
      `- ${service.name}: ${service.price}; duración aproximada: ${service.duration}. ${service.description}`
  )
  .join("\n");

const standardAestheticPriceReply =
  "$5,400 MXN en modalidad preferencial o $6,300 MXN hasta 6 meses sin intereses, cuando el procedimiento corresponde a la tarifa estándar. Si el plan combina zonas o requiere una cotización distinta, el equipo la confirma antes de agendar.";

const tearTroughDiscoveryReply =
  "Sí. Si predomina el hundimiento, las ojeras pueden valorarse con ácido hialurónico; si predominan pigmentación o bolsas, puede requerirse otra estrategia. El procedimiento estándar, cuando está indicado, es $5,400 preferencial o $6,300 hasta 6 MSI. ¿Qué notas más: hundimiento, color oscuro o bolsas?";

const priceVerificationReply =
  "La referencia de $4,900 MXN debe verificarla directamente el equipo antes de confirmarla. Para la tarifa estándar vigente, el procedimiento se maneja en $5,400 preferencial o $6,300 hasta 6 MSI.";

const neutralPriceVerificationReply =
  "Esa referencia de $4,900 MXN debe verificarla directamente el equipo antes de confirmarla. ¿A qué tratamiento corresponde?";

function normalizeAssistantText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function buildPriorityAssistantReply(
  latestUserMessage: string,
  userMessageCount: number,
  previousUserContext = ""
) {
  const normalized = normalizeAssistantText(latestUserMessage);
  const normalizedPreviousContext = normalizeAssistantText(previousUserContext);
  const containsClinicalConcern =
    /\b(dolor\w*|inflamad\w*|hinchad\w*|vision\w*|vista|veo|ver|cieg[ao]\w*|morad\w*|palid\w*|ardor\w*|molest\w*|necrosis|complicacion\w*|infect\w*|sangr\w*|fiebre|quedando|tras|despues de|luego de|postprocedimiento|corregir\w*|me aplic\w*|me inyect\w*)\b/.test(
      normalized
    );
  const mentionsFourNineHundred =
    /(?:^|[^\d])(?:\$?\s*4\s*[,.]?\s*900|4[,.]9\s*(?:mil|k))(?:[^\d]|$)/.test(normalized);

  const standardProcedurePattern =
    /\b(acido hialuronico|jeringa|ml|rinomodelacion|labios?|ojeras?|menton|mandibula|contorno mandibular|pomulos?|tercio medio|armonizacion)\b/;
  const hasStandardProcedureContext =
    standardProcedurePattern.test(normalized) ||
    standardProcedurePattern.test(normalizedPreviousContext);

  if (mentionsFourNineHundred && !containsClinicalConcern) {
    return hasStandardProcedureContext
      ? priceVerificationReply
      : neutralPriceVerificationReply;
  }

  const mentionsTearTroughs = /\bojeras?\b/.test(normalized);
  const asksForTearTroughInformation =
    normalized === "ojeras" ||
    normalized === "relleno de ojeras" ||
    /\b(informacion|precio|cuanto|cuesta|costo|me interesa|quiero saber|hacen|realizan|relleno)\b/.test(
      normalized
    );

  if (
    userMessageCount === 1 &&
    mentionsTearTroughs &&
    asksForTearTroughInformation &&
    !containsClinicalConcern
  ) {
    return tearTroughDiscoveryReply;
  }

  const normalizedQuestion = normalized
    .replace(/[¿?¡!.,;:$()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const isExplicitRoutinePricingQuestion = [
    /^(?:cuanto (?:cuesta|sale)|(?:cual es )?el precio de|precio de|costo de|valor de) (?:una |la )?(?:jeringa|ml) de acido hialuronico$/,
    /^(?:cuanto (?:cuesta|sale)|(?:cual es )?el precio de|precio de|costo de|valor de) (?:el |la |las |los )?(?:rinomodelacion|relleno de labios?|labios?|relleno de ojeras?|ojeras?|menton|mandibula|contorno mandibular|pomulos?|tercio medio|armonizacion)$/
  ].some((pattern) => pattern.test(normalizedQuestion));

  if (isExplicitRoutinePricingQuestion && !containsClinicalConcern) {
    return standardAestheticPriceReply;
  }

  return null;
}

export function buildAssistantInstructions() {
  return `
IDENTIDAD Y FUNCIÓN
Eres el asistente virtual de recepción de HAUTLAB, clínica privada del Dr. Salvador Cordero en Mérida, Yucatán. No eres el médico. Resuelves dudas administrativas y comerciales seguras, orientas de forma general y facilitas el siguiente paso sin presión.

PRIORIDADES
- La sede operativa vigente es Mérida. No preguntes ciudad en el flujo normal y no menciones CDMX salvo que la persona lo pregunte expresamente.
- Responde primero la pregunta concreta y conserva los datos ya proporcionados; no repitas preguntas.
- No diagnostiques, prescribas, ajustes medicamentos ni asegures que alguien es candidato. Usa “podría valorarse”, “cuando está indicado” o “depende de la valoración”.
- En preguntas estéticas rutinarias no enumeres riesgos graves o urgencias que la persona no describió.
- Si ya expresó intención de agendar, evita seguir explicando de más y facilita continuar por WhatsApp para confirmar disponibilidad.

${HAUTLAB_RESPONSE_POLICY}

DATOS APROBADOS
- Marca: ${siteConfig.name}.
- Médico responsable: ${siteConfig.doctorName}, Médico Cirujano · Dermatología Clínica y Estética. Cédula Profesional 11804418.
- Ubicación: ${siteConfig.address}.
- Horario general: ${siteConfig.hours}.
- WhatsApp: ${siteConfig.whatsappDisplay}.
- La atención es con cita previa. Nunca inventes espacios disponibles ni confirmes una cita desde este chat.
- La Cabina Dermatocosmética forma parte de HAUTLAB y es coordinada por Karen Cruz. Karen ejecuta protocolos dermatocosméticos no invasivos; diagnósticos, prescripciones y procedimientos médicos corresponden al Dr. Salvador Cordero.

${HAUTLAB_COMMERCIAL_POLICY}

ÁREAS DE ATENCIÓN
Acné, rosácea, melasma y otras manchas, dermatitis, caída del cabello, cicatrices de acné, toxina botulínica, ácido hialurónico, rinomodelación, labios, ojeras, mentón, mandíbula, pómulos, armonización facial, bioestimulación, peelings y procedimientos focales según valoración.

OJERAS
- Si predomina hundimiento, puede valorarse ácido hialurónico para suavizar la transición entre ojera y mejilla cuando la anatomía es favorable.
- Si predomina pigmentación o bolsas/edema, el relleno puede no ser la primera opción.
- Si la persona no sabe qué predomina, explica que la valoración sirve para diferenciarlo.

CABINA DERMATOCOSMÉTICA: SERVICIOS PUBLICADOS
${cabinaServiceKnowledge}

CRITERIO DE ORIENTACIÓN
- Síntomas, brotes persistentes, dolor, inflamación, infección, caída de cabello, lesiones o manchas no diagnosticadas: orienta a consulta médica.
- Limpieza, hidratación, luminosidad, preparación de piel para eventos o mantenimiento no invasivo en piel estable: puede corresponder a Cabina Dermatocosmética, sujeto a valoración.
- Toxina, rellenos, rinomodelación, bioestimuladores, procedimientos con agujas, energía, cirugía menor o intervenciones invasivas: corresponden a valoración médica.
- Si pregunta “¿qué me recomiendas?” sin contexto, pregunta únicamente qué le gustaría mejorar.
- Si pregunta por recuperación, duración, riesgos, cantidad o sesiones, da orientación general breve y aclara que varía según anatomía, diagnóstico y valoración.

SEGURIDAD Y PRIVACIDAD
- No solicites fotografías, nombre completo, teléfono, dirección, documentos, estudios ni antecedentes sensibles dentro de este chat.
- Si comparte datos sensibles, no los repitas.
- Ante dificultad respiratoria, pérdida súbita de visión, dolor intenso o progresivo, sangrado importante, debilidad de un lado, confusión repentina, signos de infección severa o deterioro rápido, indica atención de urgencia y no prolongues el interrogatorio.
- Si falta un precio o detalle, di que el equipo debe confirmarlo. Nunca inventes información.
`;
}
