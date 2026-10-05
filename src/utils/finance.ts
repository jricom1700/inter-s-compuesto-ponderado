import type {
  Apartado,
  ApartadoCalculation,
  Entity,
  EntityCalculation,
  PortfolioSummary,
  ProjectionMilestone,
  ProjectionPoint,
  ProjectionHorizon,
  ContributionFrequency,
} from '../types/finance';

/**
 * Calcula la cantidad de aportaciones que caben en un año según periodicidad
 */
export function getAnnualContributionFactor(frequency?: ContributionFrequency): number {
  switch (frequency) {
    case 'weekly':
      return 52;
    case 'biweekly':
      return 26;
    case 'monthly':
      return 12;
    case 'none':
    default:
      return 0;
  }
}

/**
 * Retorna el intervalo de días entre cada aportación
 */
export function getContributionIntervalDays(frequency?: ContributionFrequency): number {
  switch (frequency) {
    case 'weekly':
      return 7;
    case 'biweekly':
      return 14;
    case 'monthly':
      return 30;
    default:
      return 0;
  }
}

/**
 * Calcula el rendimiento anual y mensual para un apartado individual
 */
export function calculateApartado(apartado: Apartado): ApartadoCalculation {
  const balance = Math.max(0, Number(apartado.balance) || 0);
  const contributionFreq: ContributionFrequency = apartado.contributionFrequency || 'none';
  const rawContributionAmount = Math.max(0, Number(apartado.contributionAmount) || 0);

  // Caso 1: Tasa Fija
  if (apartado.rateType === 'fixed') {
    const rate = Math.max(0, Number(apartado.annualRate) || 0);
    const annualYield = balance * (rate / 100);
    const monthlyYield = annualYield / 12;
    const dailyYield = annualYield / 365;
    const totalContributionsAnnual = rawContributionAmount * getAnnualContributionFactor(contributionFreq);

    return {
      apartadoId: apartado.id,
      name: apartado.name,
      balance,
      rateType: 'fixed',
      effectiveAnnualRate: rate,
      annualYield,
      monthlyYield,
      dailyYield,
      tier1Amount: balance,
      tier1Yield: annualYield,
      tier2Amount: 0,
      tier2Yield: 0,
      contributionFrequency: contributionFreq,
      contributionAmount: rawContributionAmount,
      totalContributionsAnnual,
      compounding: apartado.compounding,
      isActive: apartado.isActive !== false,
    };
  }

  // Caso 2: Tasa Escalonada
  const limit = Math.max(0, Number(apartado.tierLimit) || 0);
  const baseRate = Math.max(0, Number(apartado.baseRate) || 0);
  const excessRate = Math.max(0, Number(apartado.excessRate) || 0);
  const tieredSubtype = apartado.tieredSubtype || 'limit_with_yields';

  if (tieredSubtype === 'limit_with_yields') {
    // Si el saldo supera el límite, se interpreta como límite + rendimientos previos
    const isAboveLimit = balance > limit && limit > 0;
    const investedBase = isAboveLimit ? limit : balance;
    const priorYields = isAboveLimit ? balance - limit : 0;

    // La modalidad "Límite + Rendimientos a Tasa Máxima" no admite aportaciones periódicas por regla institucional
    const annualYield = balance * (baseRate / 100);
    const monthlyYield = annualYield / 12;
    const dailyYield = annualYield / 365;

    return {
      apartadoId: apartado.id,
      name: apartado.name,
      balance,
      rateType: 'tiered',
      tieredSubtype,
      effectiveAnnualRate: baseRate,
      annualYield,
      monthlyYield,
      dailyYield,
      tier1Amount: balance,
      tier1Yield: annualYield,
      tier2Amount: 0,
      tier2Yield: 0,
      investedBase,
      priorYields,
      contributionFrequency: 'none',
      contributionAmount: 0,
      totalContributionsAnnual: 0,
      compounding: apartado.compounding,
      isActive: apartado.isActive !== false,
    };
  }

  // Subtipo 2: limit_capped_excess (Límite estricto con excedente)
  const tier1Amount = Math.min(balance, limit);
  const tier2Amount = Math.max(0, balance - limit);

  const tier1Yield = tier1Amount * (baseRate / 100);
  const tier2Yield = tier2Amount * (excessRate / 100);
  const annualYield = tier1Yield + tier2Yield;
  const monthlyYield = annualYield / 12;
  const dailyYield = annualYield / 365;

  const totalContributionsAnnual = rawContributionAmount * getAnnualContributionFactor(contributionFreq);
  const effectiveAnnualRate = balance > 0 ? (annualYield / balance) * 100 : 0;

  return {
    apartadoId: apartado.id,
    name: apartado.name,
    balance,
    rateType: 'tiered',
    tieredSubtype,
    effectiveAnnualRate,
    annualYield,
    monthlyYield,
    dailyYield,
    tier1Amount,
    tier1Yield,
    tier2Amount,
    tier2Yield,
    contributionFrequency: contributionFreq,
    contributionAmount: rawContributionAmount,
    totalContributionsAnnual,
    compounding: apartado.compounding,
    isActive: apartado.isActive !== false,
  };
}

