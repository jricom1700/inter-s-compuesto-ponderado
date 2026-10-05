import React, { useRef, useState, useEffect } from 'react';
import { CalendarIcon } from './Icons';
import { EdgeGlow } from './EdgeGlow';

interface TimeHorizonSliderProps {
  selectedHorizonId: string;
  onSelectHorizon: (horizonId: string) => void;
  customYears: number;
  onCustomYearsChange: (years: number) => void;
  allowDaily?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const TimeHorizonSlider: React.FC<TimeHorizonSliderProps> = ({
  selectedHorizonId,
  onSelectHorizon,
  customYears,
  onCustomYearsChange,
  allowDaily = true,
  className = '',
  showIcon = true,
}) => {
  const basePresets = [
    ...(allowDaily
      ? [{ id: '1d', label: '1D', fullName: 'Al Día (24 hrs)' }]
      : []),
    { id: '7d', label: '7D', fullName: 'A 7 Días' },
    { id: '1m', label: '1M', fullName: 'Al Mes (30 días)' },
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [pill, setPill] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Si selectedHorizonId es '1a', mapear visualmente a 'custom'
  const effectiveSelectedId = selectedHorizonId === '1a' ? 'custom' : selectedHorizonId;

  // Medición reactiva del elemento activo para desplazar la pastilla con física fluida
  useEffect(() => {
    const updatePill = () => {
      let activeEl = itemRefs.current.get(effectiveSelectedId);
      if (!activeEl) {
        // Fallback seguro si la clave no está en los presets (ej. 1d cuando allowDaily=false)
        activeEl =
          itemRefs.current.get('7d') ||
          itemRefs.current.get('1m') ||
          itemRefs.current.get('custom');
      }
      const track = trackRef.current;
      if (activeEl && track) {
        setPill({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1,
        });
      }
    };

    updatePill();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && trackRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updatePill();
      });
      resizeObserver.observe(trackRef.current);
    }

    window.addEventListener('resize', updatePill);
    return () => {
      window.removeEventListener('resize', updatePill);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [effectiveSelectedId, customYears, allowDaily]);

  return (
    <div
      className={`relative overflow-hidden flex items-center p-1 rounded-2xl liquid-glass-subtle border border-slate-200/80 dark:border-white/10 overflow-x-auto no-scrollbar scroll-smooth select-none ${className}`}
    >
      {/* Brillo suave en las orillas y reflejo líquido que siguen al mouse en el slider */}
      <EdgeGlow color="rgba(255, 255, 255, 0.75)" proximity={300} size={480} borderWidth={2} />
      {showIcon && (
        <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 px-2.5 flex items-center gap-1 shrink-0">
          <CalendarIcon size={13} />
          <span>Plazo:</span>
        </span>
      )}

      {/* Riel con pastilla deslizante física continua */}
      <div ref={trackRef} className="relative flex items-center gap-1 shrink-0">
        {/* Pastilla indicadora animada que se traslada entre opciones */}
        <div
          className="absolute top-0 bottom-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/30 pointer-events-none transition-all duration-300 ease-out"
          style={{
            transform: `translate3d(${pill.left}px, 0, 0)`,
            width: `${pill.width}px`,
            opacity: pill.opacity,
          }}
        />

        {basePresets.map((preset) => {
          const isSelected = effectiveSelectedId === preset.id;
          return (
            <button
              key={preset.id}
              ref={(el) => {
                if (el) itemRefs.current.set(preset.id, el);
                else itemRefs.current.delete(preset.id);
              }}
              type="button"
              onClick={() => onSelectHorizon(preset.id)}
              title={preset.fullName}
              className={`relative z-10 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer shrink-0 ${
                isSelected
                  ? 'text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          );
        })}

        {/* Opción Integrada de Años Personalizados con Valor por Defecto 1 y Múltiplos de 0.5 */}
        <div
          ref={(el) => {
            if (el) itemRefs.current.set('custom', el);
            else itemRefs.current.delete('custom');
          }}
          onClick={() => onSelectHorizon('custom')}
          title="Plazo personalizado en años (múltiplos de 0.5)"
          className={`relative z-10 flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer shrink-0 ${
            effectiveSelectedId === 'custom'
              ? 'text-white'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div
            className={`relative overflow-hidden flex items-center rounded-xl px-2 py-0.5 border transition-all ${
              effectiveSelectedId === 'custom'
                ? 'bg-white/20 border-white/40 text-white shadow-inner'
                : 'bg-white/80 dark:bg-black/40 border-slate-200/90 dark:border-white/15 text-slate-900 dark:text-white shadow-sm'
            }`}
          >
            {/* Brillo en las orillas de la caja de años */}
            <EdgeGlow color="rgba(255, 255, 255, 0.75)" proximity={200} size={300} borderWidth={1.5} />
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="50"
              value={customYears !== undefined && customYears !== null ? customYears : 1}
              onClick={(e) => {
                e.stopPropagation();
                onSelectHorizon('custom');
              }}
              onChange={(e) => {
                const valStr = e.target.value;
                if (valStr === '') {
                  onCustomYearsChange(1);
                  onSelectHorizon('custom');
                  return;
                }
                const val = parseFloat(valStr);
                if (!isNaN(val) && val > 0) {
                  onCustomYearsChange(Math.min(50, val));
                  onSelectHorizon('custom');
                }
              }}
              onBlur={() => {
                // Asegurar que al salir sea un múltiplo de 0.5 mayor a 0
                const safe = Math.min(50, Math.max(0.5, Math.round((customYears || 1) * 2) / 2));
                onCustomYearsChange(safe);
              }}
              className="w-12 sm:w-14 h-7 text-center font-mono font-black text-sm bg-transparent outline-none select-all cursor-text focus:ring-1 focus:ring-white/50 rounded-lg"
              aria-label="Cantidad de años"
              placeholder="1"
            />
            <span
              className={`text-xs font-black pr-1 ${
                effectiveSelectedId === 'custom'
                  ? 'text-cyan-200'
                  : 'text-slate-700 dark:text-zinc-300'
              }`}
            >
              A
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

