import React from 'react';
import { TrendingUpIcon, InfoIcon } from './ui/Icons';
import { EdgeGlow } from './ui/EdgeGlow';

interface NavbarProps {
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAbout }) => {
  return (
    <header className="w-full bg-transparent border-none py-4 sm:py-5 mb-3 sm:mb-5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand & Logo (Completamente a la izquierda) */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/25 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white/95 dark:bg-zinc-950/90 rounded-[inherit] flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUpIcon size={18} />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-700 dark:from-white dark:via-indigo-200 dark:to-zinc-300 bg-clip-text text-transparent truncate">
              Rendimientos Multi-Fuente
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate leading-none">
              Calculadora Financiera de Renta Fija
            </p>
          </div>
        </div>

        {/* Botón Conocer más (Completamente a la derecha) */}
        {onOpenAbout && (
          <button
            type="button"
            onClick={onOpenAbout}
            title="Centro de información, guía y datos"
            className="relative overflow-hidden px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 liquid-glass border border-white/80 dark:border-white/10 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 shrink-0"
          >
            <EdgeGlow color="rgba(255, 255, 255, 0.85)" proximity={180} size={240} borderWidth={1.5} />
            <InfoIcon size={15} className="text-indigo-500 shrink-0" />
            <span className="truncate">Conocer más</span>
          </button>
        )}
      </div>
    </header>
  );
};
