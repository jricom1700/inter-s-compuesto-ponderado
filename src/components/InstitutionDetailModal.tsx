import React, { useEffect } from 'react';
import type { Entity, EntityCalculation } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/finance';
import {
  LandmarkIcon,
  XIcon,
  SparklesIcon,
  RepeatIcon,
  EyeOffIcon,
  CheckIcon,
} from './ui/Icons';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { EdgeGlow } from './ui/EdgeGlow';

interface InstitutionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Entity | null;
  calculation: EntityCalculation | null;
  onNavigateToAccounts?: () => void;
}

export const InstitutionDetailModal: React.FC<InstitutionDetailModalProps> = ({
  isOpen,
  onClose,
  entity,
  calculation,
  onNavigateToAccounts,
}) => {
  // Bloquear el scroll de la página completa y escuchar tecla Escape mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !entity || !calculation) return null;

  const color = calculation.color || entity.color || '#6366f1';
  const isPaused = entity.isActive === false;

  const compoundingLabel: Record<string, string> = {
    daily: 'Diaria',
    monthly: 'Mensual',
    at_maturity: 'Al Vencimiento',
  };

  const entityName = calculation.name || entity.name || 'Entidad';
  const nameInitial = entityName.charAt(0).toUpperCase() || 'E';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-institution-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/35 dark:bg-black/55 backdrop-blur-md animate-liquid-backdrop select-none overflow-y-auto"
      onClick={onClose}
    >
      {/* Floating Glass Bubble Window with identical clean design to the closed card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl p-5 sm:p-7 border liquid-glass my-auto animate-liquid-modal-bubble"
        style={{
          borderColor: isPaused ? 'transparent' : `${color}30`,
          boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.15), 0 5px 15px -4px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Brillo dinámico en las orillas de la ventana modal con el color del banco */}
        <EdgeGlow color={color} proximity={340} size={640} borderWidth={2.5} />

        {/* Modal Header idéntico al diseño cerrado */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200/60 dark:border-white/10 animate-liquid-stagger-1">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center text-white font-black text-base shrink-0"
              style={{
                backgroundColor: color,
                boxShadow: `0 3px 10px ${color}25`,
              }}
            >
              {nameInitial}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="modal-institution-title"
                  className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate"
                >
                  {entityName}
                </h3>
                {isPaused && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <EyeOffIcon size={12} />
                    <span>Pausada en simulación</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {calculation.apartadosCalculations.length}{' '}
                {calculation.apartadosCalculations.length === 1 ? 'apartado' : 'apartados'} &bull; Auditoría matemática detallada
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Cerrar ventana"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-white/70 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-white/10 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <XIcon size={17} />
          </button>
        </div>

        {/* Master Financial Bubbles idénticas a la tarjeta cerrada */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 animate-liquid-stagger-2">
          {/* Bubble 1: Capital */}
          <div
            className="p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between"
            style={{
              backgroundColor: `${color}08`,
              borderColor: `${color}20`,
            }}
          >
            <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
              Capital Total
            </span>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
              <AnimatedNumber value={calculation.totalBalance} />
            </div>
            <span
              className="text-[10px] font-bold mt-0.5 font-mono"
              style={{ color }}
            >
              {formatPercent(calculation.weightedRate)} tasa neta
            </span>
          </div>

          {/* Bubble 2: Al Día */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/40 border border-white/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
              Al Día
            </span>
            <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-zinc-200 font-mono tabular-nums mt-1">
              <AnimatedNumber value={calculation.dailyYield} prefix="+" />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
              24 horas
            </span>
          </div>

          {/* Bubble 3: Al Mes */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
              Al Mes
            </span>
            <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
              <AnimatedNumber value={calculation.monthlyYield} prefix="+" />
            </div>
            <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 font-semibold">
              Estimado 30d
            </span>
          </div>

          {/* Bubble 4: Al Año */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/40 border border-white/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
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
              <AnimatedNumber value={calculation.totalAnnualYield} prefix="+" />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 font-semibold">
              Proyección 365d
            </span>
          </div>
        </div>

        {/* Sección de Detalle Exhaustivo de Apartados con aparición fluida */}
        <div className="space-y-4 animate-liquid-stagger-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <SparklesIcon size={16} style={{ color }} />
              <span>Desglose Exhaustivo de Apartados ({calculation.apartadosCalculations.length})</span>
            </h4>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Cálculo matemático individual
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {entity.apartados.map((apt) => {
              const aptCalc = calculation.apartadosCalculations.find((a) => a.apartadoId === apt.id);
              if (!aptCalc) return null;

              const isAptPaused = apt.isActive === false || isPaused;
              const hasRecurring =
                apt.contributionFrequency &&
                apt.contributionFrequency !== 'none' &&
                (apt.contributionAmount || 0) > 0;

              return (
                <div
                  key={apt.id}
                  className={`rounded-3xl p-5 border transition-all duration-200 ${
                    isAptPaused
                      ? 'bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-65'
                      : 'bg-white/90 dark:bg-zinc-900/90 border-slate-200/80 dark:border-white/10 shadow-sm'
                  }`}
                  style={{
                    boxShadow: isAptPaused ? 'none' : `0 4px 14px -4px ${color}15, 0 2px 6px -2px rgba(0, 0, 0, 0.04)`,
                  }}
                >
                  {/* Apartado Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/60 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        {apt.name}
                      </span>
                      {isAptPaused && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          Pausado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Píldora de Tipo de Tasa */}
                      {apt.rateType === 'tiered' ? (
                        apt.tieredSubtype === 'limit_capped_excess' ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            Escalonada con Tope Estricto
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            Límite + Rendimientos a Tasa Máx.
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                          Tasa Fija ({formatPercent(apt.annualRate || 0)})
                        </span>
                      )}

                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        Cap. {compoundingLabel[apt.compounding] || 'Diaria'}
                      </span>
                    </div>
                  </div>

                  {/* Subtotales a 3 Columnas para el Apartado */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-black/35 border border-slate-200/60 dark:border-white/5 mb-3.5">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                        Saldo en Cuenta
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                        <AnimatedNumber value={apt.balance} />
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                        Ganancia / Día
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-zinc-200 font-mono tabular-nums">
                        <AnimatedNumber value={aptCalc.dailyYield} prefix="+" />
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                        Ganancia / Mes
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                        <AnimatedNumber value={aptCalc.monthlyYield} prefix="+" />
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
                        Ganancia / Año
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                        <AnimatedNumber value={aptCalc.annualYield} prefix="+" />
                      </span>
                    </div>
                  </div>

                  {/* Auditoría Matemática de la Regla */}
                  <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <CheckIcon size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                        {apt.rateType === 'fixed' && (
                          <span>
                            Rendimiento calculado sobre la tasa fija del <strong>{formatPercent(apt.annualRate || 0)}</strong> anual, capitalizable de forma {compoundingLabel[apt.compounding]?.toLowerCase() || 'diaria'}.
                          </span>
                        )}

                        {apt.rateType === 'tiered' && apt.tieredSubtype === 'limit_with_yields' && (
                          (aptCalc.priorYields ?? 0) > 0 ? (
                            <span>
                              Monto del tope: <strong>{formatCurrency(aptCalc.investedBase || 0)}</strong>. Rendimientos previos acumulados: <strong>{formatCurrency(aptCalc.priorYields)}</strong>. El saldo total ({formatCurrency(apt.balance)}) devenga la tasa máxima del <strong>{formatPercent(apt.baseRate || 0)}</strong> porque los rendimientos pasados se reinvierten al 100%. Esta modalidad no admite aportaciones periódicas externas.
                            </span>
                          ) : (
                            <span>
                              Tope remunerable: <strong>{formatCurrency(apt.tierLimit || 0)}</strong> a la tasa máxima del <strong>{formatPercent(apt.baseRate || 0)}</strong> anual con reinversión automática de rendimientos al 100%.
                            </span>
                          )
                        )}

                        {apt.rateType === 'tiered' && apt.tieredSubtype === 'limit_capped_excess' && (
                          <span>
                            Tramo 1 (hasta el límite de {formatCurrency(apt.tierLimit || 0)}): <strong>{formatCurrency(aptCalc.tier1Amount)}</strong> remunerado al <strong>{formatPercent(apt.baseRate || 0)}</strong>.
                            {aptCalc.tier2Amount > 0 ? (
                              <span> Tramo 2 (excedente): <strong>{formatCurrency(aptCalc.tier2Amount)}</strong> remunerado al <strong>{formatPercent(apt.excessRate || 0)}</strong>.</span>
                            ) : (
                              <span> No hay saldo excedente por encima del límite.</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {hasRecurring && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/40 dark:border-white/5 text-cyan-700 dark:text-cyan-300 font-semibold">
                        <RepeatIcon size={13} />
                        <span>
                          Aportación periódica programada: +{formatCurrency(apt.contributionAmount || 0)} ({apt.contributionFrequency}) &bull; Proyección de aportes: +{formatCurrency(aptCalc.totalContributionsAnnual)}/año
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="mt-7 pt-4 border-t border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 dark:text-zinc-500">
            Los cálculos son client-side y no transfieren ningún dato fuera de tu navegador.
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onNavigateToAccounts && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAccounts();
                }}
                className="relative overflow-hidden w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: `${color}10`,
                  borderColor: `${color}25`,
                  color: color,
                }}
              >
                <EdgeGlow color={color} proximity={180} size={250} />
                <LandmarkIcon size={14} />
                <span>Editar en Cuentas</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="relative overflow-hidden w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <EdgeGlow color="rgba(255, 255, 255, 0.95)" proximity={180} size={250} />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
