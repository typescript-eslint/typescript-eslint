import type { RenderProps, Token } from 'prism-react-renderer';

import clsx from 'clsx';
import React from 'react';

import type { LineDiagnosticRange } from '../diagnosticRanges';

import { DiagnosticMarker } from './DiagnosticMarker';
import styles from './styles.module.css';

interface DiagnosticLineProps {
  classNames?: string[] | undefined;
  firstVisibleDiagnosticIndices: ReadonlySet<number>;
  getLineProps: RenderProps['getLineProps'];
  getTokenProps: RenderProps['getTokenProps'];
  line: Token[];
  lineRanges: readonly LineDiagnosticRange[];
  showLineNumbers: boolean;
}

interface TokenPart {
  /**
   * Ranges linking this token part to the locations and messages of its diagnostics.
   */
  activeRanges: readonly LineDiagnosticRange[];
  partContent: Token['content'];
  key: string;
  sourceToken: Token;
}

type RenderGroup =
  | {
      kind: 'diagnostic';
      tokenParts: TokenPart[];
      ranges: LineDiagnosticRange[];
    }
  | { kind: 'plain'; tokenPart: TokenPart };

/**
 * Returns split points at diagnostic boundaries
 * so each token part can be marked independently
 * while preserving its Prism styling.
 */
function getTokenSplitBoundaries(
  tokenStart: number,
  tokenEnd: number,
  lineRanges: readonly LineDiagnosticRange[],
): number[] {
  return [
    tokenStart,
    tokenEnd,
    ...lineRanges.flatMap(range => [
      Math.max(tokenStart, range.start),
      Math.min(tokenEnd, range.end),
    ]),
  ]
    .filter(boundary => boundary >= tokenStart && boundary <= tokenEnd)
    .sort((left, right) => left - right)
    .filter((boundary, index, all) => boundary !== all[index - 1]);
}

function splitLineTokens(
  line: Token[],
  lineRanges: readonly LineDiagnosticRange[],
): TokenPart[] {
  function splitToken(
    token: Token,
    tokenIndex: number,
    tokenStart: number,
  ): TokenPart[] {
    const tokenEnd = tokenStart + token.content.length;
    const boundaries = getTokenSplitBoundaries(
      tokenStart,
      tokenEnd,
      lineRanges,
    );

    return boundaries.slice(0, -1).map((start, partIndex) => {
      const end = boundaries[partIndex + 1];

      return {
        activeRanges: lineRanges.filter(
          range => range.start < end && range.end > start,
        ),
        key: `${tokenIndex}:${partIndex}`,
        partContent: token.content.slice(start - tokenStart, end - tokenStart),
        sourceToken: token,
      };
    });
  }

  let tokenStart = 0;

  return line.flatMap((token, tokenIndex) => {
    const tokenParts = splitToken(token, tokenIndex, tokenStart);
    tokenStart += token.content.length;
    return tokenParts;
  });
}

/**
 * Group parts into one marker when they form a continuous highlight,
 * even if they belong to different diagnostics.
 */
function groupTokenParts(tokenParts: readonly TokenPart[]) {
  const groups: RenderGroup[] = [];

  for (const tokenPart of tokenParts) {
    if (tokenPart.activeRanges.length === 0) {
      groups.push({ kind: 'plain', tokenPart });
      continue;
    }

    const previousGroup = groups.at(-1);
    if (previousGroup?.kind === 'diagnostic') {
      previousGroup.tokenParts.push(tokenPart);
      previousGroup.ranges.push(...tokenPart.activeRanges);
      continue;
    }

    groups.push({
      kind: 'diagnostic',
      ranges: [...tokenPart.activeRanges],
      tokenParts: [tokenPart],
    });
  }

  return groups;
}

function getUniqueDiagnostics(ranges: readonly LineDiagnosticRange[]) {
  return [
    ...new Map(
      ranges.map(range => [range.diagnosticIndex, range.diagnostic] as const),
    ).values(),
  ];
}

/**
 * Renders diagnostics over Prism-highlighted tokens:
 * 1. Split tokens at diagnostic boundaries while preserving their token styles.
 * 2. Group parts that form one continuous highlighted span into a marker.
 * 3. Render each part with its original Prism token props.
 */
export function DiagnosticLine({
  classNames,
  firstVisibleDiagnosticIndices,
  getLineProps,
  getTokenProps,
  line,
  lineRanges,
  showLineNumbers,
}: DiagnosticLineProps): React.JSX.Element {
  const lineProps = getLineProps({
    className: clsx(
      classNames,
      showLineNumbers && styles.diagnosticLineWithNumbers,
    ),
    line,
  });

  function renderTokenPart(tokenPart: TokenPart) {
    const tokenProps = getTokenProps({
      token: { ...tokenPart.sourceToken, content: tokenPart.partContent },
    });

    return (
      <span key={tokenPart.key} {...tokenProps}>
        {tokenProps.children}
      </span>
    );
  }

  const groups = groupTokenParts(splitLineTokens(line, lineRanges));
  const renderedGroups = groups.map(group => {
    if (group.kind === 'plain') {
      return renderTokenPart(group.tokenPart);
    }

    return (
      <DiagnosticMarker
        key={group.tokenParts[0].key}
        focusable={group.ranges.some(range =>
          firstVisibleDiagnosticIndices.has(range.diagnosticIndex),
        )}
        diagnostics={getUniqueDiagnostics(group.ranges)}
      >
        {group.tokenParts.map(renderTokenPart)}
      </DiagnosticMarker>
    );
  });

  return (
    <div {...lineProps}>
      {showLineNumbers ? (
        <>
          <span className={styles.diagnosticLineNumber} />
          <span className={styles.diagnosticLineContent}>{renderedGroups}</span>
        </>
      ) : (
        renderedGroups
      )}
      <br />
    </div>
  );
}
