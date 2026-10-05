import React from 'react';
import { LiquidCard } from './ui/LiquidCard';
import {
  WalletIcon,
  PercentIcon,
  CalendarIcon,
  SparklesIcon,
  RepeatIcon,
} from './ui/Icons';
import type { PortfolioSummary, Entity } from '../types/finance';
import { resolveTimeHorizon } from '../types/finance';
import { formatCurrency, formatPercent, calculateYieldForDays } from '../utils/finance';
import { TimeHorizonSlider } from './ui/TimeHorizonSlider';
import { AnimatedNumber } from './ui/AnimatedNumber';

interface KpiCardsProps {
  summary: PortfolioSummary;
  entities: Entity[];
  selectedHorizonId: string;
  onSelectHorizon: (horizonId: string) => void;
  customYears: number;
  onCustomYearsChange: (years: number) => void;
  scrollProgress?: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  summary,
  entities,
  selectedHorizonId,
  onSelectHorizon,
  customYears,
  onCustomYearsChange,
  scrollProgress = 0,
}) => {
  const activeHorizon = resolveTimeHorizon(selectedHorizonId, customYears);

  const totalApartados = summary.entitiesCalculations.reduce(
    (acc, cur) => acc + cur.apartadosCalculations.length,
    0
  );

  // Rendimiento devengado para el horizonte de tiempo sincronizado
  const displayYield = calculateYieldForDays(entities, activeHorizon.days);
  const displayBalance = summary.totalCapital + displayYield;

  // Escala fluida y apilamiento reactivo al hacer scroll
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const scale = isMobile ? 1 : 1 - scrollProgress * 0.05;
  const translateY = isMobile ? 0 : -scrollProgress * 12;

  return (
    <section
      className="space-y-6 transition-all duration-300 ease-out origin-top"
      style={{
        transform: isMobile ? 'none' : `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        filter: 'none',
      }}
      aria-label="Métricas Principales"
    >
      {/* 3 Main Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Capital Total Consolidado */}
        <LiquidCard glow="indigo" className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Capital Consolidado
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <WalletIcon size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 tabular-nums font-mono">
            <AnimatedNumber value={summary.totalCapital} />
          </div>
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-zinc-800/80 font-medium">
              {summary.entitiesCalculations.filter((e) => e.isActive).length}{' '}
              {summary.entitiesCalculations.filter((e) => e.isActive).length === 1 ? 'Entidad activa' : 'Entidades activas'}
            </span>
            <span>&bull;</span>
            <span>
              {totalApartados}{' '}
              {totalApartados === 1 ? 'Apartado' : 'Apartados'}
            </span>
            {summary.totalMonthlyContributions > 0 && (
              <>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 font-semibold text-cyan-600 dark:text-cyan-400">
                  <RepeatIcon size={12} />
                  +{formatCurrency(summary.totalMonthlyContributions)}/mes
                </span>
              </>
            )}
          </div>
        </LiquidCard>

        {/* Card 2: Tasa Anual Ponderada Global */}
        <LiquidCard glow="emerald" className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Tasa Ponderada Global
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PercentIcon size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300 bg-clip-text text-transparent tabular-nums font-mono">
              <AnimatedNumber
                value={summary.weightedAverageRate}
                formatFn={(v) => formatPercent(v)}
              />
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              anualizada
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <SparklesIcon size={14} />
            <span>Ponderada estrictamente por capital activo</span>
          </div>
        </LiquidCard>

        {/* Card 3: Ganancia Devengada Sincronizada con el Slider */}
        <LiquidCard glow="purple" className="p-6">
          <div className="flex flex-col gap-3 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  Rendimiento ({activeHorizon.shortLabel})
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {activeHorizon.fullName}
                </span>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <CalendarIcon size={17} />
              </div>
            </div>

            {/* Synchronized Slider with Streamlined Options and Custom Years */}
            <TimeHorizonSlider
              selectedHorizonId={selectedHorizonId}
              onSelectHorizon={onSelectHorizon}
              customYears={customYears}
              onCustomYearsChange={onCustomYearsChange}
              allowDaily={true}
              showIcon={false}
            />
          </div>

          <div className="flex items-baseline gap-2 mb-1.5">
            <AnimatedNumber
              value={displayYield}
              prefix="+"
              className="text-3xl font-extrabold tracking-tight tabular-nums font-mono text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Saldo acumulado estimado:{' '}
            <strong className="text-slate-800 dark:text-zinc-200 font-mono">
              <AnimatedNumber value={displayBalance} />
            </strong>
          </div>
        </LiquidCard>
      </div>
    </section>
  );
};