/**
 * Proyecta el saldo, capital aportado acumulado y rendimiento a t días
 */
export function projectApartadoDays(
  apartado: Apartado,
  days: number
): { investedCapital: number; balance: number; yield: number } {
  const calc = calculateApartado(apartado);
  const P0 = calc.balance;

  if (days <= 0) {
    return { investedCapital: P0, balance: P0, yield: 0 };
  }

  const intervalDays = getContributionIntervalDays(apartado.contributionFrequency);
  const contribAmount = calc.contributionAmount;
  const hasContributions = intervalDays > 0 && contribAmount > 0;

  // Caso A: Tasa Fija
  if (apartado.rateType === 'fixed') {
    const r = (apartado.annualRate || 0) / 100;
    const dailyRate = r / 365;

    let currentBalance = P0;
    let totalInvested = P0;

    // Simulación por periodos o compuesto
    if (!hasContributions) {
      if (apartado.compounding === 'daily') {
        currentBalance = P0 * Math.pow(1 + dailyRate, days);
      } else if (apartado.compounding === 'monthly') {
        const months = (days / 365) * 12;
        currentBalance = P0 * Math.pow(1 + r / 12, months);
      } else {
        currentBalance = P0 * (1 + r * (days / 365));
      }
      return {
        investedCapital: P0,
        balance: currentBalance,
        yield: Math.max(0, currentBalance - P0),
      };
    }

    // Con aportaciones recurrentes
    let day = 0;
    const step = apartado.compounding === 'daily' ? 1 : (intervalDays || 1);
    while (day < days) {
      const nextStep = Math.min(days - day, step);
      // Crecer intereses del periodo
      if (apartado.compounding === 'daily') {
        currentBalance *= Math.pow(1 + dailyRate, nextStep);
      } else {
        currentBalance += currentBalance * (r / 365) * nextStep;
      }
      day += nextStep;

      // Evento de aportación si coincide con intervalo
      if (day % intervalDays === 0 || (day < days && day % intervalDays < step)) {
        currentBalance += contribAmount;
        totalInvested += contribAmount;
      }
    }

    return {
      investedCapital: totalInvested,
      balance: currentBalance,
      yield: Math.max(0, currentBalance - totalInvested),
    };
  }

  // Caso B: Tasa Escalonada
  const limit = Math.max(0, Number(apartado.tierLimit) || 0);
  const baseRate = Math.max(0, Number(apartado.baseRate) || 0) / 100;
  const excessRate = Math.max(0, Number(apartado.excessRate) || 0) / 100;
  const subtype = apartado.tieredSubtype || 'limit_with_yields';

  if (subtype === 'limit_with_yields') {
    // Todo el saldo en cuenta capitaliza a baseRate.
    // Esta modalidad con tope fijo no admite aportaciones periódicas externas.
    let currentBalance = P0;
    const dailyRate = baseRate / 365;

    if (apartado.compounding === 'daily') {
      currentBalance = P0 * Math.pow(1 + dailyRate, days);
    } else if (apartado.compounding === 'monthly') {
      const months = (days / 365) * 12;
      currentBalance = P0 * Math.pow(1 + baseRate / 12, months);
    } else {
      currentBalance = P0 * (1 + baseRate * (days / 365));
    }
    return {
      investedCapital: P0,
      balance: currentBalance,
      yield: Math.max(0, currentBalance - P0),
    };
  }

  // Subtipo 2: limit_capped_excess
  // Los primeros limit generan baseRate; todo excedente genera excessRate
  let currentBalance = P0;
  let totalInvested = P0;
  const dailyBase = baseRate / 365;
  const dailyExcess = excessRate / 365;

  let day = 0;
  const step = 1;
  while (day < days) {
    day += step;
    // La parte hasta limit genera baseRate, el resto excessRate
    const basePart = Math.min(currentBalance, limit);
    const excessPart = Math.max(0, currentBalance - limit);
    const dailyEarned = basePart * dailyBase + excessPart * dailyExcess;
    currentBalance += dailyEarned;

    if (hasContributions && day % intervalDays === 0) {
      currentBalance += contribAmount;
      totalInvested += contribAmount;
    }
  }

  return {
    investedCapital: totalInvested,
    balance: currentBalance,
    yield: Math.max(0, currentBalance - totalInvested),
  };
}

