import type { ReactNode } from 'react';

import { Tooltip } from '@base-ui/react/tooltip';
import React from 'react';

import styles from './styles.module.css';

interface DiagnosticMarkerProps {
  children: ReactNode;
  focusable: boolean;
  messages: readonly string[];
}

export function DiagnosticMarker({
  children,
  focusable,
  messages,
}: DiagnosticMarkerProps): React.JSX.Element {
  const accessibleMessage = messages.join('; ');

  return (
    <Tooltip.Root disableHoverablePopup>
      <Tooltip.Trigger
        aria-label={
          focusable
            ? `Lint error${messages.length > 1 ? 's' : ''}: ${accessibleMessage}`
            : undefined
        }
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
            {messages.map((message, index) => (
              <React.Fragment key={`${index}:${message}`}>
                {index > 0 && <br />}
                {message}
              </React.Fragment>
            ))}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
