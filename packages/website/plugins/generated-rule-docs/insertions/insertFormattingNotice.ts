import type * as unist from 'unist';

import type { RuleDocsPage } from '../RuleDocsPage';

export function insertFormattingNotice(page: RuleDocsPage): void {
  if (page.rule.meta.type === 'layout') {
    page.spliceChildren(0, 0, {
      value: `
<admonition title="Deprecated" type="warning">
This rule is deprecated. Formatting rules now live in <a href="https://eslint.style">eslint-stylistic</a>.
See <a href="/linting/troubleshooting/formatting">What About Formatting?</a> for more information.
</admonition>
`,
      type: 'jsx',
    } as unist.Node);
  }
}
