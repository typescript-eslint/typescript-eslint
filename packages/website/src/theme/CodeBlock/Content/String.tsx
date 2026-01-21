// Change: added `copiedCode` which filters out the removed lines

import type { Props } from '@theme/CodeBlock/Content/String';

import { usePrismTheme, useThemeConfig } from '@docusaurus/theme-common';
import {
  containsLineNumbers,
  parseCodeBlockTitle,
  parseLanguage,
  parseLines,
  useCodeWordWrap,
} from '@docusaurus/theme-common/internal';
import CopyButton from '@theme/CodeBlock/Buttons/CopyButton';
import WordWrapButton from '@theme/CodeBlock/Buttons/WordWrapButton';
import Container from '@theme/CodeBlock/Container';
import Line from '@theme/CodeBlock/Line';
import clsx from 'clsx';
import * as lz from 'lz-string';
import { Highlight } from 'prism-react-renderer';
import React from 'react';

import { TryInPlayground } from '../../MDXComponents/TryInPlayground';
import styles from './styles.module.css';

export default function CodeBlockString({
  children,
  className: blockClassName = '',
  language: languageProp,
  metastring,
  showLineNumbers: showLineNumbersProp,
  title: titleProp,
}: Props): React.JSX.Element {
  const {
    prism: { defaultLanguage, magicComments },
  } = useThemeConfig();
  const language =
    languageProp ?? parseLanguage(blockClassName) ?? defaultLanguage;
  const prismTheme = usePrismTheme();
  const wordWrap = useCodeWordWrap();

  // We still parse the metastring in case we want to support more syntax in the
  // future. Note that MDX doesn't strip quotes when parsing metastring:
  // "title=\"xyz\"" => title: "\"xyz\""
  const title = parseCodeBlockTitle(metastring) || titleProp;

  const { code, lineClassNames } = parseLines(children, {
    language,
    magicComments,
    metastring,
  });
  const showLineNumbers =
    showLineNumbersProp ?? containsLineNumbers(metastring);

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

  return (
    <Container
      as="div"
      className={clsx(
        blockClassName,
        language &&
          !blockClassName.includes(`language-${language}`) &&
          `language-${language}`,
      )}
    >
      {title && <div className={styles.codeBlockTitle}>{title}</div>}
      <div className={styles.codeBlockContent}>
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
        </Highlight>
        {eslintrcHash && (
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
        )}
        <div className={styles.buttonGroup}>
          {(wordWrap.isEnabled || wordWrap.isCodeScrollable) && (
            <WordWrapButton
              className={styles.codeButton}
              isEnabled={wordWrap.isEnabled}
              onClick={(): void => wordWrap.toggle()}
            />
          )}
          <CopyButton className={styles.codeButton} code={copiedCode} />
        </div>
      </div>
    </Container>
  );
}

const eslintrcHashRegex = /eslintrcHash=(?<quote>["'])(?<eslintrcHash>.*?)\1/;

function parseEslintrc(metastring?: string): string {
  return metastring?.match(eslintrcHashRegex)?.groups?.eslintrcHash ?? '';
}
