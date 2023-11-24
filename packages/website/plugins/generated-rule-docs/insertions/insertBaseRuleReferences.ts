import type * as mdast from 'mdast';
import type * as unist from 'unist';

import { spliceChildrenAndAdjustHeadings } from '../spliceChildrenAndAdjustHeadings';
import type { RequiredHeadingIndices } from '../requiredHeadings';
import { convertToPlaygroundHash, getEslintrcString } from '../strings';
import type { RuleMetaDataWithDocs, VFileWithStem } from '../types';

export function insertBaseRuleReferences(
  children: unist.Node[],
  file: VFileWithStem,
  meta: RuleMetaDataWithDocs,
  headingIndices: RequiredHeadingIndices,
): string {
  const extendsBaseRuleName =
    typeof meta.docs.extendsBaseRule === 'string'
      ? meta.docs.extendsBaseRule
      : file.stem;

  spliceChildrenAndAdjustHeadings(
    children,
    headingIndices,
    headingIndices.options + 1,
    0,
    {
      children: [
        {
          value: 'See ',
          type: 'text',
        },
        {
          children: [
            {
              type: 'inlineCode',
              value: `eslint/${extendsBaseRuleName}`,
            },
            {
              type: 'text',
              value: ' options',
            },
          ],
          type: 'link',
          url: `https://eslint.org/docs/rules/${extendsBaseRuleName}#options`,
        },
        {
          type: 'text',
          value: '.',
        },
      ],
      type: 'paragraph',
    } as mdast.Paragraph,
  );

  const eslintrc = getEslintrcString(extendsBaseRuleName, file.stem, false);

  spliceChildrenAndAdjustHeadings(
    children,
    headingIndices,
    headingIndices.howToUse + 1,
    0,
    {
      lang: 'js',
      type: 'code',
      meta: 'title=".eslintrc.cjs"',
      value: `module.exports = ${getEslintrcString(
        extendsBaseRuleName,
        file.stem,
        true,
      )};`,
    } as mdast.Code,
    {
      value: `<try-in-playground eslintrcHash="${convertToPlaygroundHash(
        eslintrc,
      )}">Try this rule in the playground ↗</try-in-playground>`,
      type: 'jsx',
    } as unist.Node,
  );

  return eslintrc;
}
