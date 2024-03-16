import type * as unist from 'unist';

import type { RuleDocsPage } from '../RuleDocsPage';

export function insertFormattingNotice(page: RuleDocsPage): void {
  const replacement = page.rule.meta.replacedBy?.find(e =>
    e.startsWith('@stylistic/'),
  );
  if (!replacement) {
    return;
  }

  const url =
    replacement &&
    `https://eslint.style/rules/${replacement.replace('@stylistic/', '')}`;

  page.spliceChildren(0, 0, {
    value: `
<admonition title="Deprecated" type="warning">
Formatting rules now live in <a href="https://eslint.style">eslint-stylistic</a>. ${
      url
        ? ` <a href="${url}">${replacement}</a> is the replacement for this rule. `
        : ''
    }
<br />
See <a href="/blog/deprecating-formatting-rules">Deprecating Formatting Rules</a> for more information.
</admonition>
`,
    type: 'jsx',
  } as unist.Node);
}
