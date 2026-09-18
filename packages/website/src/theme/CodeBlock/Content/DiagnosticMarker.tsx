import type { ReactNode } from 'react';

import { Tooltip } from '@base-ui/react/tooltip';
import { useCodeBlockContext } from '@docusaurus/theme-common/internal';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

import styles from './styles.module.css';

interface DiagnosticMarkerProps {
  children: ReactNode;
  focusable: boolean;
  messages: readonly string[];
}

interface UnderlineSegment {
  bottom: number;
  left: number;
  width: number;
}

function getWrappedUnderlineSegments(
  content: HTMLSpanElement,
  marker: HTMLElement,
) {
  const rects = content.getClientRects();
  const firstLineTop = rects.item(0)?.top;
  if (firstLineTop == null) {
    return [];
  }

  const lineHeight = Number.parseFloat(getComputedStyle(marker).lineHeight);
  const lines = new Map<number, { left: number; right: number; top: number }>();

  // Syntax-highlighted spans produce multiple rectangles on each rendered line.
  for (const rect of rects) {
    if (rect.width === 0) {
      continue;
    }

    const lineIndex = Math.round((rect.top - firstLineTop) / lineHeight);
    const line = lines.get(lineIndex);
    if (line) {
      line.left = Math.min(line.left, rect.left);
      line.right = Math.max(line.right, rect.right);
    } else {
      lines.set(lineIndex, {
        left: rect.left,
        right: rect.right,
        top: rect.top,
      });
    }
  }

  if (lines.size < 2) {
    return [];
  }

  const lineRects = [...lines.values()];
  const lastLineTop = Math.max(...lineRects.map(line => line.top));
  const markerLeft = marker.getBoundingClientRect().left;
  return lineRects.map(line => ({
    bottom: lastLineTop - line.top,
    left: line.left - markerLeft,
    width: line.right - line.left,
  }));
}

export function DiagnosticMarker({
  children,
  focusable,
  messages,
}: DiagnosticMarkerProps): React.JSX.Element {
  const { wordWrap } = useCodeBlockContext();
  const contentRef = useRef<HTMLSpanElement>(null);
  const [underlineSegments, setUnderlineSegments] = useState<
    UnderlineSegment[]
  >([]);
  const accessibleMessage = messages.join('; ');

  useEffect(() => {
    if (!wordWrap.isEnabled) {
      setUnderlineSegments(current => (current.length ? [] : current));
      return;
    }

    const content = contentRef.current;
    const marker = content?.parentElement;
    if (!content || !marker) {
      return;
    }

    const update = () => {
      setUnderlineSegments(getWrappedUnderlineSegments(content, marker));
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(marker);
    return () => observer.disconnect();
  }, [wordWrap.isEnabled]);

  return (
    <Tooltip.Root disableHoverablePopup>
      <Tooltip.Trigger
        aria-label={
          focusable
            ? `Lint error${messages.length > 1 ? 's' : ''}: ${accessibleMessage}`
            : undefined
        }
        className={clsx(
          styles.diagnostic,
          underlineSegments.length > 0 && styles.diagnosticWrapped,
        )}
        delay={0}
        render={focusable ? undefined : <span />}
      >
        <span ref={contentRef}>{children}</span>
        {underlineSegments.map((segment, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={styles.diagnosticUnderline}
            style={segment}
          />
        ))}
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
