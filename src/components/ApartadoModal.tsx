import React, { useState, useEffect } from 'react';
import type {
  Apartado,
  RateType,
  CompoundingFrequency,
  TieredSubtype,
  ContributionFrequency,
} from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/finance';
import {
  XIcon,
  SparklesIcon,
  PercentIcon,
  DollarSignIcon,
  RepeatIcon,
  CalendarIcon,
} from './ui/Icons';
import { EdgeGlow } from './ui/EdgeGlow';

interface ApartadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apartado: Apartado) => void;
  initialApartado?: Apartado | null;
  entityName: string;
}

export const ApartadoModal: React.FC<ApartadoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialApartado,
  entityName,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [rateType, setRateType] = useState<RateType>('fixed');
  const [tieredSubtype, setTieredSubtype] = useState<TieredSubtype>('limit_with_yields');
  const [balance, setBalance] = useState<string>('10000');
  const [annualRate, setAnnualRate] = useState<string>('11.0');
  const [tierLimit, setTierLimit] = useState<string>('25000');
  const [baseRate, setBaseRate] = useState<string>('15.0');
  const [excessRate, setExcessRate] = useState<string>('5.0');
  const [compounding, setCompounding] = useState<CompoundingFrequency>('daily');
  const [contributionFrequency, setContributionFrequency] = useState<ContributionFrequency>('none');
  const [contributionAmount, setContributionAmount] = useState<string>('0');

  useEffect(() => {
    if (initialApartado) {
      setName(initialApartado.name);
      setRateType(initialApartado.rateType);
      setTieredSubtype(initialApartado.tieredSubtype || 'limit_with_yields');
      setBalance(initialApartado.balance.toString());
      setAnnualRate(initialApartado.annualRate?.toString() || '11.0');
      setTierLimit(initialApartado.tierLimit?.toString() || '25000');
      setBaseRate(initialApartado.baseRate?.toString() || '15.0');
      setExcessRate(initialApartado.excessRate?.toString() || '5.0');
      setCompounding(initialApartado.compounding || 'daily');
      setContributionFrequency(initialApartado.contributionFrequency || 'none');
      setContributionAmount(initialApartado.contributionAmount?.toString() || '0');
      setActiveStep(1);
    } else {
      setName('');
      setRateType('fixed');
      setTieredSubtype('limit_with_yields');
      setBalance('10000');
      setAnnualRate('11.0');
      setTierLimit('25000');
      setBaseRate('15.0');
      setExcessRate('5.0');
      setCompounding('daily');
      setContributionFrequency('none');
      setContributionAmount('0');
      setActiveStep(1);
    }
  }, [initialApartado, isOpen]);

  if (!isOpen) return null;

  const currentBalanceNum = Math.max(0, parseFloat(balance) || 0);
  const currentLimitNum = Math.max(0, parseFloat(tierLimit) || 0);
  const isLimitWithYields = rateType === 'tiered' && tieredSubtype === 'limit_with_yields';
  const isLimitFull = isLimitWithYields && currentBalanceNum >= currentLimitNum && currentLimitNum > 0;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalApartado: Apartado = {
      id: initialApartado?.id || `apt-${Date.now()}`,
      name: name.trim() || (rateType === 'tiered' ? 'Cuenta Escalonada' : 'Pagaré / Inversión'),
      rateType,
      balance: currentBalanceNum,
      compounding,
      contributionFrequency: isLimitFull ? 'none' : contributionFrequency,
      contributionAmount: isLimitFull ? 0 : Math.max(0, parseFloat(contributionAmount) || 0),
      notes: initialApartado?.notes || '',
    };

    if (rateType === 'fixed') {
      finalApartado.annualRate = Math.max(0, parseFloat(annualRate) || 0);
    } else {
      finalApartado.tieredSubtype = tieredSubtype;
      finalApartado.tierLimit = currentLimitNum;
      finalApartado.baseRate = Math.max(0, parseFloat(baseRate) || 0);
      finalApartado.excessRate = isLimitWithYields ? 0 : Math.max(0, parseFloat(excessRate) || 0);
    }

    onSave(finalApartado);
    onClose();
  };

  const commonNameChips = [
    'Saldo a la vista',
    'Pagaré 28 días',
    'Caja de ahorro',
    'Fondo de emergencia',
    'Inversión a plazo',
    'Ahorro meta',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative overflow-hidden w-full max-w-3xl liquid-glass rounded-3xl p-5 sm:p-7 my-6 border border-white/80 dark:border-zinc-700/40 shadow-2xl transition-all">
        {/* Brillo suave en las orillas de la ventana modal */}
        <EdgeGlow color="rgba(255, 255, 255, 0.75)" proximity={240} size={500} />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-zinc-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {initialApartado ? 'Editar Apartado o Subcuenta' : 'Nuevo Apartado o Subcuenta'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              En institución: <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{entityName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-500 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <XIcon size={19} />
          </button>
        </div>

        {/* Barra de progreso de 4 pasos */}
        <div className="grid grid-cols-4 gap-2 pt-4 pb-2">
          {[
            { step: 1, label: '1. Nombre' },
            { step: 2, label: '2. Monto' },
            { step: 3, label: '3. Tasa y Regla' },
            { step: 4, label: '4. Capitalización' },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveStep(item.step)}
              className={`text-left text-[11px] font-bold pb-1.5 border-b-2 transition-all cursor-pointer ${
                activeStep === item.step
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : activeStep > item.step
                  ? 'border-emerald-500 text-slate-700 dark:text-zinc-300'
                  : 'border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600'
              }`}
            >
              <div className="truncate">{item.label}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* ============================================================ */}
          {/* SECCIÓN 1: NOMBRE O IDENTIFICADOR */}
          {/* ============================================================ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-black/20">
            {/* Header del acordeón */}
            <div
              onClick={() => setActiveStep(1)}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === 1
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : name ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600'
                }`}>
                  1
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Nombre o Identificador
                </span>
              </div>
              {activeStep !== 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full font-mono truncate max-w-[200px]">
                    {name || 'Sin nombre'}
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Editar
                  </span>
                </div>
              )}
            </div>

            {/* Contenido desplegado */}
            {activeStep === 1 && (
              <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    ¿Cómo quieres identificar este apartado o inversión?
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej. Saldo a la vista, Pagaré 28 días, Caja de ahorro..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass-input text-sm text-slate-900 dark:text-white"
                  />
                </div>

                {/* Sugerencias rápidas */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1.5">
                    Sugerencias rápidas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {commonNameChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setName(chip)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                          name === chip
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white/60 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botón de Siguiente para avanzar al Monto */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <span>Siguiente: Monto</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECCIÓN 2: MONTO TOTAL DEPOSITADO */}
          {/* ============================================================ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-black/20">
            {/* Header del acordeón */}
            <div
              onClick={() => setActiveStep(2)}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === 2
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : currentBalanceNum > 0 ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600'
                }`}>
                  2
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Monto Total Depositado
                </span>
              </div>
              {activeStep !== 2 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full font-mono tabular-nums">
                    {formatCurrency(currentBalanceNum)} MXN
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Editar
                  </span>
                </div>
              )}
            </div>

            {/* Contenido desplegado */}
            {activeStep === 2 && (
              <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Saldo o capital actual en esta cuenta ($ MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <DollarSignIcon size={18} />
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      autoFocus
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-2xl liquid-glass-input text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums"
                    />
                  </div>
                </div>

                {/* Accesos rápidos de monto */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1.5">
                    Montos frecuentes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[5000, 10000, 25000, 50000, 100000, 200000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBalance(amt.toString())}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-mono font-bold ${
                          currentBalanceNum === amt
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white/60 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                        }`}
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    &larr; Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <span>Siguiente: Tasa y Regla</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECCIÓN 3: REGLA DE RENDIMIENTO Y TASAS */}
          {/* ============================================================ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-black/20">
            {/* Header del acordeón */}
            <div
              onClick={() => setActiveStep(3)}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === 3
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                }`}>
                  3
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Regla de Rendimiento y Tasas
                </span>
              </div>
              {activeStep !== 3 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                    {rateType === 'fixed'
                      ? `Tasa Fija (${annualRate}%)`
                      : tieredSubtype === 'limit_with_yields'
                      ? `Hasta ${formatCurrency(currentLimitNum)} @ ${baseRate}%`
                      : `Tramo ${baseRate}% / Excedente ${excessRate}%`}
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Editar
                  </span>
                </div>
              )}
            </div>

            {/* Contenido desplegado con aprovechamiento de ancho horizontal */}
            {activeStep === 3 && (
              <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800/80 space-y-4">
                {/* 3 Modelos organizados horizontalmente */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-2">
                    Selecciona cómo remunera la institución para este apartado:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Modelo 1: Tasa Fija */}
                    <button
                      type="button"
                      onClick={() => setRateType('fixed')}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        rateType === 'fixed'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold ring-2 ring-indigo-500/30 shadow-sm'
                          : 'border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <PercentIcon size={14} />
                        </div>
                        {rateType === 'fixed' && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Tasa Fija</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight">
                          Rendimiento constante sobre el 100% del saldo
                        </div>
                      </div>
                    </button>

                    {/* Modelo 2: Límite + Rendimientos a Tasa Máx */}
                    <button
                      type="button"
                      onClick={() => {
                        setRateType('tiered');
                        setTieredSubtype('limit_with_yields');
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        rateType === 'tiered' && tieredSubtype === 'limit_with_yields'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold ring-2 ring-indigo-500/30 shadow-sm'
                          : 'border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <SparklesIcon size={14} />
                        </div>
                        {rateType === 'tiered' && tieredSubtype === 'limit_with_yields' && (
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Límite + Rendimientos</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight">
                          Tope de depósito; rendimientos al 100% a tasa máx.
                        </div>
                      </div>
                    </button>

                    {/* Modelo 3: Límite con Excedente */}
                    <button
                      type="button"
                      onClick={() => {
                        setRateType('tiered');
                        setTieredSubtype('limit_capped_excess');
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        rateType === 'tiered' && tieredSubtype === 'limit_capped_excess'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold ring-2 ring-indigo-500/30 shadow-sm'
                          : 'border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <DollarSignIcon size={14} />
                        </div>
                        {rateType === 'tiered' && tieredSubtype === 'limit_capped_excess' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Límite con Excedente</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight">
                          Tramo 1 a tasa alta, y saldo excedente a menor tasa
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Campos numéricos distribuidos horizontalmente según el modelo */}
                {rateType === 'fixed' ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/70 dark:border-white/10">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Tasa Fija Anual (%)
                    </label>
                    <div className="relative max-w-sm">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <PercentIcon size={16} />
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                        value={annualRate}
                        onChange={(e) => setAnnualRate(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl liquid-glass-input text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums"
                      />
                    </div>
                  </div>
                ) : isLimitWithYields ? (
                  <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Tope Máximo de Depósito ($ MXN)
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={tierLimit}
                          onChange={(e) => setTierLimit(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl liquid-glass-input text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Tasa Anual Máxima (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          required
                          value={baseRate}
                          onChange={(e) => setBaseRate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl liquid-glass-input text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                      El saldo hasta <strong>{formatCurrency(currentLimitNum)}</strong> genera la tasa máxima ({formatPercent(parseFloat(baseRate) || 0)}). Los rendimientos generados continúan reinvirtiéndose a esa misma tasa.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Límite Tramo 1 ($)
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={tierLimit}
                          onChange={(e) => setTierLimit(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl liquid-glass-input text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Tasa Tramo 1 (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          required
                          value={baseRate}
                          onChange={(e) => setBaseRate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl liquid-glass-input text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Tasa Excedente (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          required
                          value={excessRate}
                          onChange={(e) => setExcessRate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl liquid-glass-input text-sm font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    &larr; Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <span>Siguiente: Capitalización</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECCIÓN 4: CAPITALIZACIÓN Y APORTACIONES */}
          {/* ============================================================ */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-black/20">
            {/* Header del acordeón */}
            <div
              onClick={() => setActiveStep(4)}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === 4
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-600'
                }`}>
                  4
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Capitalización y Aportaciones Periódicas
                </span>
              </div>
              {activeStep !== 4 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                    {compounding === 'daily' ? 'Diario' : compounding === 'monthly' ? 'Mensual' : 'Al Vto'}
                    {contributionFrequency !== 'none' ? ` + Aporte ${formatCurrency(parseFloat(contributionAmount) || 0)}` : ''}
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Editar
                  </span>
                </div>
              )}
            </div>

            {/* Contenido desplegado en 2 columnas paralelas bien aprovechadas */}
            {activeStep === 4 && (
              <div className="p-4 pt-1 border-t border-slate-100 dark:border-zinc-800/80 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Columna Izquierda: Frecuencia de Reinversión */}
                  <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-slate-200/70 dark:border-white/10 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Reinversión de Rendimientos
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'daily', label: 'Diario', desc: 'Capitalización cada 24 hrs' },
                        { id: 'monthly', label: 'Mensual', desc: 'Cada 30 días' },
                        { id: 'at_maturity', label: 'Al Vencimiento', desc: 'Simple al plazo' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCompounding(opt.id as CompoundingFrequency)}
                          className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                            compounding === opt.id
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                              : 'border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs">{opt.label}</div>
                            <div className="text-[10px] opacity-75 font-normal">{opt.desc}</div>
                          </div>
                          {compounding === opt.id && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Columna Derecha: Aportaciones Periódicas */}
                  <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/50 border border-slate-200/70 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Aportaciones Periódicas
                      </label>
                      {contributionFrequency !== 'none' && (
                        <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                          Activa
                        </span>
                      )}
                    </div>

                    {isLimitWithYields ? (
                      <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                        Esta modalidad con tope fijo institucional ({formatCurrency(currentLimitNum)}) no admite aportaciones periódicas programadas.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                            Frecuencia
                          </label>
                          <select
                            value={contributionFrequency}
                            onChange={(e) => setContributionFrequency(e.target.value as ContributionFrequency)}
                            className="w-full px-3 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 dark:text-white"
                          >
                            <option value="none">Sin aportaciones</option>
                            <option value="weekly">Semanal (cada 7 días)</option>
                            <option value="biweekly">Quincenal (cada 14 días)</option>
                            <option value="monthly">Mensual (cada 30 días)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                            Monto por Aportación ($ MXN)
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            disabled={contributionFrequency === 'none'}
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            placeholder="Ej. 1000"
                            className="w-full px-3 py-2 rounded-xl liquid-glass-input text-xs font-mono font-bold text-slate-900 dark:text-white disabled:opacity-40"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de navegación y Guardar */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    &larr; Anterior
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-500/25 flex items-center gap-1.5"
                  >
                    <SparklesIcon size={14} />
                    <span>{initialApartado ? 'Guardar Cambios' : 'Agregar Apartado'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botón de Cancelar global al fondo */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
