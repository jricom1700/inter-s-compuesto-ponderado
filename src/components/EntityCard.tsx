import React, { useState } from 'react';
import type { Entity, Apartado, EntityCalculation } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/finance';
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  CopyIcon,
  LayersIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  RepeatIcon,
  SparklesIcon,
  EyeIcon,
  EyeOffIcon,
} from './ui/Icons';
import { EdgeGlow } from './ui/EdgeGlow';

interface EntityCardProps {
  entity: Entity;
  calculation: EntityCalculation;
  onEditEntity: (entity: Entity) => void;
  onDeleteEntity: (entityId: string) => void;
  onDuplicateEntity: (entity: Entity) => void;
  onAddApartado: (entityId: string) => void;
  onEditApartado: (entityId: string, apartado: Apartado) => void;
  onDeleteApartado: (entityId: string, apartadoId: string) => void;
  onDuplicateApartado: (entityId: string, apartado: Apartado) => void;
  onToggleEntityActive?: (entityId: string) => void;
  onToggleApartadoActive?: (entityId: string, apartadoId: string) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  calculation,
  onEditEntity,
  onDeleteEntity,
  onDuplicateEntity,
  onAddApartado,
  onEditApartado,
  onDeleteApartado,
  onDuplicateApartado,
  onToggleEntityActive,
  onToggleApartadoActive,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const compoundingLabel: Record<string, string> = {
    daily: 'Diaria',
    monthly: 'Mensual',
    at_maturity: 'Al Vencimiento',
  };

  const contributionFreqLabel: Record<string, string> = {
    weekly: 'semanal',
    biweekly: 'quincenal',
    monthly: 'mensual',
    none: 'ninguna',
  };

  const isEntityActive = entity.isActive !== false;

