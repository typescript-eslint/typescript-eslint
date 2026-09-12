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

interface LinePart {
  activeRanges: readonly LineDiagnosticRange[];
  content: string;
  key: string;
  token: Token;
}

type LinePartGroup =
  | {
      kind: 'diagnostic';
      parts: LinePart[];
      ranges: LineDiagnosticRange[];
    }
  | { kind: 'plain'; part: LinePart };

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

function getLineParts(line: Token[], ranges: readonly LineDiagnosticRange[]) {
  let tokenStart = 0;

  return line.flatMap((token, tokenIndex) => {
    const tokenEnd = tokenStart + token.content.length;
    const boundaries = getTokenBoundaries(tokenStart, tokenEnd, ranges);
    const currentTokenStart = tokenStart;
    tokenStart = tokenEnd;

    return boundaries.slice(0, -1).map((start, partIndex) => {
      const end = boundaries[partIndex + 1];

      return {
        activeRanges: ranges.filter(
          range => range.start < end && range.end > start,
        ),
        content: token.content.slice(
          start - currentTokenStart,
          end - currentTokenStart,
        ),
        key: `${tokenIndex}:${partIndex}`,
        token,
      };
    });
  });
}

function groupLineParts(parts: readonly LinePart[]) {
  const groups: LinePartGroup[] = [];

  for (const part of parts) {
    if (part.activeRanges.length === 0) {
      groups.push({ kind: 'plain', part });
      continue;
    }

    const previousGroup = groups.at(-1);
    if (previousGroup?.kind === 'diagnostic') {
      previousGroup.parts.push(part);
      previousGroup.ranges.push(...part.activeRanges);
      continue;
    }

    groups.push({
      kind: 'diagnostic',
      parts: [part],
      ranges: [...part.activeRanges],
    });
  }

  return groups;
}

function getDiagnosticMessages(ranges: readonly LineDiagnosticRange[]) {
  return [
    ...new Map(
      ranges.map(range => [range.diagnosticIndex, range.diagnostic.message]),
    ).values(),
  ];
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
  const groups = groupLineParts(getLineParts(line, ranges));

  return (
    <div {...lineProps}>
      {groups.map(group => {
        if (group.kind === 'plain') {
          const tokenProps = getTokenProps({
            token: { ...group.part.token, content: group.part.content },
          });

          return (
            <span key={group.part.key} {...tokenProps}>
              {tokenProps.children}
            </span>
          );
        }

        const focusable = group.ranges.some(
          range => !focusableDiagnostics.has(range.diagnosticIndex),
        );
        for (const range of group.ranges) {
          focusableDiagnostics.add(range.diagnosticIndex);
        }

        return (
          <DiagnosticMarker
            key={group.parts[0].key}
            focusable={focusable}
            messages={getDiagnosticMessages(group.ranges)}
          >
            {group.parts.map(part => {
              const tokenProps = getTokenProps({
                token: { ...part.token, content: part.content },
              });

              return (
                <span key={part.key} {...tokenProps}>
                  {tokenProps.children}
                </span>
              );
            })}
          </DiagnosticMarker>
        );
      })}
      <br />
    </div>
  );
}
