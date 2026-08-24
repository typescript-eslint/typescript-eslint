import type { ReactNode } from 'react';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './styles.module.css';

const tooltipGap = 8;
const tooltipMargin = 12;

interface TooltipPosition {
  left: number;
  top: number;
}

interface DiagnosticMarkerProps {
  children: ReactNode;
  focusable: boolean;
  message: string;
}

export function DiagnosticMarker({
  children,
  focusable,
  message,
}: DiagnosticMarkerProps): React.JSX.Element {
  const descriptionId = useId();
  const markerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>();
  const tooltipIsOpen = tooltipPosition != null;

  useEffect(() => {
    if (!tooltipIsOpen) {
      return;
    }

    const updatePosition = () => {
      const marker = markerRef.current;
      const tooltip = tooltipRef.current;
      if (!marker || !tooltip) {
        return;
      }

      const rect = marker.getBoundingClientRect();
      const tooltipHeight = tooltip.offsetHeight;
      const tooltipWidth = tooltip.offsetWidth;
      const belowMarker = rect.bottom + tooltipGap;
      setTooltipPosition({
        left: Math.min(
          Math.max(tooltipMargin, rect.left),
          Math.max(
            tooltipMargin,
            window.innerWidth - tooltipWidth - tooltipMargin,
          ),
        ),
        top:
          belowMarker + tooltipHeight <= window.innerHeight - tooltipMargin
            ? belowMarker
            : Math.max(tooltipMargin, rect.top - tooltipHeight - tooltipGap),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [descriptionId, tooltipIsOpen]);

  const showTooltip = () => {
    const rect = markerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        left: rect.left,
        top: rect.bottom + tooltipGap,
      });
    }
  };
  const hideTooltip = () => {
    setTooltipPosition(undefined);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Escape') {
      hideTooltip();
    }
  };

  return (
    <span
      ref={markerRef}
      aria-describedby={tooltipPosition ? descriptionId : undefined}
      aria-label={focusable ? `Lint error: ${message}` : undefined}
      className={styles.diagnostic}
      onBlur={hideTooltip}
      onFocus={showTooltip}
      onKeyDown={handleKeyDown}
      onPointerEnter={showTooltip}
      onPointerLeave={hideTooltip}
      role={focusable ? 'button' : undefined}
      tabIndex={focusable ? 0 : undefined}
    >
      {children}
      {tooltipPosition &&
        createPortal(
          <span
            className={styles.diagnosticTooltip}
            id={descriptionId}
            ref={tooltipRef}
            role="tooltip"
            style={tooltipPosition}
          >
            {message}
          </span>,
          document.body,
        )}
    </span>
  );
}
