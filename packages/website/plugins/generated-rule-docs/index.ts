import type { RuleModuleWithMetaDocs } from '@typescript-eslint/utils/ts-eslint';
import type * as mdast from 'mdast';
import type { Plugin } from 'unified';

import pluginRules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import { fromMarkdown } from 'mdast-util-from-markdown';

import type { RuleDocsPage } from './RuleDocsPage';

import { nodeIsParagraph, nodeIsParent } from '../utils/nodes';
import { isESLintPluginRuleModule, isVFileWithStem } from '../utils/rules';
import { addESLintHashToCodeBlocksMeta } from './addESLintHashToCodeBlocksMeta';
import { createRuleDocsPage } from './createRuleDocsPage';
import { insertBaseRuleReferences } from './insertions/insertBaseRuleReferences';
import { insertNewRuleReferences } from './insertions/insertNewRuleReferences';
import { insertResources } from './insertions/insertResources';
import { insertRuleDescription } from './insertions/insertRuleDescription';
import { insertRuleOptions } from './insertions/insertRuleOptions';
import { insertWhenNotToUseIt } from './insertions/insertWhenNotToUseIt';
import { removeSourceCodeNotice } from './removeSourceCodeNotice';

export const generatedRuleDocs: Plugin = () => {
  return async (root, file) => {
    if (!nodeIsParent(root) || !isVFileWithStem(file)) {
      return;
    }

    const rule = pluginRules[file.stem];
    if (!isESLintPluginRuleModule(rule)) {
      return;
    }

    const page = createRuleDocsPage(root.children, file, rule);

    removeSourceCodeNotice(page);
    insertRuleDescription(page);

    const eslintrc = rule.meta.docs.extendsBaseRule
      ? insertBaseRuleReferences(page)
      : await insertNewRuleReferences(page);

    insertWhenNotToUseIt(page);
    insertResources(page);
    insertRuleOptions(page);
    addESLintHashToCodeBlocksMeta(page, eslintrc);
    insertExtensionNotice(page, rule, file.stem);
  };
};

function insertExtensionNotice(
  page: RuleDocsPage,
  rule: RuleModuleWithMetaDocs<string, unknown[], pluginRules.ESLintPluginDocs>,
  stem: string,
) {
  if (!rule.meta.docs.extendsBaseRule) {
    return;
  }

  const baseRule =
    typeof rule.meta.docs.extendsBaseRule === 'string'
      ? rule.meta.docs.extendsBaseRule
      : stem;

  const firstParagraph = page.children.find(nodeIsParagraph);

  if (!firstParagraph) {
    if (rule.meta.deprecated) {
      return;
    }

    throw new Error(`Missing first paragraph for extension rule ${stem}.`);
  }

  const addition = fromMarkdown(
    `This rule extends the base [\`${baseRule}\`](https://eslint.org/docs/latest/rules/${baseRule}) rule from ESLint core.`,
  );

  firstParagraph.children.unshift(
    ...(addition.children[0] as mdast.Paragraph).children,
    {
      type: 'text',
      value: ' ',
    },
  );
}
