import type { ESLintPluginRuleModule } from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import type * as mdast from 'mdast';
import type * as unist from 'unist';

import type { HeadingName } from './RuleDocsPage';
import { requiredHeadingNames, RuleDocsPage } from './RuleDocsPage';
import type { VFileWithStem } from './utils';
import { findH2Index } from './utils';

export function createRuleDocsPage(
  children: unist.Node[],
  file: Readonly<VFileWithStem>,
  rule: Readonly<ESLintPluginRuleModule>,
): RuleDocsPage {
  const headingIndices = requiredHeadingNames.map(headingName =>
    findH2Index(children, headingName),
  );

  function insertIfMissing(
    headingName: HeadingName,
    insertionIndex?: number,
  ): void {
    if (headingIndices[requiredHeadingNames.indexOf(headingName)] !== -1) {
      return;
    }

    // Unless otherwise specified: if the heading doesn't yet exist,
    // insert it before the first heading that does,
    // or if none yet exist, push it to the end of children.
    insertionIndex ??=
      headingIndices.find(existingIndex => existingIndex !== -1) ??
      children.length;

    children.splice(insertionIndex, 0, {
      children: [
        {
          type: 'text',
          value: headingName,
        },
      ],
      depth: 2,
      type: 'heading',
    } as mdast.Heading);
  }

  insertIfMissing('Options');

  if (rule.meta.docs.extendsBaseRule) {
    insertIfMissing('How to Use');
  }

  if (rule.meta.docs.requiresTypeChecking) {
    insertIfMissing(
      'When Not To Use It',
      headingIndices[3] === -1 ? children.length : headingIndices[3],
    );
  }

  return new RuleDocsPage(children, file, rule);
}
