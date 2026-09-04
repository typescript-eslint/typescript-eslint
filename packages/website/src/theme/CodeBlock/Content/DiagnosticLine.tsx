import type { RenderProps, Token } from 'prism-react-renderer';

import clsx from 'clsx';
import React from 'react';

import type { LineDiagnosticRange } from '../diagnosticRanges';

import { DiagnosticMarker } from './DiagnosticMarker';

interface DiagnosticLineProps {
  classNames: string[] | undefined;
  getLineProps: RenderProps['getLineProps'];
  getTokenProps: RenderProps['getTokenProps'];
  line: Token[];
  ranges: readonly LineDiagnosticRange[];
}

function getTokenBoundaries(
  tokenStart: number,
  tokenEnd: number,
  ranges: readonly LineDiagnosticRange[],
): number[] {
  return [
    tokenStart,
    tokenEnd,
    ...ranges.flatMap(range => [
      Math.max(tokenStart, range.start),
      Math.min(tokenEnd, range.end),
    ]),
  ]
    .filter(boundary => boundary >= tokenStart && boundary <= tokenEnd)
    .sort((left, right) => left - right)
    .filter((boundary, index, all) => boundary !== all[index - 1]);
}

export function DiagnosticLine({
  classNames,
  getLineProps,
  getTokenProps,
  line,
  ranges,
}: DiagnosticLineProps): React.JSX.Element {
  const lineProps = getLineProps({ className: clsx(classNames), line });
  const focusableDiagnostics = new Set<number>();
  let tokenStart = 0;

  return (
    <div {...lineProps}>
      {line.flatMap((token, tokenIndex) => {
        const tokenEnd = tokenStart + token.content.length;
        const boundaries = getTokenBoundaries(tokenStart, tokenEnd, ranges);
        const currentTokenStart = tokenStart;
        tokenStart = tokenEnd;

        return boundaries.slice(0, -1).map((start, partIndex) => {
          const end = boundaries[partIndex + 1];
          const content = token.content.slice(
            start - currentTokenStart,
            end - currentTokenStart,
          );
          const tokenProps = getTokenProps({ token: { ...token, content } });
          const activeRanges = ranges.filter(
            range => range.start < end && range.end > start,
          );
          const markerKey = `${tokenIndex}:${partIndex}`;

          if (activeRanges.length === 0) {
            return (
              <span key={markerKey} {...tokenProps}>
                {tokenProps.children}
              </span>
            );
          }

          const focusable = activeRanges.some(
            range => !focusableDiagnostics.has(range.diagnosticIndex),
          );
          for (const range of activeRanges) {
            focusableDiagnostics.add(range.diagnosticIndex);
          }

          return (
            <DiagnosticMarker
              key={markerKey}
              focusable={focusable}
              messages={activeRanges.map(range => range.diagnostic.message)}
            >
              <span {...tokenProps}>{tokenProps.children}</span>
            </DiagnosticMarker>
          );
        });
      })}
      <br />
    </div>
  );
}