  return (
    <div
      className={`relative overflow-hidden liquid-glass rounded-3xl p-6 transition-all duration-300 shadow-xl border border-white/80 dark:border-white/10 ${
        !isEntityActive ? 'opacity-65 grayscale-[30%] bg-slate-100/40 dark:bg-zinc-900/40' : ''
      }`}
    >
      {/* Brillo dinámico en las orillas con el color de la institución y reflejo líquido de superficie */}
      {isEntityActive && <EdgeGlow color={`${entity.color}dd`} proximity={340} size={640} borderWidth={2.5} />}

      {/* Entity Header / Accordion Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-10 rounded-full shadow-sm shrink-0"
            style={{ backgroundColor: entity.color }}
          />
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {entity.name}
              </h3>
              {!isEntityActive && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Pausada
                </span>
              )}
              <button
                onClick={() => onEditEntity(entity)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Editar nombre y color de la entidad"
              >
                <EditIcon size={14} />
              </button>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {entity.apartados.length}{' '}
              {entity.apartados.length === 1 ? 'apartado' : 'apartados'}
            </span>
          </div>
        </div>

        {/* Entity Subtotal KPIs: Clean data capture (subtotal & weighted rate) */}
        <div className="flex items-center flex-wrap gap-4 sm:gap-6 bg-white/50 dark:bg-black/25 px-4 py-2 rounded-2xl border border-white/50 dark:border-white/5">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">
              Capital Subtotal
            </div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {formatCurrency(calculation.totalBalance)}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">
              Tasa Ponderada
            </div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {formatPercent(calculation.weightedRate)}
            </div>
          </div>

          {/* Action buttons & Accordion Toggle */}
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-zinc-800 pl-2">
            {onToggleEntityActive && (
              <button
                onClick={() => onToggleEntityActive(entity.id)}
                title={
                  isEntityActive
                    ? 'Pausar entidad en cálculos y gráfica'
                    : 'Activar entidad en cálculos y gráfica'
                }
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  !isEntityActive
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25'
                    : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                {isEntityActive ? <EyeIcon size={15} /> : <EyeOffIcon size={15} />}
              </button>
            )}
            <button
              onClick={() => onDuplicateEntity(entity)}
              title="Duplicar entidad completa"
              className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
            >
              <CopyIcon size={14} />
            </button>
            <button
              onClick={() => onDeleteEntity(entity.id)}
              title="Eliminar entidad"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <TrashIcon size={14} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Colapsar apartados' : 'Expandir apartados'}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Apartados List (Collapsible Accordion) */}
      {isExpanded && (
        <div className="mt-5 space-y-3 transition-all duration-300">
          {entity.apartados.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 text-center">
              <LayersIcon size={24} className="mx-auto text-slate-400 dark:text-zinc-500 mb-2 opacity-60" />
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
                No hay apartados en esta entidad. Agrega uno para calcular sus rendimientos.
              </p>
              <button
                onClick={() => onAddApartado(entity.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/20 transition-all cursor-pointer"
              >
                <PlusIcon size={14} />
                <span>Agregar Apartado</span>
              </button>
            </div>
          ) : (
            entity.apartados.map((apt) => {
              const aptCalc = calculation.apartadosCalculations.find(
                (c) => c.apartadoId === apt.id
              );
              if (!aptCalc) return null;

              const hasRecurring =
                apt.contributionFrequency &&
                apt.contributionFrequency !== 'none' &&
                (apt.contributionAmount || 0) > 0;

              const isAptActive = apt.isActive !== false && isEntityActive;

              return (
                <div
                  key={apt.id}
                  className={`liquid-glass-subtle rounded-2xl p-4 transition-all duration-200 hover:border-indigo-500/30 group ${
                    apt.isActive === false ? 'opacity-50 grayscale-[40%]' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Info Left */}
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {apt.name}
                        </h4>

                        {/* Inactive badge */}
                        {apt.isActive === false && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            Pausado
                          </span>
                        )}

                        {/* Badge Tipo de Tasa */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            apt.rateType === 'tiered'
                              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                              : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20'
                          }`}
                        >
                          {apt.rateType === 'tiered'
                            ? apt.tieredSubtype === 'limit_capped_excess'
                              ? 'Escalonada (Límite Estricto)'
                              : 'Escalonada (Rendimientos a Tasa Máx.)'
                            : 'Tasa Fija'}
                        </span>

                        {/* Capitalización */}
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          Cap. {compoundingLabel[apt.compounding] || 'Diaria'}
                        </span>

                        {/* Recurring contributions badge */}
                        {hasRecurring && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                            <RepeatIcon size={11} />
                            +{formatCurrency(apt.contributionAmount || 0)} / {contributionFreqLabel[apt.contributionFrequency || 'none']}
                          </span>
                        )}
                      </div>

                      {/* Desglose de tasa / tramos */}
                      <div className="text-xs text-slate-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {apt.rateType === 'fixed' ? (
                          <span>
                            Tasa anual: <strong className="text-slate-800 dark:text-zinc-200">{formatPercent(apt.annualRate || 0)}</strong>
                          </span>
                        ) : apt.tieredSubtype === 'limit_with_yields' ? (
                          aptCalc.priorYields && aptCalc.priorYields > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-slate-700 dark:text-zinc-300 font-medium">
                                Inversión base: {formatCurrency(aptCalc.investedBase || 0)}
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                (+{formatCurrency(aptCalc.priorYields)} rendimientos previos)
                              </span>
                              <span>&bull;</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                Todo al {formatPercent(apt.baseRate || 0)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Límite: {formatCurrency(apt.tierLimit || 0)} @ {formatPercent(apt.baseRate || 0)} (Rendimientos reinvertidos a tasa máx.)
                            </span>
                          )
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Tramo 1 ({formatCurrency(aptCalc.tier1Amount)} @ {formatPercent(apt.baseRate || 0)})
                            </span>
                            {aptCalc.tier2Amount > 0 && (
                              <>
                                <span>+</span>
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  Excedente ({formatCurrency(aptCalc.tier2Amount)} @ {formatPercent(apt.excessRate || 0)})
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        {apt.notes && (
                          <span className="italic text-[11px] text-slate-400 dark:text-zinc-500">&bull; {apt.notes}</span>
                        )}
                      </div>
                    </div>

                    {/* Financial Values & Actions Right (Capital & Actions only) */}
                    <div className="flex items-center justify-between md:justify-end gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/50 dark:border-zinc-800">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">
                          Capital
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                          {formatCurrency(apt.balance)}
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1">
                        {onToggleApartadoActive && (
                          <button
                            onClick={() => onToggleApartadoActive(entity.id, apt.id)}
                            title={
                              apt.isActive !== false
                                ? 'Pausar apartado en cálculos'
                                : 'Activar apartado en cálculos'
                            }
                            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                              apt.isActive === false
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25'
                                : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10'
                            }`}
                          >
                            {apt.isActive !== false ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
                          </button>
                        )}
                        <button
                          onClick={() => onEditApartado(entity.id, apt)}
                          title="Editar apartado"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          onClick={() => onDuplicateApartado(entity.id, apt)}
                          title="Duplicar apartado"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                        >
                          <CopyIcon size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteApartado(entity.id, apt.id)}
                          title="Eliminar apartado"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Add Apartado Button (only when entity already has apartados) */}
          {entity.apartados.length > 0 && (
            <button
              onClick={() => onAddApartado(entity.id)}
              className="relative overflow-hidden w-full py-2.5 px-4 rounded-2xl border border-dashed border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <EdgeGlow color={`${entity.color}dd`} proximity={190} size={320} />
              <PlusIcon size={14} />
              <span>Agregar Nuevo Apartado a {entity.name}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
