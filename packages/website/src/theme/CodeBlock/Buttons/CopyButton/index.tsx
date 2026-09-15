// Change: copies the code without the removed lines.

import type { Props } from '@theme/CodeBlock/Buttons/CopyButton';

import {
  CodeBlockContextProvider,
  useCodeBlockContext,
} from '@docusaurus/theme-common/internal';
import CopyButton from '@theme-original/CodeBlock/Buttons/CopyButton';
import React from 'react';

import { getVisibleCodeLines } from '../../utils';

export default function CopyButtonWrapper(props: Props): React.JSX.Element {
  const { metadata, wordWrap } = useCodeBlockContext();

  return (
    <CodeBlockContextProvider
      metadata={{ ...metadata, code: getVisibleCodeLines(metadata).join('\n') }}
      wordWrap={wordWrap}
    >
      <CopyButton {...props} />
    </CodeBlockContextProvider>
  );
}
