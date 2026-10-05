import React from 'react';
import { TrendingUpIcon, LandmarkIcon } from './ui/Icons';
import { EdgeGlow } from './ui/EdgeGlow';

interface FloatingBottomNavProps {
  activeTab: 'analysis' | 'accounts';
  onTabChange: (tab: 'analysis' | 'accounts') => void;
  accountsCount: number;
  tabProgress?: number;
  isDragging?: boolean;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  activeTab,
  onTabChange,
  accountsCount,
  tabProgress = activeTab === 'accounts' ? 1 : 0,
  isDragging = false,
}) => {
  return (
    <aside aria-label="Navegación principal inferior" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 select-none md:hidden">
      <nav className="relative overflow-hidden liquid-glass rounded-full p-1.5 shadow-2xl shadow-indigo-950/25 dark:shadow-black/60 border border-white/90 dark:border-white/15 backdrop-blur-2xl bg-white/80 dark:bg-zinc-900/85 flex items-center w-[270px] transition-all duration-300 hover:scale-[1.02]">
        {/* Brillo dinámico blanco en las orillas y reflejo líquido que siguen al mouse / toque */}
        <EdgeGlow color="rgba(255, 255, 255, 0.95)" proximity={280} size={400} borderWidth={2} />
        {/* Pastilla flotante con resplandor sincronizada en tiempo real */}
        <div
          className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/35 pointer-events-none ${
            isDragging ? '' : 'transition-transform duration-350 ease-out'
          }`}
          style={{
            transform: `translate3d(${tabProgress * 100}%, 0, 0)`,
          }}
        />

        {/* Botón Análisis */}
        <button
          type="button"
          onClick={() => onTabChange('analysis')}
          className={`relative z-10 w-1/2 py-2 rounded-full text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            tabProgress < 0.5 ? 'text-white' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUpIcon size={15} />
          <span>Análisis</span>
          <span
            className={`w-1.5 h-1.5 rounded-full bg-cyan-300 transition-opacity duration-200 ${
              tabProgress < 0.3 ? 'opacity-100 animate-pulse' : 'opacity-0'
            }`}
          />
        </button>

        {/* Botón Cuentas */}
        <button
          type="button"
          onClick={() => onTabChange('accounts')}
          className={`relative z-10 w-1/2 py-2 rounded-full text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            tabProgress >= 0.5 ? 'text-white' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LandmarkIcon size={15} />
          <span>Cuentas</span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors duration-200 ${
              tabProgress >= 0.5
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}
          >
            {accountsCount}
          </span>
        </button>
      </nav>
    </aside>
  );
};
