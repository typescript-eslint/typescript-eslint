import pluginRules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import type { Plugin } from 'unified';

import { addESLintHashToCodeBlocksMeta } from './addESLintHashToCodeBlocksMeta';
import { createRuleDocsPage } from './createRuleDocsPage';
import { insertBaseRuleReferences } from './insertions/insertBaseRuleReferences';
import { insertFormattingNotice } from './insertions/insertFormattingNotice';
import { insertNewRuleReferences } from './insertions/insertNewRuleReferences';
import { insertResources } from './insertions/insertResources';
import { insertRuleDescription } from './insertions/insertRuleDescription';
import { insertSpecialCaseOptions } from './insertions/insertSpecialCaseOptions';
import { insertWhenNotToUseIt } from './insertions/insertWhenNotToUseIt';
import { removeSourceCodeNotice } from './removeSourceCodeNotice';
import {
  isRuleModuleWithMetaDocs,
  isVFileWithStem,
  nodeIsParent,
} from './utils';

export const generatedRuleDocs: Plugin = () => {
  return (root, file) => {
    if (!nodeIsParent(root) || !isVFileWithStem(file)) {
      return;
    }

    const rule = pluginRules[file.stem];
    if (!isRuleModuleWithMetaDocs(rule)) {
      return;
    }

    const page = createRuleDocsPage(root.children, file, rule);

    removeSourceCodeNotice(page);
    insertRuleDescription(page);
    insertFormattingNotice(page);

    const eslintrc = rule.meta.docs.extendsBaseRule
      ? insertBaseRuleReferences(page)
      : insertNewRuleReferences(page);

    insertSpecialCaseOptions(page);
    insertWhenNotToUseIt(page);
    insertResources(page);
    addESLintHashToCodeBlocksMeta(page, eslintrc);
  };
};
