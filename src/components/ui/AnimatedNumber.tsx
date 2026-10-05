import React, { useEffect, useState, useRef } from 'react';
import { formatCurrency } from '../../utils/finance';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (val: number) => string;
  className?: string;
  prefix?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 750,
  formatFn = (v) => formatCurrency(v),
  className = '',
  prefix = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(() => (isNaN(value) ? 0 : value));
  const startValRef = useRef<number>(displayValue);
  const targetValRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const target = isNaN(value) ? 0 : value;
    startValRef.current = displayValue;
    targetValRef.current = target;
    startTimeRef.current = null;

    // Easing cúbico hacia afuera para desaceleración natural
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current =
        startValRef.current + (targetValRef.current - startValRef.current) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValRef.current);
      }
    };

    rafIdRef.current = requestAnimationFrame(step);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {formatFn(displayValue)}
    </span>
  );
};
