import type * as unist from 'unist';

import type { RuleMetaDataWithDocs } from '../utils';

export function insertFormattingNotice(
  children: unist.Node[],
  meta: RuleMetaDataWithDocs,
): void {
  if (meta.type === 'layout') {
    const warningNode = {
      value: `
<admonition type="warning">
This rule will soon be moved to <a href="https://eslint.style">eslint-stylistic</a>.
See <a href="/linting/troubleshooting/formatting">What About Formatting?</a> for more information.
</admonition>
`,
      type: 'jsx',
    };
    children.unshift(warningNode);
  }
}
