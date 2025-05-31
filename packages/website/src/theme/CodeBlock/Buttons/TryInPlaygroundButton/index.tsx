import { type ReactNode } from 'react';
import { TryInPlayground } from '../../../MDXComponents/TryInPlayground';
import { usePrismTheme, useThemeConfig } from '@docusaurus/theme-common';
import { parseLanguage, parseLines } from '@docusaurus/theme-common/internal';
import type { Props } from '@theme/CodeBlock/Buttons/TryInPlaygroundButton';
import Line from '@theme/CodeBlock/Line';
import clsx from 'clsx';
import * as lz from 'lz-string';
import { Highlight } from 'prism-react-renderer';
import styles from './styles.module.css';

export default function TryInPlaygroundButton({
  children,
  className: blockClassName = '',
  language: languageProp,
  metastring,
  showLineNumbers: showLineNumbersProp,
}: Props): ReactNode {
  const {
    prism: { defaultLanguage, magicComments },
  } = useThemeConfig();
  const language =
    languageProp ?? parseLanguage(blockClassName) ?? defaultLanguage;
  const prismTheme = usePrismTheme();

  const { code, lineClassNames } = parseLines(children, {
    language,
    magicComments,
    metastring,
  });

  const codeLines = code
    .split('\n')
    .filter(
      (c, i) =>
        !(lineClassNames[i] as string[] | undefined)?.includes(
          'code-block-removed-line',
        ),
    );
  const copiedCode = codeLines.join('\n');
  const lastLineOfCodeLength = codeLines.at(-1)?.length ?? 0;
  const needsMorePadding = lastLineOfCodeLength > 50;

  const eslintrcHash = parseEslintrc(metastring);

  <Highlight code={code} language={language ?? 'text'} theme={prismTheme}>
    {({
      className,
      getLineProps,
      getTokenProps,
      tokens,
    }): React.JSX.Element => (
      <pre
        className={clsx(className, styles.codeBlock, 'thin-scrollbar')}
        ref={wordWrap.codeBlockRef}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <code
          className={clsx(
            styles.codeBlockLines,
            eslintrcHash &&
              needsMorePadding &&
              styles.codeBlockLinesMorePadding,
            showLineNumbers && styles.codeBlockLinesWithNumbering,
          )}
        >
          {tokens.map((line, i) => (
            <Line
              classNames={lineClassNames[i]}
              getLineProps={getLineProps}
              getTokenProps={getTokenProps}
              key={i}
              line={line}
              showLineNumbers={showLineNumbers}
            />
          ))}
        </code>
      </pre>
    )}
  </Highlight>;
  {
    eslintrcHash && (
      <TryInPlayground
        className={clsx(
          'button button--primary button--outline',
          styles.playgroundButton,
        )}
        codeHash={lz.compressToEncodedURIComponent(copiedCode)}
        eslintrcHash={eslintrcHash}
        language={language}
      >
        Open in Playground
      </TryInPlayground>
    );
  }
}

const eslintrcHashRegex = /eslintrcHash=(?<quote>["'])(?<eslintrcHash>.*?)\1/;

function parseEslintrc(metastring?: string): string {
  return metastring?.match(eslintrcHashRegex)?.groups?.eslintrcHash ?? '';
}