/**
 * Proyecta el resultado para un conjunto de entidades en un plazo de días determinado
 */
export function projectEntitiesForDays(
  entities: Entity[],
  days: number,
  targetEntityId?: string | string[]
): { totalBalance: number; investedCapital: number; accumulatedYield: number; breakdown: Record<string, { balance: number; yield: number; invested: number }> } {
  let totalBalance = 0;
  let totalInvested = 0;
  let accumulatedYield = 0;
  const breakdown: Record<string, { balance: number; yield: number; invested: number }> = {};

  let filtered: Entity[];
  if (Array.isArray(targetEntityId)) {
    filtered = entities.filter((e) => targetEntityId.includes(e.id) && e.isActive !== false);
  } else if (targetEntityId && targetEntityId !== 'all') {
    filtered = entities.filter((e) => e.id === targetEntityId && e.isActive !== false);
  } else {
    filtered = entities.filter((e) => e.isActive !== false);
  }

  for (const entity of filtered) {
    let entBal = 0;
    let entInv = 0;
    let entYld = 0;

    for (const apartado of entity.apartados) {
      if (apartado.isActive === false) continue;
      const proj = projectApartadoDays(apartado, days);
      entBal += proj.balance;
      entInv += proj.investedCapital;
      entYld += proj.yield;
    }

    breakdown[entity.id] = { balance: entBal, yield: entYld, invested: entInv };
    totalBalance += entBal;
    totalInvested += entInv;
    accumulatedYield += entYld;
  }

  return { totalBalance, investedCapital: totalInvested, accumulatedYield, breakdown };
}

/**
 * Calcula el resumen consolidado de todo el portafolio
 */
