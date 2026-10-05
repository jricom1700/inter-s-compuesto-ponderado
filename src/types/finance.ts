export type RateType = 'fixed' | 'tiered';

export type TieredSubtype = 'limit_with_yields' | 'limit_capped_excess';

export type CompoundingFrequency = 'daily' | 'monthly' | 'at_maturity';

export type ContributionFrequency = 'none' | 'weekly' | 'biweekly' | 'monthly';

export type ProjectionHorizon = 1 | 3 | 5 | 10;

export interface Apartado {
  id: string;
  name: string;
  rateType: RateType;
  tieredSubtype?: TieredSubtype;
  balance: number; // Monto total depositado actual
  // Tasa fija
  annualRate?: number;
  // Tasa escalonada con límite
  tierLimit?: number;
  baseRate?: number;
  excessRate?: number;
  // Capitalización
  compounding: CompoundingFrequency;
  // Aportaciones recurrentes
  contributionFrequency?: ContributionFrequency;
  contributionAmount?: number;
  isActive?: boolean;
  notes?: string;
}

export interface Entity {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isActive?: boolean;
  apartados: Apartado[];
}

export interface ApartadoCalculation {
  apartadoId: string;
  name: string;
  balance: number;
  rateType: RateType;
  tieredSubtype?: TieredSubtype;
  effectiveAnnualRate: number; // % efectiva
  annualYield: number; // Ganancia monetaria anual nominal
  monthlyYield: number; // Ganancia mensual estimada
  dailyYield: number; // Ganancia diaria estimada (24 horas)
  tier1Amount: number; // Monto dentro del límite o remunerable
  tier1Yield: number;
  tier2Amount: number; // Monto excedente
  tier2Yield: number;
  investedBase?: number; // Inversión base (límite original en limit_with_yields)
  priorYields?: number; // Rendimientos previos que ya ha obtenido
  contributionFrequency: ContributionFrequency;
  contributionAmount: number;
  totalContributionsAnnual: number;
  compounding: CompoundingFrequency;
  isActive: boolean;
}

export interface EntityCalculation {
  entityId: string;
  name: string;
  color: string;
  isActive: boolean;
  totalBalance: number;
  totalAnnualYield: number;
  monthlyYield: number;
  dailyYield: number; // Ganancia diaria estimada de la entidad
  weightedRate: number;
  portfolioWeightPercent: number; // % que representa del total del portafolio
  apartadosCalculations: ApartadoCalculation[];
}

export interface ProjectionMilestone {
  days: number;
  label: string;
  accumulatedYield: number;
  investedCapital: number;
  totalBalance: number;
}

export interface PortfolioSummary {
  totalCapital: number;
  totalAnnualYield: number;
  monthlyYield: number;
  dailyYield: number;
  weightedAverageRate: number;
  totalMonthlyContributions: number;
  totalAnnualContributions: number;
  projections: {
    day1: ProjectionMilestone;
    day7: ProjectionMilestone;
    day28: ProjectionMilestone;
    day90: ProjectionMilestone;
    day180: ProjectionMilestone;
    day365: ProjectionMilestone;
  };
  entitiesCalculations: EntityCalculation[];
}

export interface ProjectionPoint {
  timeIndex: number;
  days: number;
  label: string;
  investedCapital: number; // Capital aportado acumulado
  totalBalance: number; // Capital + Intereses acumulados
  pureYield: number; // Solo rendimiento acumulado
  entityValues: Record<string, { balance: number; yield: number; invested: number }>;
}

export interface TimeHorizon {
  id: string;
  label: string;
  shortLabel: string;
  fullName: string;
  days: number;
}

export const TIME_HORIZONS: TimeHorizon[] = [
  { id: '1d', label: '1D', shortLabel: '1D', fullName: 'Al Día (24 hrs)', days: 1 },
  { id: '7d', label: '7D', shortLabel: '7D', fullName: 'A 7 Días', days: 7 },
  { id: '1m', label: '1M', shortLabel: 'Mes', fullName: 'Al Mes (30 días)', days: 30 },
  { id: '1a', label: '1A', shortLabel: '1 Año', fullName: 'A 1 Año (365 días)', days: 365 },
];

export function resolveTimeHorizon(horizonId: string, customYears: number = 1): TimeHorizon {
  if (horizonId === '1d') {
    return { id: '1d', label: '1D', shortLabel: '1D', fullName: 'Al Día (24 hrs)', days: 1 };
  }
  if (horizonId === '7d') {
    return { id: '7d', label: '7D', shortLabel: '7D', fullName: 'A 7 Días', days: 7 };
  }
  if (horizonId === '1m') {
    return { id: '1m', label: '1M', shortLabel: 'Mes', fullName: 'Al Mes (30 días)', days: 30 };
  }
  if (horizonId === '1a' || horizonId === '1y') {
    return { id: '1a', label: '1A', shortLabel: '1A', fullName: 'A 1 Año (365 días)', days: 365 };
  }

  // Personalizado por el usuario: cualquier número mayor a 0 y múltiplo de 0.5
  const rawNum = Number(customYears);
  const validNum = isNaN(rawNum) || rawNum <= 0 ? 1 : rawNum;
  // Ajustar al múltiplo de 0.5 más cercano con un rango seguro de 0.5 a 50
  const safeYears = Math.min(50, Math.max(0.5, Math.round(validNum * 2) / 2));
  const days = Math.round(safeYears * 365);

  return {
    id: 'custom',
    label: `${safeYears}A`,
    shortLabel: `${safeYears} A`,
    fullName: `A ${safeYears} ${safeYears === 1 ? 'Año' : 'Años'} (${days} días)`,
    days,
  };
}

