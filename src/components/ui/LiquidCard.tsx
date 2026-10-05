import React from 'react';
import { EdgeGlow } from './EdgeGlow';

interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: 'none' | 'indigo' | 'emerald' | 'purple' | 'amber';
  glowColor?: string;
  interactive?: boolean;
  flare?: boolean;
  className?: string;
}

export const LiquidCard: React.FC<LiquidCardProps> = ({
  children,
  glow = 'none',
  glowColor,
  interactive = false,
  flare = true,
  className = '',
  ...props
}) => {
  const glowStyles = {
    none: '',
    indigo: 'shadow-indigo-500/10 hover:shadow-indigo-500/20 border-indigo-500/25 dark:border-indigo-500/30',
    emerald: 'shadow-emerald-500/10 hover:shadow-emerald-500/20 border-emerald-500/25 dark:border-emerald-500/30',
    purple: 'shadow-purple-500/10 hover:shadow-purple-500/20 border-purple-500/25 dark:border-purple-500/30',
    amber: 'shadow-amber-500/10 hover:shadow-amber-500/20 border-amber-500/25 dark:border-amber-500/30',
  };

  // El usuario solicita que todos los bordes sean un brillo blanco cristalino que se aclara con el mouse,
  // reservando los colores de marca exclusivamente para la sección de instituciones financieras.
  const activeEdgeColor = glowColor || 'rgba(255, 255, 255, 0.95)';

  const interactiveClasses = interactive
    ? 'hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 cursor-pointer'
    : 'transition-all duration-200';

  return (
    <div
      className={`liquid-glass rounded-3xl relative overflow-hidden backdrop-blur-2xl ${glowStyles[glow]} ${interactiveClasses} ${className}`}
      {...props}
    >
      {/* Brillo dinámico blanco en las orillas y reflejo líquido de superficie que siguen al mouse */}
      <EdgeGlow color={activeEdgeColor} borderWidth={2.5} proximity={340} size={640} />

      {children}
    </div>
  );
};
