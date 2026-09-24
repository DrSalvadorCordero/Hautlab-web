export type SalesServiceKey =
  | "dermatology_consultation"
  | "upper_face_botulinum_toxin"
  | "hyaluronic_acid_one_syringe";

export type SalesLeadTemperature = "cold" | "warm" | "hot";
export type SalesObjection =
  | "none"
  | "price"
  | "trust"
  | "fear"
  | "timing"
  | "comparison"
  | "uncertainty";
export type SalesHistory = "new" | "repeat" | "high_value";
export type SalesPaymentMode = "preferential" | "card" | "installments";

export type SalesQuoteItem = {
  serviceKey: SalesServiceKey;
  quantity: number;
};

export type SalesQuoteInput = {
  items: SalesQuoteItem[];
  leadTemperature: SalesLeadTemperature;
  objection: SalesObjection;
  history: SalesHistory;
  askedDiscount: boolean;
  prepaid: boolean;
  paymentMode: SalesPaymentMode;
};

export type SalesQuoteResult = {
  publicValue: number;
  targetPrice: number;
  lastConcession: number;
  commercialFloor: number;
  discountPercent: number;
  lastDiscountPercent: number;
  contributionAfterDirectCosts: number;
  closeScore: number;
  band: "protect_price" | "controlled_package" | "reduce_friction";
  nextMove: string;
  patientCopy: string;
  internalReason: string;
};

type ServiceEconomics = {
  label: string;
  preferredPrice: number;
  installmentPrice: number;
  directCost: number;
  hours: number;
  discountEligible: boolean;
  commercialFloorRatio: number;
};

const SERVICES: Record<SalesServiceKey, ServiceEconomics> = {
  dermatology_consultation: {
    label: "Consulta dermatológica",
    preferredPrice: 1300,
    installmentPrice: 1300,
    directCost: 0,
    hours: 1,
    discountEligible: false,
    commercialFloorRatio: 1,
  },
  upper_face_botulinum_toxin: {
    label: "Toxina botulínica de tercio superior",
    preferredPrice: 3500,
    installmentPrice: 3500,
    // Escenario conservador: 60 UI de un vial de 200 UI que cuesta $2,300.
    directCost: 690,
    hours: 1,
    discountEligible: true,
    commercialFloorRatio: 0.78,
  },
  hyaluronic_acid_one_syringe: {
    label: "Procedimiento estándar con ácido hialurónico",
    preferredPrice: 5500,
    installmentPrice: 6300,
    // Se usa el extremo alto del costo reportado para no sobreestimar margen.
    directCost: 800,
    hours: 1,
    discountEligible: true,
    commercialFloorRatio: 0.72,
  },
};

const CARD_FEE_RATE = 0.0406;
const MEDICAL_HOUR_VALUE = 1300;
const MINIMUM_EXTRA_CONTRIBUTION_PER_HOUR = 700;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundUp100(value: number) {
  return Math.ceil(Math.max(0, value) / 100) * 100;
}

function basePackageDiscount(eligibleCount: number) {
  if (eligibleCount <= 1) return 0;
  if (eligibleCount === 2) return 0.04;
  if (eligibleCount === 3) return 0.07;
  if (eligibleCount === 4) return 0.09;
  return 0.1;
}

function priceFor(service: ServiceEconomics, paymentMode: SalesPaymentMode) {
  return paymentMode === "installments"
    ? service.installmentPrice
    : service.preferredPrice;
}

function computeCloseScore(input: SalesQuoteInput) {
  let score = 50;
  score += input.leadTemperature === "hot" ? 25 : input.leadTemperature === "warm" ? 8 : -15;
  score +=
    input.objection === "none"
      ? 15
      : input.objection === "timing"
        ? 5
        : input.objection === "fear" || input.objection === "trust"
          ? 0
          : input.objection === "comparison"
            ? -7
            : input.objection === "price"
              ? -10
              : -5;
  score += input.history === "high_value" ? 12 : input.history === "repeat" ? 6 : 0;
  score += input.askedDiscount ? -7 : 5;
  return clamp(Math.round(score), 5, 95);
}

