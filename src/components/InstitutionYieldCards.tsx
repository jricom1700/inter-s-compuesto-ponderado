import React from 'react';
import type { Entity, PortfolioSummary } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/finance';
import {
  LandmarkIcon,
  EyeOffIcon,
} from './ui/Icons';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { EdgeGlow } from './ui/EdgeGlow';

interface InstitutionYieldCardsProps {
  entities: Entity[];
  summary: PortfolioSummary;
  selectedHorizonId: string;
  onNavigateToAccounts: () => void;
  onSelectInstitution: (entityId: string) => void;
}

export const InstitutionYieldCards: React.FC<InstitutionYieldCardsProps> = ({
  entities,
  summary,
  onNavigateToAccounts,
  onSelectInstitution,
}) => {
  if (entities.length === 0) return null;

  return (
    <div className="liquid-glass glass-corner-flare rounded-3xl p-6 border border-white/80 dark:border-white/10 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/50 dark:border-white/10">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <LandmarkIcon size={15} />
            </div>
            <span>Rendimientos Detallados por Institución</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Haz clic en cualquier banco para abrir la ventana flotante con todos sus apartados, reglas y matemáticas
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToAccounts}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LandmarkIcon size={13} />
          <span>Gestionar Cuentas ({entities.length})</span>
        </button>
      </div>

      {/* Grid of Colored Liquid Glass Cards with Custom Aura Light */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary.entitiesCalculations.map((c) => {
          const entityObj = entities.find((e) => e.id === c.entityId);
          const isPaused = entityObj?.isActive === false;
          const color = c.color || '#6366f1';

          return (
            <div
              key={c.entityId}
              role="button"
              tabIndex={0}
              onClick={() => onSelectInstitution(c.entityId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectInstitution(c.entityId);
                }
              }}
              className={`group relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-300 border cursor-pointer hover:scale-[1.015] select-none liquid-glass ${
                isPaused ? 'opacity-65 grayscale-[30%]' : ''
              }`}
              style={{
                borderColor: isPaused ? 'transparent' : `${color}30`,
                boxShadow: isPaused
                  ? 'none'
                  : `0 8px 25px -8px ${color}18, 0 3px 10px -3px rgba(0, 0, 0, 0.05)`,
              }}
            >
              {/* Brillo dinámico en las orillas con el color del banco y reflejo líquido de superficie */}
              {!isPaused && <EdgeGlow color={color} proximity={340} size={640} borderWidth={2.5} />}

              {/* Luz ambiental sutil del color que el usuario seleccionó */}
              <div
                className="absolute -top-14 -left-14 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 opacity-8 group-hover:opacity-18"
                style={{ backgroundColor: color }}
              />
              <div
                className="absolute -bottom-14 -right-14 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 opacity-5 group-hover:opacity-12"
                style={{ backgroundColor: color }}
              />

              {/* Bank Header Bubble */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center text-white font-black text-base shrink-0 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 3px 10px ${color}25`,
                    }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {c.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      {c.apartadosCalculations.length}{' '}
                      {c.apartadosCalculations.length === 1 ? 'apartado' : 'apartados'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPaused && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <EyeOffIcon size={12} />
                      <span>Pausada</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Master Financial Bubbles: Capital + Tasas + Rendimientos (Exactos y Verificados) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                {/* Bubble 1: Capital */}
                <div
                  className="p-3 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors"
                  style={{
                    backgroundColor: `${color}08`,
                    borderColor: `${color}20`,
                  }}
                >
                  <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
                    Capital Total
                  </span>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                    <AnimatedNumber value={c.totalBalance} />
                  </div>
                  <span
                    className="text-[10px] font-bold mt-0.5 font-mono"
                    style={{ color }}
                  >
                    {formatPercent(c.weightedRate)} tasa neta
                  </span>
                </div>

                {/* Bubble 2: Al Día (Rendimiento diario verificado) */}
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/40 border border-white/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
                    Al Día
                  </span>
                  <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-zinc-200 font-mono tabular-nums mt-1">
                    <AnimatedNumber value={c.dailyYield} prefix="+" />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    24 horas
                  </span>
                </div>

                {/* Bubble 3: Al Mes */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                    Al Mes
                  </span>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                    <AnimatedNumber value={c.monthlyYield} prefix="+" />
                  </div>
                  <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 font-semibold">
                    Estimado 30d
                  </span>
                </div>

                {/* Bubble 4: Al Año */}
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-black/40 border border-white/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                  <span
                    className="text-[9px] uppercase font-bold block"
                    style={{ color }}
                  >
                    Al Año
                  </span>
                  <div
                    className="text-sm sm:text-base font-extrabold font-mono tabular-nums mt-1"
                    style={{ color }}
                  >
                    <AnimatedNumber value={c.totalAnnualYield} prefix="+" />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 font-semibold">
                    Proyección 365d
                  </span>
                </div>
              </div>

              {/* Chips de previsualización de apartados */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {entityObj?.apartados.map((apt) => (
                  <span
                    key={apt.id}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-white/60 dark:bg-black/30 border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-zinc-300 flex items-center gap-1.5"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold">{apt.name}</span>
                    <span className="font-mono text-slate-400 dark:text-zinc-500">
                      ({formatCurrency(apt.balance)})
                    </span>
                  </span>
                ))}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
