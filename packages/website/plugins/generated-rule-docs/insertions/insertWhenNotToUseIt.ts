import type { RuleDocsPage } from '../RuleDocsPage';

import { nodeIsHeading } from '../../utils/nodes';

export function insertWhenNotToUseIt(page: RuleDocsPage): void {
  if (!page.rule.meta.docs.requiresTypeChecking) {
    return;
  }

  const hasExistingText =
    page.headingIndices.whenNotToUseIt < page.children.length - 1 &&
    page.children[page.headingIndices.whenNotToUseIt + 1].type !== 'heading';

  const nextHeadingIndex =
    page.children.findIndex(
      child => nodeIsHeading(child) && child.depth === 2,
      page.headingIndices.whenNotToUseIt + 1,
    ) +
    page.headingIndices.whenNotToUseIt +
    1;

  page.spliceChildren(
    nextHeadingIndex === -1 ? page.children.length : nextHeadingIndex - 1,
    0,
    ...(hasExistingText ? ['---'] : []),
    'Type checked lint rules are more powerful than traditional lint rules, but also require configuring [type checked linting](/getting-started/typed-linting).',
    'See [Troubleshooting > Linting with Type Information > Performance](/troubleshooting/typed-linting/performance) if you experience performance degradations after enabling type checked rules.',
  );
}