export function calculatePortfolioSummary(entities: Entity[]): PortfolioSummary {
  let totalCapital = 0;
  let totalAnnualYield = 0;
  let totalAnnualContributions = 0;

  // Primera pasada: calcular totales globales solo de entidades y apartados activos
  for (const entity of entities) {
    if (entity.isActive === false) continue;
    for (const apt of entity.apartados) {
      if (apt.isActive === false) continue;
      const calc = calculateApartado(apt);
      totalCapital += calc.balance;
      totalAnnualYield += calc.annualYield;
      totalAnnualContributions += calc.totalContributionsAnnual;
    }
  }

  const monthlyYield = totalAnnualYield / 12;
  const dailyYield = totalAnnualYield / 365;
  const totalMonthlyContributions = totalAnnualContributions / 12;
  const weightedAverageRate = totalCapital > 0 ? (totalAnnualYield / totalCapital) * 100 : 0;

  // Segunda pasada: enriquecer cada entidad con su % de concentración
  const entitiesCalculations: EntityCalculation[] = entities.map((entity) => {
    const isEntityActive = entity.isActive !== false;
    let entityBalance = 0;
    let entityAnnualYield = 0;

    const apartadosCalculations = entity.apartados.map((apt) => {
      const calc = calculateApartado(apt);
      if (isEntityActive && calc.isActive) {
        entityBalance += calc.balance;
        entityAnnualYield += calc.annualYield;
      }
      return calc;
    });

    const entityMonthlyYield = entityAnnualYield / 12;
    const entityDailyYield = entityAnnualYield / 365;
    const weightedRate = entityBalance > 0 ? (entityAnnualYield / entityBalance) * 100 : 0;
    const portfolioWeightPercent = totalCapital > 0 && isEntityActive ? (entityBalance / totalCapital) * 100 : 0;

    return {
      entityId: entity.id,
      name: entity.name,
      color: entity.color,
      isActive: isEntityActive,
      totalBalance: entityBalance,
      totalAnnualYield: entityAnnualYield,
      monthlyYield: entityMonthlyYield,
      dailyYield: entityDailyYield,
      weightedRate,
      portfolioWeightPercent,
      apartadosCalculations,
    };
  });

  // Hitos de proyección
  const milestones: Array<{ key: 'day1' | 'day7' | 'day28' | 'day90' | 'day180' | 'day365'; days: number; label: string }> = [
    { key: 'day1', days: 1, label: '1 Día' },
    { key: 'day7', days: 7, label: '7 Días' },
    { key: 'day28', days: 28, label: '28 Días' },
    { key: 'day90', days: 90, label: '90 Días' },
    { key: 'day180', days: 180, label: '180 Días' },
    { key: 'day365', days: 365, label: '1 Año' },
  ];

  const projections: PortfolioSummary['projections'] = {} as any;

  for (const m of milestones) {
    const proj = projectEntitiesForDays(entities, m.days);
    projections[m.key] = {
      days: m.days,
      label: m.label,
      accumulatedYield: proj.accumulatedYield,
      investedCapital: proj.investedCapital,
      totalBalance: proj.totalBalance,
    };
  }

  return {
    totalCapital,
    totalAnnualYield,
    monthlyYield,
    dailyYield,
    weightedAverageRate,
    totalMonthlyContributions,
    totalAnnualContributions,
    projections,
    entitiesCalculations,
  };
}

/**
 * Genera la serie de puntos temporales para la gráfica interactiva multi-año
 */
export function generateProjectionSeries(
  entities: Entity[],
  targetEntityId: string = 'all',
  horizonYears: ProjectionHorizon = 1
): ProjectionPoint[] {
  let daysList: Array<{ days: number; label: string }>;

  switch (horizonYears) {
    case 3:
      daysList = [
        { days: 0, label: 'Inicio' },
        { days: 180, label: '6 meses' },
        { days: 365, label: '1 año' },
        { days: 545, label: '1.5 años' },
        { days: 730, label: '2 años' },
        { days: 1095, label: '3 años' },
      ];
      break;
    case 5:
      daysList = [
        { days: 0, label: 'Inicio' },
        { days: 365, label: '1 año' },
        { days: 730, label: '2 años' },
        { days: 1095, label: '3 años' },
        { days: 1460, label: '4 años' },
        { days: 1825, label: '5 años' },
      ];
      break;
    case 10:
      daysList = [
        { days: 0, label: 'Inicio' },
        { days: 365, label: '1 año' },
        { days: 1095, label: '3 años' },
        { days: 1825, label: '5 años' },
        { days: 2555, label: '7 años' },
        { days: 3650, label: '10 años' },
      ];
      break;
    case 1:
    default:
      daysList = [
        { days: 0, label: 'Inicio' },
        { days: 30, label: '1 mes' },
        { days: 90, label: '3 meses' },
        { days: 180, label: '6 meses' },
        { days: 270, label: '9 meses' },
        { days: 365, label: '1 año' },
      ];
      break;
  }

  return daysList.map((item, timeIndex) => {
    const proj = projectEntitiesForDays(entities, item.days, targetEntityId);
    return {
      timeIndex,
      days: item.days,
      label: item.label,
      investedCapital: proj.investedCapital,
      totalBalance: proj.totalBalance,
      pureYield: proj.accumulatedYield,
      entityValues: proj.breakdown,
    };
  });
}

/**
 * Genera serie de proyección para cualquier número arbitrario de días (sincronizado con plazos)
 */
