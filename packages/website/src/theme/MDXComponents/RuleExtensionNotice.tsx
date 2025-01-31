import Link from '@docusaurus/Link';
import React from 'react';

import { Feature } from './Feature';

export function RuleExtensionNotice(): React.JSX.Element {
  return (
    <Feature emoji="🧱">
      This is an "extension" rule that replaces a core ESLint rule to work with
      TypeScript. See{' '}
      <Link href="/rules#extension-rules">Rules &gt; Extension Rules</Link> for
      more information.
    </Feature>
  );
}
