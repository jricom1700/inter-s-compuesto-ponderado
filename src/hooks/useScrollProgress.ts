import { useState, useEffect } from 'react';

export function useScrollProgress(threshold: number = 100) {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        const y = window.scrollY || document.documentElement.scrollTop || 0;
        setScrollY(y);
        const progress = Math.min(1, Math.max(0, y / threshold));
        setScrollProgress(progress);
        setIsScrolled(y > 20);
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [threshold]);

  return { scrollY, scrollProgress, isScrolled };
}
