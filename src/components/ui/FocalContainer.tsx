import React, { useRef, useState, useEffect } from 'react';

interface FocalContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  enableBlur?: boolean;
}

export const FocalContainer: React.FC<FocalContainerProps> = ({
  children,
  className = '',
  enableBlur = true,
  style,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focalState, setFocalState] = useState({
    blur: 0,
    scale: 1,
    opacity: 1,
    lightX: 30,
    lightY: 25,
  });

  useEffect(() => {
    let rafId: number;

    const updateFocalLighting = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const vCenter = vh / 2;
      const elCenter = rect.top + rect.height / 2;

      // Cálculo de fuente de luz física dinámica en relación al viewport
      // Conforme el usuario scrollea, el reflejo se desplaza por la superficie de cada tarjeta
      const lightProgressY = Math.max(8, Math.min(92, ((vCenter - rect.top) / (rect.height || 1)) * 45 + 35));
      const lightProgressX = Math.max(15, Math.min(85, 30 + Math.sin(elCenter * 0.003) * 18));

      const isMobile = window.innerWidth < 768;

      if (!enableBlur || isMobile) {
        setFocalState((prev) => ({
          ...prev,
          blur: 0,
          scale: 1,
          lightX: lightProgressX,
          lightY: lightProgressY,
        }));
        return;
      }

      // Enfoque óptico: nitidez total (0 blur) cuando la pantalla inicia o está en primer plano
      const isAtPageTop = window.scrollY < 140;
      const isCardInForeground = rect.top >= 0 && rect.bottom <= vh * 1.15;

      let blur = 0;
      let scale = 1;

      if (!isAtPageTop || !isCardInForeground) {
        const distFromCenter = Math.abs(elCenter - vCenter);
        const sweetSpot = vh * 0.28; // Mayor zona central nítida

        if (distFromCenter > sweetSpot) {
          const excess = distFromCenter - sweetSpot;
          const maxRange = vh * 0.45;
          const factor = Math.min(1, Math.max(0, excess / maxRange));

          // Blur sutil reducido y zoom out más pronunciado para mayor sensación de profundidad
          blur = factor * 1.2;
          scale = 1 - factor * 0.085;
        }
      }

      setFocalState({
        blur,
        scale,
        opacity: 1, // Opacidad 100% constante: sin oscurecer en ningún momento
        lightX: lightProgressX,
        lightY: lightProgressY,
      });
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateFocalLighting);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateFocalLighting();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [enableBlur]);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
      <div
        ref={containerRef}
        className={`relative transition-all duration-300 ease-out ${className}`}
        style={{
          ...style,
          transform: isMobile ? (style?.transform || 'none') : `${style?.transform || ''} scale(${focalState.scale}) translate3d(0, 0, 0)`,
          filter: !isMobile && enableBlur && focalState.blur > 0.2 ? `blur(${focalState.blur}px)` : 'none',
          opacity: 1, // Siempre brillo y contraste 100% nítidos sin oscurecimiento
        } as React.CSSProperties}
        {...props}
      >
      {children}
    </div>
  );
};