export function calculateSalesQuote(input: SalesQuoteInput): SalesQuoteResult {
  const normalizedItems = input.items
    .map((item) => ({
      serviceKey: item.serviceKey,
      quantity: clamp(Math.round(item.quantity || 1), 1, 12),
    }))
    .filter((item) => SERVICES[item.serviceKey]);

  const rows = normalizedItems.map((item) => {
    const service = SERVICES[item.serviceKey];
    const unitPrice = priceFor(service, input.paymentMode);
    return {
      ...item,
      service,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
      totalDirectCost: service.directCost * item.quantity,
      totalHours: service.hours * item.quantity,
    };
  });

  const publicValue = rows.reduce((sum, row) => sum + row.totalPrice, 0);
  const directCosts = rows.reduce((sum, row) => sum + row.totalDirectCost, 0);
  const totalHours = rows.reduce((sum, row) => sum + row.totalHours, 0);
  const eligibleRows = rows.filter((row) => row.service.discountEligible);
  const eligibleSubtotal = eligibleRows.reduce((sum, row) => sum + row.totalPrice, 0);
  const eligibleCount = eligibleRows.reduce((sum, row) => sum + row.quantity, 0);
  const protectedSubtotal = publicValue - eligibleSubtotal;

  let desiredDiscount = basePackageDiscount(eligibleCount);
  if (input.prepaid && eligibleCount >= 2) desiredDiscount += 0.015;
  if (input.objection === "price" && input.askedDiscount && eligibleCount >= 2) {
    desiredDiscount += 0.015;
  }
  if (input.leadTemperature === "hot" && !input.askedDiscount) {
    desiredDiscount = Math.max(0, desiredDiscount - 0.02);
  }
  desiredDiscount = clamp(desiredDiscount, 0, 0.12);

  const paymentFeeRate = input.paymentMode === "preferential" ? 0 : CARD_FEE_RATE;
  const economicFloor =
    (directCosts +
      totalHours * MEDICAL_HOUR_VALUE +
      totalHours * MINIMUM_EXTRA_CONTRIBUTION_PER_HOUR) /
    Math.max(0.5, 1 - paymentFeeRate);

  const weightedFloor = rows.reduce(
    (sum, row) =>
      sum + row.totalPrice * row.service.commercialFloorRatio,
    0,
  );

  const commercialFloor = roundUp100(
    Math.max(protectedSubtotal, economicFloor, weightedFloor),
  );

  let targetPrice = roundUp100(publicValue - eligibleSubtotal * desiredDiscount);
  targetPrice = clamp(targetPrice, commercialFloor, publicValue);

  let lastDiscount = clamp(desiredDiscount + (input.askedDiscount ? 0.025 : 0.015), 0, 0.15);
  let lastConcession = roundUp100(publicValue - eligibleSubtotal * lastDiscount);
  lastConcession = clamp(lastConcession, commercialFloor, targetPrice);

  const effectiveDiscount = publicValue
    ? (publicValue - targetPrice) / publicValue
    : 0;
  const lastEffectiveDiscount = publicValue
    ? (publicValue - lastConcession) / publicValue
    : 0;

  const cardCost = targetPrice * paymentFeeRate;
  const contributionAfterDirectCosts =
    targetPrice - directCosts - cardCost - totalHours * MEDICAL_HOUR_VALUE;

  const closeScore = computeCloseScore(input);
  const band =
    closeScore >= 75
      ? "protect_price"
      : closeScore >= 55
        ? "controlled_package"
        : "reduce_friction";

  let nextMove: string;
  let internalReason: string;

  if (eligibleCount <= 1) {
    nextMove = "Mantener precio; no conceder por reflejo.";
    internalReason =
      "Un procedimiento aislado no obtiene descuento automático. La prioridad es resolver la barrera real y avanzar a agenda.";
  } else if (band === "protect_price") {
    nextMove = "Cerrar alto. Presentar el plan sin usar la última concesión.";
    internalReason =
      "La intención es alta; bajar antes de una resistencia real sacrifica margen sin comprar una probabilidad adicional clara de cierre.";
  } else if (band === "controlled_package") {
    nextMove = "Presentar precio integral del plan y conservar una sola concesión.";
    internalReason =
      "Existe suficiente intención para un paquete controlado. La última concesión solo se usa si la objeción dominante es realmente precio.";
  } else {
    nextMove = "Reducir fricción antes que precio.";
    internalReason =
      "La intención todavía no está consolidada. Conviene resolver confianza, timing o claridad antes de comprar el cierre con descuento.";
  }

  const patientCopy =
    targetPrice < publicValue
      ? `El valor individual de los tratamientos es ${formatMoney(publicValue)}. Al realizarlos dentro del mismo plan, HAUTLAB maneja un valor integral de ${formatMoney(targetPrice)}. Este valor corresponde al plan completo y no modifica las tarifas individuales.`
      : `El valor del plan es ${formatMoney(publicValue)}. Las tarifas corresponden a la estructura vigente de HAUTLAB.`;

  return {
    publicValue,
    targetPrice,
    lastConcession,
    commercialFloor,
    discountPercent: Number((effectiveDiscount * 100).toFixed(1)),
    lastDiscountPercent: Number((lastEffectiveDiscount * 100).toFixed(1)),
    contributionAfterDirectCosts: Math.round(contributionAfterDirectCosts),
    closeScore,
    band,
    nextMove,
    patientCopy,
    internalReason,
  };
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function getSalesServices() {
  return Object.entries(SERVICES).map(([serviceKey, service]) => ({
    serviceKey: serviceKey as SalesServiceKey,
    label: service.label,
    preferredPrice: service.preferredPrice,
    installmentPrice: service.installmentPrice,
  }));
}
