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

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- Lint diagnostics must be keyboard focusable. */
export function DiagnosticMarker({
  children,
  focusable,
  message,
}: DiagnosticMarkerProps): React.JSX.Element {
  const descriptionId = useId();
  const markerRef = useRef<HTMLSpanElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>();
  const tooltipIsOpen = tooltipPosition != null;

  useEffect(() => {
    if (!tooltipIsOpen) {
      return;
    }

    const updatePosition = () => {
      const rect = markerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const tooltip = document.getElementById(descriptionId)!;
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

  return (
    <span
      ref={markerRef}
      aria-describedby={tooltipPosition ? descriptionId : undefined}
      aria-label={focusable ? `Lint error: ${message}` : undefined}
      className={styles.diagnostic}
      onBlur={hideTooltip}
      onFocus={showTooltip}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      tabIndex={focusable ? 0 : undefined}
    >
      {children}
      {tooltipPosition &&
        createPortal(
          <span
            className={styles.diagnosticTooltip}
            id={descriptionId}
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
/* eslint-enable jsx-a11y/no-noninteractive-tabindex */
