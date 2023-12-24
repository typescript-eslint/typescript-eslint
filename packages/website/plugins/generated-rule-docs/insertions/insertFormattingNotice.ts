import type * as unist from 'unist';

import type { RuleDocsPage } from '../RuleDocsPage';

export function insertFormattingNotice(page: RuleDocsPage): void {
  if (page.rule.meta.type !== 'layout') {
    return;
  }

  const replacement = page.rule.meta.replacedBy!.find(e =>
    e.startsWith('@stylistic/'),
  );
  const url =
    replacement &&
    `https://eslint.style/rules/default/${replacement.replace(
      '@stylistic/',
      '',
    )}`;

  page.spliceChildren(0, 0, {
    value: `
<admonition title="Deprecated" type="warning">
Formatting rules now live in <a href="https://eslint.style">eslint-stylistic</a>. ${
      url
        ? ` <a href="${url}">${replacement}</a> is the replacement for this rule. `
        : ''
    }
<br />
See <a href="/linting/troubleshooting/formatting">What About Formatting?</a> for more information.
</admonition>
`,
    type: 'jsx',
  } as unist.Node);
}
