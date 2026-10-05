import React, { useRef, useEffect } from 'react';

interface EdgeGlowProps {
  color?: string;
  className?: string;
  borderWidth?: number;
  proximity?: number;
  size?: number;
  sheen?: boolean;
}

export const EdgeGlow: React.FC<EdgeGlowProps> = ({
  color = 'rgba(255, 255, 255, 0.75)',
  className = '',
  borderWidth = 2.5,
  proximity = 340,
  size = 640,
  sheen = true,
}) => {
  const glowRef = useRef<HTMLSpanElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const glowEl = glowRef.current;
    const sheenEl = sheenRef.current;
    if (!glowEl) return;
    const parent = glowEl.parentElement;
    if (!parent) return;

    // Asignar variables de color y tamaño en CSS
    glowEl.style.setProperty('--edge-glow-color', color);
    glowEl.style.setProperty('--edge-glow-size', `${size}px`);
    glowEl.style.setProperty('--edge-glow-border-width', `${borderWidth}px`);
    if (sheenEl) {
      sheenEl.style.setProperty('--edge-glow-size', `${size}px`);
    }

    let rafId: number;
    const isTouchDevice =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);

    // Manejo para dispositivos móviles / touch basado en la posición de scroll
    const handleScrollGlow = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!glowEl || !parent) return;
        const rect = parent.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) return;

        const vh = window.innerHeight;
        const viewportCenterY = vh * 0.45;
        const elemCenterY = rect.top + rect.height / 2;
        const distY = Math.abs(elemCenterY - viewportCenterY);
        const activeRange = vh * 0.42;

        if (distY <= activeRange) {
          const normDist = distY / activeRange;
          // Brillo suave y calibrado (máximo 0.75) sin saturar a blanco absoluto
          const opacity = Math.max(0, Math.pow(1 - normDist, 0.8)) * 0.75;
          const opStr = opacity.toFixed(3);
          const x = rect.width / 2;
          const y = Math.max(0, Math.min(rect.height, viewportCenterY - rect.top));

          glowEl.style.setProperty('--mouse-x', `${x}px`);
          glowEl.style.setProperty('--mouse-y', `${y}px`);
          glowEl.style.setProperty('--edge-glow-opacity', opStr);

          if (sheenEl) {
            sheenEl.style.setProperty('--mouse-x', `${x}px`);
            sheenEl.style.setProperty('--mouse-y', `${y}px`);
            sheenEl.style.setProperty('--edge-glow-opacity', opStr);
          }
        } else {
          glowEl.style.setProperty('--edge-glow-opacity', '0');
          if (sheenEl) sheenEl.style.setProperty('--edge-glow-opacity', '0');
        }
      });
    };

    // Manejo para ratón / puntero en escritorio
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!glowEl || !parent) return;
        const rect = parent.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) return;

        const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
        const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
        const dist = Math.hypot(dx, dy);

        if (dist <= proximity) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const normDist = dist / proximity;
          // Máximo 0.82 para que el blanco no sea ciego/absoluto sino refinado
          const opacity = Math.max(0, Math.pow(1 - normDist, 0.68) * 0.82);

          const opStr = opacity.toFixed(3);
          glowEl.style.setProperty('--mouse-x', `${x}px`);
          glowEl.style.setProperty('--mouse-y', `${y}px`);
          glowEl.style.setProperty('--edge-glow-opacity', opStr);

          if (sheenEl) {
            sheenEl.style.setProperty('--mouse-x', `${x}px`);
            sheenEl.style.setProperty('--mouse-y', `${y}px`);
            sheenEl.style.setProperty('--edge-glow-opacity', opStr);
          }
        } else {
          const currentOpacity = glowEl.style.getPropertyValue('--edge-glow-opacity');
          if (currentOpacity && currentOpacity !== '0') {
            glowEl.style.setProperty('--edge-glow-opacity', '0');
            if (sheenEl) sheenEl.style.setProperty('--edge-glow-opacity', '0');
          }
        }
      });
    };

    const handleMouseLeaveWindow = () => {
      glowEl.style.setProperty('--edge-glow-opacity', '0');
      if (sheenEl) sheenEl.style.setProperty('--edge-glow-opacity', '0');
    };

    if (isTouchDevice) {
      window.addEventListener('scroll', handleScrollGlow, { passive: true });
      window.addEventListener('touchmove', handleScrollGlow, { passive: true });
      // Ejecución inicial para elements visibles
      handleScrollGlow();
    } else {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeaveWindow, { passive: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (isTouchDevice) {
        window.removeEventListener('scroll', handleScrollGlow);
        window.removeEventListener('touchmove', handleScrollGlow);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      }
    };
  }, [color, proximity, size, sheen, borderWidth]);

  return (
    <>
      <span
        ref={glowRef}
        className={`edge-glow-border ${className}`}
        style={{ padding: `${borderWidth}px` }}
        aria-hidden="true"
      />
      {sheen && (
        <span
          ref={sheenRef}
          className="liquid-mouse-sheen"
          aria-hidden="true"
        />
      )}
    </>
  );
};
