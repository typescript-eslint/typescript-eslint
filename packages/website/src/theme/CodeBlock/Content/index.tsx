import type { Props } from '@theme/CodeBlock/Content';
import type { Token } from 'prism-react-renderer';
import type { ComponentProps, ReactNode, Ref } from 'react';

import { usePrismTheme } from '@docusaurus/theme-common';
import { useCodeBlockContext } from '@docusaurus/theme-common/internal';
import Line from '@theme/CodeBlock/Line';
import clsx from 'clsx';
import { Highlight } from 'prism-react-renderer';
import React from 'react';

import type { CodeDiagnostic } from '../../../../plugins/generated-rule-docs/codeDiagnostics';

import { getLineDiagnosticRanges } from '../diagnosticRanges';
import { useCodeBlockDiagnostics } from '../diagnostics';
import { DiagnosticLine } from './DiagnosticLine';
import styles from './styles.module.css';

function getLinesWithDiagnostics(
  lines: Token[][],
  diagnostics: readonly CodeDiagnostic[],
) {
  const previouslyVisibleDiagnosticIndices = new Set<number>();

  return lines.map((line, lineIndex) => {
    const visibleRanges = getLineDiagnosticRanges(
      diagnostics,
      lineIndex,
      line.reduce((length, token) => length + token.content.length, 0),
    );
    const firstVisibleDiagnosticIndices = new Set<number>();
    for (const { diagnosticIndex } of visibleRanges) {
      if (!previouslyVisibleDiagnosticIndices.has(diagnosticIndex)) {
        firstVisibleDiagnosticIndices.add(diagnosticIndex);
      }
      previouslyVisibleDiagnosticIndices.add(diagnosticIndex);
    }

    return { firstVisibleDiagnosticIndices, line, ranges: visibleRanges };
  });
}

const Pre = React.forwardRef<HTMLPreElement, ComponentProps<'pre'>>(
  (props, ref) => (
    <pre
      ref={ref}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      {...props}
      className={clsx(props.className, styles.codeBlock, 'thin-scrollbar')}
    />
  ),
);

function Code(props: ComponentProps<'code'>) {
  const { metadata } = useCodeBlockContext();
  return (
    <code
      {...props}
      className={clsx(
        props.className,
        styles.codeBlockLines,
        metadata.lineNumbersStart != null && styles.codeBlockLinesWithNumbering,
      )}
      style={{
        ...props.style,
        // Use the same logic to preserve Docusaurus's line-numbering behavior.
        counterReset:
          metadata.lineNumbersStart == null
            ? undefined
            : `line-count ${metadata.lineNumbersStart - 1}`,
      }}
    />
  );
}

export default function CodeBlockContent({
  className: classNameProp,
}: Props): ReactNode {
  const { metadata, wordWrap } = useCodeBlockContext();
  const diagnostics = useCodeBlockDiagnostics();
  const prismTheme = usePrismTheme();
  const { code, language, lineClassNames, lineNumbersStart } = metadata;

  return (
    <Highlight code={code} language={language} theme={prismTheme}>
      {({ className, getLineProps, getTokenProps, style, tokens: lines }) => {
        const linesWithDiagnostics = getLinesWithDiagnostics(
          lines,
          diagnostics,
        );

        return (
          <Pre
            ref={wordWrap.codeBlockRef as Ref<HTMLPreElement>}
            className={clsx(classNameProp, className)}
            style={style}
          >
            <Code>
              {linesWithDiagnostics.map(
                ({ firstVisibleDiagnosticIndices, line, ranges }, index) =>
                  ranges.length === 0 ? (
                    <Line
                      key={index}
                      classNames={lineClassNames[index]}
                      getLineProps={getLineProps}
                      getTokenProps={getTokenProps}
                      line={line}
                      showLineNumbers={lineNumbersStart != null}
                    />
                  ) : (
                    <DiagnosticLine
                      key={index}
                      classNames={lineClassNames[index]}
                      firstVisibleDiagnosticIndices={
                        firstVisibleDiagnosticIndices
                      }
                      getLineProps={getLineProps}
                      getTokenProps={getTokenProps}
                      line={line}
                      ranges={ranges}
                      showLineNumbers={lineNumbersStart != null}
                    />
                  ),
              )}
            </Code>
          </Pre>
        );
      }}
    </Highlight>
  );
}
