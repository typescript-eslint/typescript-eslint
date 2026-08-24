import type { RenderProps, Token } from 'prism-react-renderer';
import type { ReactNode } from 'react';

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
          let rendered: ReactNode = (
            <span {...tokenProps}>{tokenProps.children}</span>
          );

          for (const range of activeRanges.toReversed()) {
            const focusable = !focusableDiagnostics.has(range.diagnosticIndex);
            focusableDiagnostics.add(range.diagnosticIndex);
            rendered = (
              <DiagnosticMarker
                focusable={focusable}
                message={range.diagnostic.message}
              >
                {rendered}
              </DiagnosticMarker>
            );
          }

          return (
            <React.Fragment key={`${tokenIndex}:${partIndex}`}>
              {rendered}
            </React.Fragment>
          );
        });
      })}
      <br />
    </div>
  );
}
