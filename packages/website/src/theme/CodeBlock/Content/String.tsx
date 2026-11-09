// Change: parses `eslintrcHash` out of the metastring so that Layout can
// render the "Open in Playground" button.

import type { CodeBlockMetadata } from '@docusaurus/theme-common/internal';
import type { Props } from '@theme/CodeBlock/Content/String';

import { useThemeConfig } from '@docusaurus/theme-common';
import {
  CodeBlockContextProvider,
  createCodeBlockMetadata,
  useCodeWordWrap,
} from '@docusaurus/theme-common/internal';
import CodeBlockLayout from '@theme/CodeBlock/Layout';
import React from 'react';

import {
  CodeBlockDiagnosticsProvider,
  parseCodeBlockDiagnostics,
} from '../diagnostics';

export default function CodeBlockString(props: Props): React.JSX.Element {
  const metadata = useCodeBlockMetadata(props);
  const wordWrap = useCodeWordWrap();
  const eslintrcHash = parseEslintrc(props.metastring);
  const diagnostics = parseCodeBlockDiagnostics(props.metastring);

  return (
    <CodeBlockDiagnosticsProvider value={diagnostics}>
      <CodeBlockContextProvider metadata={metadata} wordWrap={wordWrap}>
        <CodeBlockLayout eslintrcHash={eslintrcHash} />
      </CodeBlockContextProvider>
    </CodeBlockDiagnosticsProvider>
  );
}

function useCodeBlockMetadata(props: Props): CodeBlockMetadata {
  const { prism } = useThemeConfig();

  return createCodeBlockMetadata({
    className: props.className,
    code: props.children,
    defaultLanguage: prism.defaultLanguage,
    language: props.language,
    magicComments: prism.magicComments,
    metastring: props.metastring,
    showLineNumbers: props.showLineNumbers,
    title: props.title,
  });
}

const eslintrcHashRegex = /eslintrcHash=(?<quote>["'])(?<eslintrcHash>.*?)\1/;

function parseEslintrc(metastring?: string): string {
  return metastring?.match(eslintrcHashRegex)?.groups?.eslintrcHash ?? '';
}