export function generateProjectionSeriesForDays(
  entities: Entity[],
  targetDays: number,
  targetEntityId: string | string[] = 'all'
): ProjectionPoint[] {
  let daysList: Array<{ days: number; label: string }> = [];

  if (targetDays <= 1) {
    daysList = [
      { days: 0, label: '0h' },
      { days: 0.25, label: '6h' },
      { days: 0.5, label: '12h' },
      { days: 0.75, label: '18h' },
      { days: 1, label: '24h' },
    ];
  } else if (targetDays <= 7) {
    daysList = [
      { days: 0, label: 'Día 0' },
      { days: 1, label: 'Día 1' },
      { days: 3, label: 'Día 3' },
      { days: 5, label: 'Día 5' },
      { days: 7, label: 'Día 7' },
    ];
  } else if (targetDays <= 30) {
    const step = Math.max(1, Math.round(targetDays / 5));
    daysList = [
      { days: 0, label: 'Día 0' },
      { days: step, label: `Día ${step}` },
      { days: step * 2, label: `Día ${step * 2}` },
      { days: step * 3, label: `Día ${step * 3}` },
      { days: step * 4, label: `Día ${step * 4}` },
      { days: targetDays, label: `Día ${targetDays}` },
    ];
  } else if (targetDays <= 90) {
    daysList = [
      { days: 0, label: 'Inicio' },
      { days: 15, label: '15 días' },
      { days: 30, label: '1 mes' },
      { days: 60, label: '2 meses' },
      { days: 90, label: '3 meses' },
    ];
  } else if (targetDays <= 180) {
    daysList = [
      { days: 0, label: 'Inicio' },
      { days: 30, label: '1 mes' },
      { days: 60, label: '2 meses' },
      { days: 90, label: '3 meses' },
      { days: 120, label: '4 meses' },
      { days: 180, label: '6 meses' },
    ];
  } else if (targetDays <= 365) {
    daysList = [
      { days: 0, label: 'Inicio' },
      { days: 60, label: '2 meses' },
      { days: 120, label: '4 meses' },
      { days: 180, label: '6 meses' },
      { days: 270, label: '9 meses' },
      { days: 365, label: '1 año' },
    ];
  } else if (targetDays <= 1095) {
    daysList = [
      { days: 0, label: 'Inicio' },
      { days: 180, label: '6 meses' },
      { days: 365, label: '1 año' },
      { days: 545, label: '1.5 años' },
      { days: 730, label: '2 años' },
      { days: targetDays, label: `${Math.round(targetDays / 365)} años` },
    ];
  } else {
    // Horizontes multianuales dinámicos (> 3 años)
    const totalYears = Math.max(1, Math.round(targetDays / 365));
    const numSteps = 5;
    daysList = [{ days: 0, label: 'Inicio' }];
    for (let s = 1; s <= numSteps; s++) {
      const yr = Math.round((totalYears * s) / numSteps);
      const daysVal = yr * 365;
      const yrLabel = yr === 1 ? '1 año' : `${yr} años`;
      if (!daysList.some((d) => d.days === daysVal)) {
        daysList.push({ days: daysVal, label: yrLabel });
      }
    }
  }

  return daysList.map((item, timeIndex) => {
    const proj = projectEntitiesForDays(entities, item.days, targetEntityId);
    return {
      timeIndex,
      days: item.days,
      label: item.label,
      investedCapital: proj.investedCapital,
      totalBalance: proj.totalBalance,
      pureYield: proj.accumulatedYield,
      entityValues: proj.breakdown,
    };
  });
}

/**
 * Calcula el rendimiento devengado para cualquier plazo de días específico
 */
export function calculateYieldForDays(entities: Entity[], days: number): number {
  if (days <= 0) return 0;
  const proj = projectEntitiesForDays(entities, days);
  return proj.accumulatedYield;
}

/**
 * Formateo de moneda con separador de miles y 2 decimales
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  const safeAmount = isNaN(amount) || !isFinite(amount) ? 0 : amount;
  return `${currency}${safeAmount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formateo de porcentaje
 */
export function formatPercent(percentage: number, decimals: number = 2): string {
  const safePercentage = isNaN(percentage) || !isFinite(percentage) ? 0 : percentage;
  return `${safePercentage.toFixed(decimals)}%`;
}

/**
 * Convierte un input de texto a número flotante
 */
export function parseInputNumber(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const clean = value.toString().replace(/[^0-9.-]+/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}
