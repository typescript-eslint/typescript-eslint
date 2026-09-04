import type { ReactNode } from 'react';

import { Tooltip } from '@base-ui/react/tooltip';
import React from 'react';

import styles from './styles.module.css';

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
  return (
    <Tooltip.Root disableHoverablePopup>
      <Tooltip.Trigger
        aria-label={focusable ? `Lint error: ${message}` : undefined}
        className={styles.diagnostic}
        delay={0}
        render={focusable ? undefined : <span />}
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner
          align="start"
          className={styles.diagnosticTooltipPositioner}
          side="bottom"
          sideOffset={8}
        >
          <Tooltip.Popup className={styles.diagnosticTooltip}>
            {message}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
