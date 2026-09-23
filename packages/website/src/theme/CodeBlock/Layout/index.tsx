// Change: renders the "Open in Playground" button for code blocks that declare
// an `eslintrcHash` in their metastring.

import type { Props } from '@theme/CodeBlock/Layout';

import { useCodeBlockContext } from '@docusaurus/theme-common/internal';
import Buttons from '@theme/CodeBlock/Buttons';
import Container from '@theme/CodeBlock/Container';
import Content from '@theme/CodeBlock/Content';
import Title from '@theme/CodeBlock/Title';
import clsx from 'clsx';
import * as lz from 'lz-string';
import React from 'react';

import { TryInPlayground } from '../../MDXComponents/TryInPlayground';
import { getVisibleCodeLines } from '../utils';
import custom from './custom.module.css';
import styles from './styles.module.css';

// `eslintrcHash` comes from the code block's metastring, which Docusaurus
// doesn't expose on `CodeBlockMetadata`. Content/String parses it out and
// passes it down to us.
declare module '@theme/CodeBlock/Layout' {
  interface Props {
    readonly eslintrcHash?: string;
  }
}

export default function CodeBlockLayout({
  className,
  eslintrcHash,
}: Props): React.JSX.Element {
  const { metadata } = useCodeBlockContext();

  const codeLines = getVisibleCodeLines(metadata);
  const codeHash = lz.compressToEncodedURIComponent(codeLines.join('\n'));
  const needsMorePadding = (codeLines.at(-1)?.length ?? 0) > 50;

  return (
    <Container as="div" className={clsx(className, metadata.className)}>
      {metadata.title && (
        <div className={clsx(styles.codeBlockTitle, custom.codeBlockTitle)}>
          <Title>{metadata.title}</Title>
        </div>
      )}
      <div
        className={clsx(
          styles.codeBlockContent,
          custom.codeBlockContent,
          eslintrcHash && custom.codeBlockContentWithPlayground,
          eslintrcHash &&
            needsMorePadding &&
            custom.codeBlockContentMorePadding,
        )}
      >
        <Content />
        {eslintrcHash && (
          <TryInPlayground
            className={clsx(
              'button button--primary button--outline',
              custom.playgroundButton,
            )}
            codeHash={codeHash}
            eslintrcHash={eslintrcHash}
            language={metadata.language}
          >
            Open in Playground
          </TryInPlayground>
        )}
        <Buttons />
      </div>
    </Container>
  );
}
