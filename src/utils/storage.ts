import type { Entity } from '../types/finance';

const STORAGE_KEY = 'tasa_ponderada_portfolio_v1';

export const DEFAULT_ENTITIES: Entity[] = [
  {
    id: 'entidad-debito-rendimiento',
    name: 'Cuenta de Débito con Rendimiento',
    color: '#6366f1', // Indigo
    icon: 'wallet',
    apartados: [
      {
        id: 'apt-vista-escalonada',
        name: 'Saldo a la Vista (Escalonado)',
        rateType: 'tiered',
        tieredSubtype: 'limit_with_yields',
        balance: 30000,
        tierLimit: 25000,
        baseRate: 15.0,
        excessRate: 5.0,
        compounding: 'daily',
        notes: 'Hasta $25,000 rinde 15% y los rendimientos capitalizan a tasa máxima; excedente al 5%',
      },
      {
        id: 'apt-caja-ahorro',
        name: 'Caja de Ahorro con Rendimiento',
        rateType: 'fixed',
        balance: 15000,
        annualRate: 13.0,
        compounding: 'daily',
        notes: 'Liquidez 24/7 con interés diario',
      },
    ],
  },
  {
    id: 'entidad-fondo-gubernamental',
    name: 'Fondo Gubernamental y Valores',
    color: '#10b981', // Emerald
    icon: 'landmark',
    apartados: [
      {
        id: 'apt-bonos-28d',
        name: 'Valores a 28 Días',
        rateType: 'fixed',
        balance: 50000,
        annualRate: 11.25,
        compounding: 'monthly',
        notes: 'Subasta semanal, reinversión mensual',
      },
      {
        id: 'apt-fondo-diario',
        name: 'Fondo de Liquidez Diaria',
        rateType: 'fixed',
        balance: 20000,
        annualRate: 10.75,
        compounding: 'daily',
        notes: 'Disponible en días hábiles bancarios',
      },
    ],
  },
  {
    id: 'entidad-pagare-plazo',
    name: 'Pagaré a Plazo e Instrumentos',
    color: '#a855f7', // Purple
    icon: 'layers',
    apartados: [
      {
        id: 'apt-pagare-90d',
        name: 'Pagaré a Plazo 90 Días',
        rateType: 'fixed',
        balance: 40000,
        annualRate: 12.5,
        compounding: 'at_maturity',
        notes: 'Pago de capital e intereses al vencimiento',
      },
    ],
  },
];

export function loadPortfolioFromStorage(): Entity[] {
  if (typeof window === 'undefined') {
    return DEFAULT_ENTITIES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_ENTITIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Error loading portfolio from localStorage:', err);
  }

  return DEFAULT_ENTITIES;
}

export function savePortfolioToStorage(entities: Entity[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
  } catch (err) {
    console.error('Error saving portfolio to localStorage:', err);
  }
}

export function resetPortfolioToDefault(): Entity[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENTITIES));
    } catch (err) {
      console.error('Error resetting portfolio:', err);
    }
  }
  return JSON.parse(JSON.stringify(DEFAULT_ENTITIES));
}

export function clearPortfolioData(): Entity[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Error clearing portfolio:', err);
    }
  }
  return [];
}

export function exportPortfolioToJSON(entities: Entity[]): string {
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      entities,
    },
    null,
    2
  );
}

export function importPortfolioFromJSON(jsonString: string): Entity[] {
  const data = JSON.parse(jsonString);
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.entities)) {
    return data.entities;
  }
  throw new Error('El archivo no contiene un formato de portafolio válido');
}
