import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Entity, ProjectionPoint } from '../types/finance';
import { resolveTimeHorizon } from '../types/finance';
import { generateProjectionSeriesForDays, formatCurrency } from '../utils/finance';
import {
  TrendingUpIcon,
  LayersIcon,
  Maximize2Icon,
  Minimize2Icon,
  ChevronDownIcon,
  CheckIcon,
  XIcon,
} from './ui/Icons';
import { TimeHorizonSlider } from './ui/TimeHorizonSlider';
import { EdgeGlow } from './ui/EdgeGlow';

interface ChartProjectionProps {
  entities: Entity[];
  selectedHorizonId: string;
  onSelectHorizon: (horizonId: string) => void;
  customYears: number;
  onCustomYearsChange: (years: number) => void;
}

export const ChartProjection: React.FC<ChartProjectionProps> = ({
  entities,
  selectedHorizonId,
  onSelectHorizon,
  customYears,
  onCustomYearsChange,
}) => {
  // Selección múltiple de entidades con checkboxes (por defecto todas seleccionadas)
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>(() =>
    entities.map((e) => e.id)
  );
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincronizar selección si cambian las entidades registradas
  useEffect(() => {
    setSelectedEntityIds((prev) => {
      const valid = prev.filter((id) => entities.some((e) => e.id === id));
      if (valid.length === 0 && entities.length > 0) {
        return entities.map((e) => e.id);
      }
      return valid;
    });
  }, [entities]);

  const isAllSelected =
    entities.length > 0 && selectedEntityIds.length === entities.length;

  const toggleAll = () => {
    if (isAllSelected) {
      // Dejar al menos la primera para que la gráfica no quede vacía
      setSelectedEntityIds(entities.length > 0 ? [entities[0].id] : []);
    } else {
      setSelectedEntityIds(entities.map((e) => e.id));
    }
  };

  const toggleEntity = (entityId: string) => {
    setSelectedEntityIds((prev) => {
      if (prev.includes(entityId)) {
        if (prev.length <= 1) return prev; // Mantener al menos una entidad seleccionada
        return prev.filter((id) => id !== entityId);
      } else {
        return [...prev, entityId];
      }
    });
  };

  // Cierre de dropdown al hacer clic fuera
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Manejo de tecla Escape y bloqueo de scroll en modo pantalla completa
  useEffect(() => {
    if (!isFullscreen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        if (typeof document !== 'undefined' && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // En la gráfica no tiene sentido ver a 1 día, inicia desde 7d
  const effectiveHorizonId = selectedHorizonId === '1d' ? '7d' : selectedHorizonId;
  const activeHorizon = resolveTimeHorizon(effectiveHorizonId, customYears);

  const series: ProjectionPoint[] = generateProjectionSeriesForDays(
    entities,
    activeHorizon.days,
    isAllSelected ? 'all' : selectedEntityIds
  );

  // Determinar límites de escala en el eje Y adaptados al periodo elegido (zoom dinámico)
  const { minVal, maxVal } = useMemo(() => {
    const allBalances = series.map((p) => p.totalBalance);
    const allInvested = series.map((p) => p.investedCapital);
    const rawMin = Math.min(...allBalances, ...allInvested);
    const rawMax = Math.max(...allBalances, ...allInvested);

    if (rawMax <= 0 || !isFinite(rawMin) || !isFinite(rawMax)) {
      return { minVal: 0, maxVal: 1000 };
    }

    const delta = rawMax - rawMin;

    if (delta <= 0) {
      const margin = rawMax * 0.05 || 100;
      return {
        minVal: Math.max(0, rawMax - margin),
        maxVal: rawMax + margin,
      };
    }

    const days = activeHorizon.days;

    if (days <= 1) {
      const padding = Math.max(delta * 0.28, rawMin * 0.0001);
      return {
        minVal: Math.max(0, rawMin - padding),
        maxVal: rawMax + padding,
      };
    } else if (days <= 30) {
      const padding = Math.max(delta * 0.25, rawMin * 0.0004);
      return {
        minVal: Math.max(0, rawMin - padding),
        maxVal: rawMax + padding,
      };
    } else if (days <= 365) {
      const padding = delta * 0.22;
      return {
        minVal: Math.max(0, rawMin - padding),
        maxVal: rawMax + padding,
      };
    } else {
      if (delta >= rawMin * 0.7) {
        return {
          minVal: 0,
          maxVal: rawMax * 1.08,
        };
      } else {
        const padding = delta * 0.25;
        return {
          minVal: Math.max(0, rawMin - padding),
          maxVal: rawMax + padding * 0.85,
        };
      }
    }
  }, [series, activeHorizon.days]);

  // Parámetros de geometría SVG
  const width = 820;
  const height = isFullscreen ? 360 : 330;
  const paddingLeft = 85;
  const paddingRight = 40;
  const paddingTop = 42;
  const paddingBottom = 55;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Mapeo de coordenadas X e Y
  const points = series.map((p, idx) => {
    const x = paddingLeft + (idx / Math.max(series.length - 1, 1)) * chartWidth;
    const normBalance = (p.totalBalance - minVal) / (maxVal - minVal || 1);
    const normInvested = (p.investedCapital - minVal) / (maxVal - minVal || 1);

    const yBalance = paddingTop + chartHeight - normBalance * chartHeight;
    const yInvested = paddingTop + chartHeight - normInvested * chartHeight;

    return {
      x,
      yBalance,
      yInvested,
      point: p,
    };
  });

  // Generador de curvas Bezier suaves
  const generateSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const balancePoints = points.map((p) => ({ x: p.x, y: p.yBalance }));
  const investedPoints = points.map((p) => ({ x: p.x, y: p.yInvested }));

  const balanceLinePath = generateSmoothPath(balancePoints);
  const investedLinePath = generateSmoothPath(investedPoints);

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath =
    points.length > 0
      ? `${balanceLinePath} L ${lastPoint.x} ${paddingTop + chartHeight} L ${firstPoint.x} ${paddingTop + chartHeight} Z`
      : '';

  // Color de la entidad seleccionada: si es una sola, su color; si son varias, indigo
  const strokeColor =
    selectedEntityIds.length === 1
      ? entities.find((e) => e.id === selectedEntityIds[0])?.color || '#6366f1'
      : '#6366f1';

  const hoveredPoint = activePointIndex !== null ? points[activePointIndex] : null;

  const toggleFullscreen = () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    if (nextState && typeof window !== 'undefined' && window.innerWidth < 768) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      try {
        if ('orientation' in screen && (screen.orientation as any).lock) {
          (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } catch (e) {}
    } else if (!nextState && typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Selector Desplegable con Checkboxes (Sin flechas de desplazamiento)
  const renderCheckboxDropdown = () => (
    <div ref={dropdownRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl liquid-glass-subtle border border-slate-200/80 dark:border-white/10 hover:border-indigo-400 text-xs font-semibold shadow-sm transition-all cursor-pointer select-none max-w-[210px] sm:max-w-[260px]"
        title="Filtrar entidades con casillas de verificación"
      >
        <EdgeGlow color="rgba(255, 255, 255, 0.75)" proximity={200} size={280} borderWidth={1.5} />
        {isAllSelected ? (
          <>
            <LayersIcon size={14} className="text-indigo-500 shrink-0" />
            <span className="truncate font-bold text-slate-900 dark:text-white">
              Consolidado ({entities.length})
            </span>
          </>
        ) : selectedEntityIds.length === 1 ? (
          <>
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{
                backgroundColor:
                  entities.find((e) => e.id === selectedEntityIds[0])?.color || '#6366f1',
              }}
            />
            <span className="truncate font-bold text-slate-900 dark:text-white">
              {entities.find((e) => e.id === selectedEntityIds[0])?.name || 'Entidad'}
            </span>
          </>
        ) : (
          <>
            <div className="flex -space-x-1 items-center shrink-0">
              {selectedEntityIds.slice(0, 3).map((entId) => {
                const ent = entities.find((e) => e.id === entId);
                return (
                  <span
                    key={entId}
                    className="w-2.5 h-2.5 rounded-full ring-1 ring-white dark:ring-zinc-900 shrink-0"
                    style={{ backgroundColor: ent?.color || '#6366f1' }}
                  />
                );
              })}
            </div>
            <span className="truncate font-bold text-indigo-600 dark:text-indigo-400">
              {selectedEntityIds.length} de {entities.length} entidades
            </span>
          </>
        )}
        <ChevronDownIcon
          size={13}
          className={`text-slate-400 dark:text-zinc-500 shrink-0 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 max-h-72 overflow-y-auto rounded-2xl liquid-glass p-2 shadow-2xl border border-white/90 dark:border-white/15 backdrop-blur-2xl bg-white/95 dark:bg-zinc-900/95 animate-liquid-modal-bubble space-y-1">
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-200/60 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            <span>Filtrar por Entidad</span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer lowercase first-letter:uppercase"
            >
              {isAllSelected ? 'desmarcar' : 'marcar todas'}
            </button>
          </div>

          {/* Opción Todas las Entidades / Consolidado */}
          <div
            onClick={toggleAll}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors select-none"
          >
            <div className="flex items-center gap-2 truncate">
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                  isAllSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-300 dark:border-zinc-600 bg-white/50 dark:bg-black/30'
                }`}
              >
                {isAllSelected && <CheckIcon size={12} strokeWidth={3} />}
              </div>
              <LayersIcon size={13} className="text-indigo-500 shrink-0" />
              <span className="truncate text-slate-800 dark:text-zinc-100">
                Todas ({entities.length})
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200/50 dark:border-white/5 my-1" />

          {/* Lista de Entidades Individuales con Checkboxes */}
          <div className="space-y-0.5">
            {entities.map((ent) => {
              const isChecked = selectedEntityIds.includes(ent.id);
              return (
                <div
                  key={ent.id}
                  onClick={() => toggleEntity(ent.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors select-none"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-zinc-600 bg-white/50 dark:bg-black/30'
                      }`}
                    >
                      {isChecked && <CheckIcon size={12} strokeWidth={3} />}
                    </div>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: ent.color }}
                    />
                    <span className="truncate text-slate-800 dark:text-zinc-200">
                      {ent.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(false)}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizador del lienzo SVG interactivo con tooltip flotante
  const renderSvgCanvas = (inFullscreen = false) => (
    <div
      className={`relative w-full rounded-2xl bg-white/30 dark:bg-black/25 p-2 border border-white/40 dark:border-white/5 ${
        inFullscreen ? 'h-full flex items-center justify-center' : ''
      }`}
    >
      {/* Floating Tooltip con Clamping Inteligente para evitar desbordes */}
      {hoveredPoint && (() => {
        const isNearTop = hoveredPoint.yBalance < paddingTop + 75;
        const isNearRight = hoveredPoint.x > width * 0.72;
        const isNearLeft = hoveredPoint.x < width * 0.24;

        let transformXClass = '-translate-x-1/2';
        let caretClass = 'left-1/2 -translate-x-1/2';
        if (isNearRight) {
          transformXClass = '-translate-x-[90%]';
          caretClass = 'right-6';
        } else if (isNearLeft) {
          transformXClass = '-translate-x-[10%]';
          caretClass = 'left-6';
        }

        return (
          <div
            className={`absolute pointer-events-none z-30 transition-all duration-150 transform ${transformXClass} ${
              isNearTop ? 'translate-y-4' : '-translate-y-full -mt-3'
            }`}
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.yBalance / height) * 100}%`,
            }}
          >
            <div className="relative liquid-glass rounded-2xl p-3 shadow-2xl border border-white/90 dark:border-white/20 backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95 text-xs whitespace-nowrap min-w-[205px]">
              <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-200/60 dark:border-zinc-800">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {hoveredPoint.point.label}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                  {hoveredPoint.point.days} días
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Saldo Total:</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                    {formatCurrency(hoveredPoint.point.totalBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Rendimiento:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    +{formatCurrency(hoveredPoint.point.pureYield)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Capital Aportado:</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 font-mono tabular-nums">
                    {formatCurrency(hoveredPoint.point.investedCapital)}
                  </span>
                </div>

                {/* Desglose por Entidad si hay múltiples seleccionadas */}
                {selectedEntityIds.length > 1 && hoveredPoint.point.entityValues && (
                  <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-zinc-800/80 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Desglose por Entidad
                    </div>
                    {selectedEntityIds.map((entId) => {
                      const ent = entities.find((e) => e.id === entId);
                      const val = hoveredPoint.point.entityValues?.[entId];
                      if (!ent || !val) return null;
                      return (
                        <div key={entId} className="flex items-center justify-between gap-3 text-[10px]">
                          <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: ent.color }}
                            />
                            <span className="truncate text-slate-600 dark:text-zinc-400">
                              {ent.name}:
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 tabular-nums">
                            {formatCurrency(val.balance)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Caret Pointer */}
              {isNearTop ? (
                <div
                  className={`absolute -top-1.5 w-2.5 h-2.5 rotate-45 bg-white/95 dark:bg-zinc-900 border-l border-t border-slate-200/80 dark:border-white/20 ${caretClass}`}
                />
              ) : (
                <div
                  className={`absolute -bottom-1 w-2.5 h-2.5 rotate-45 bg-white/95 dark:bg-zinc-900 border-r border-b border-slate-200/80 dark:border-white/20 ${caretClass}`}
                />
              )}
            </div>
          </div>
        );
      })()}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`w-full overflow-visible select-none ${
          inFullscreen ? 'h-full max-h-full object-contain' : 'h-auto'
        }`}
      >
        <defs>
          <linearGradient id="chartGradientGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.16" />
            <stop offset="65%" stopColor={strokeColor} stopOpacity="0.03" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Growth Reveal ClipPath */}
          <clipPath id={`chartGrowClip-${selectedEntityIds.join('-')}-${selectedHorizonId}`}>
            <rect x="0" y="0" height={height} className="animate-chart-grow-clip" />
          </clipPath>
        </defs>

        {/* Grid lines & Y Axis */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const val = minVal + ratio * (maxVal - minVal || 1);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="currentColor"
                className="text-slate-200/70 dark:text-zinc-800/80"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 12}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400 dark:fill-zinc-500 tabular-nums"
              >
                {formatCurrency(val)}
              </text>
            </g>
          );
        })}

        {/* Growing Group with ClipPath */}
        <g
          key={`chart-growth-${selectedEntityIds.join('-')}-${selectedHorizonId}`}
          clipPath={`url(#chartGrowClip-${selectedEntityIds.join('-')}-${selectedHorizonId})`}
        >
          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#chartGradientGlow)"
              className="transition-opacity duration-500"
            />
          )}

          {/* Curva 1: Línea punteada de Capital Invertido Base */}
          {investedLinePath && (
            <path
              d={investedLinePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5 4"
              className="text-slate-400 dark:text-zinc-500 opacity-80"
            />
          )}

          {/* Curva 2: Saldo Total con Glow Animado Elegante */}
          {balanceLinePath && (
            <path
              d={balanceLinePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#neonGlow)"
              className="animate-chart-glow"
            />
          )}
        </g>

        {/* Hover Vertical Crosshair */}
        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={paddingTop}
            x2={hoveredPoint.x}
            y2={paddingTop + chartHeight}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="opacity-70"
          />
        )}

        {/* Interactive Milestone Nodes */}
        {points.map((pt, idx) => {
          const isHovered = activePointIndex === idx;
          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setActivePointIndex(idx)}
              onMouseLeave={() => setActivePointIndex(null)}
            >
              {/* Large invisible hit target */}
              <circle cx={pt.x} cy={pt.yBalance} r="20" fill="transparent" />

              {/* Capital node */}
              <circle
                cx={pt.x}
                cy={pt.yInvested}
                r="3"
                fill="currentColor"
                className="text-slate-400 dark:text-zinc-500"
              />

              {/* Outer glowing halo */}
              <circle
                cx={pt.x}
                cy={pt.yBalance}
                r={isHovered ? '9' : '5.5'}
                fill={strokeColor}
                className="transition-all duration-200 opacity-40"
              />

              {/* Inner dot */}
              <circle
                cx={pt.x}
                cy={pt.yBalance}
                r={isHovered ? '5' : '3.5'}
                fill="#ffffff"
                stroke={strokeColor}
                strokeWidth="2.5"
                className="transition-all duration-200"
              />

              {/* X Axis Label */}
              <text
                x={pt.x}
                y={paddingTop + chartHeight + 22}
                textAnchor="middle"
                className={`text-[11px] font-medium transition-colors ${
                  isHovered
                    ? 'fill-indigo-600 dark:fill-indigo-400 font-bold'
                    : 'fill-slate-500 dark:fill-zinc-400'
                }`}
              >
                {pt.point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );

  return (
    <>
      {/* Contenedor normal de la gráfica */}
      <div className="relative overflow-hidden liquid-glass rounded-3xl border border-white/80 dark:border-white/10 shadow-xl transition-all p-6 mb-8">
        {/* Brillo dinámico en las orillas */}
        <EdgeGlow color="rgba(255, 255, 255, 0.75)" proximity={340} size={640} borderWidth={2.5} />

        {/* Encabezado limpio: solo título 'Trayectoria' y controles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <TrendingUpIcon size={16} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Trayectoria
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Horizon Slider */}
            <TimeHorizonSlider
              selectedHorizonId={effectiveHorizonId}
              onSelectHorizon={onSelectHorizon}
              customYears={customYears}
              onCustomYearsChange={onCustomYearsChange}
              allowDaily={false}
            />

            {/* Checkbox Dropdown Selector */}
            {renderCheckboxDropdown()}
          </div>
        </div>

        {/* SVG Canvas interactivo */}
        {renderSvgCanvas()}

        {/* Barra inferior: Leyenda y Botón de Pantalla Completa colocado abajo de la gráfica */}
        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400 dark:border-zinc-500 inline-block" />
              <span className="text-[11px]">Capital Base</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-4 h-0.5 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: strokeColor }}
              />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200">
                Saldo Acumulado
              </span>
            </div>
          </div>

          {/* Botón Pantalla Completa abajo de la gráfica */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="relative overflow-hidden px-3.5 py-1.5 rounded-xl liquid-glass-subtle border border-slate-200/80 dark:border-white/10 hover:border-indigo-400 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm ml-auto"
            title="Ver gráfica en pantalla completa"
          >
            <EdgeGlow color="rgba(255, 255, 255, 0.75)" proximity={180} size={240} borderWidth={1.5} />
            <Maximize2Icon size={14} />
            <span>Pantalla Completa</span>
          </button>
        </div>
      </div>

      {/* Modal de Pantalla Completa renderizado vía createPortal en document.body */}
      {isFullscreen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 overflow-hidden animate-liquid-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) toggleFullscreen();
            }}
          >
            <div className="relative w-full max-w-6xl max-h-[96vh] p-2 sm:p-4 mobile-landscape-chart-modal my-auto flex flex-col justify-between overflow-hidden liquid-glass rounded-2xl sm:rounded-3xl border border-white/80 dark:border-white/15 shadow-2xl animate-liquid-modal-bubble bg-white/95 dark:bg-zinc-900/95">
              <EdgeGlow color="rgba(255, 255, 255, 0.75)" proximity={340} size={640} borderWidth={2.5} />

              {/* Botón flotante para salir de pantalla completa (siempre accesible en la esquina sin restar espacio al lienzo) */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="absolute top-2.5 right-2.5 z-40 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                title="Salir de pantalla completa"
              >
                <XIcon size={15} />
                <span className="text-[11px]">Salir</span>
              </button>

              {/* Encabezado SOLO visible en pantallas grandes de escritorio (lg:flex). En móvil y móvil horizontal se oculta para mostrar 100% solo la gráfica */}
              <div className="hidden lg:flex items-center gap-2 mb-2 shrink-0">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <TrendingUpIcon size={16} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Trayectoria (Pantalla Completa)
                </h3>
              </div>

              {/* Lienzo SVG interactivo a pantalla completa: 100% libre de filtros y sliders */}
              <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
                {renderSvgCanvas(true)}
              </div>

              {/* Pie con leyenda: SOLO visible en pantallas grandes de escritorio (lg:flex). En móvil y móvil horizontal se oculta para maximizar la gráfica */}
              <div className="hidden lg:flex mt-2 pt-2 border-t border-slate-200/50 dark:border-white/5 items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-4 text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400 dark:border-zinc-500 inline-block" />
                    <span className="text-[11px]">Capital Base</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-0.5 rounded-full inline-block shadow-sm"
                      style={{ backgroundColor: strokeColor }}
                    />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200">
                      Saldo Acumulado
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <Minimize2Icon size={13} />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
