import pluginRules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import type { Plugin } from 'unified';

import { addESLintHashToCodeBlocksMeta } from './addESLintHashToCodeBlocksMeta';
import { insertBaseRuleReferences } from './insertions/insertBaseRuleReferences';
import { insertFormattingNotice } from './insertions/insertFormattingNotice';
import { insertNewRuleReferences } from './insertions/insertNewRuleReferences';
import { insertResources } from './insertions/insertResources';
import { insertRuleDescription } from './insertions/insertRuleDescription';
import { insertSpecialCaseOptions } from './insertions/insertSpecialCaseOptions';
import { insertWhenNotToUseIt } from './insertions/insertWhenNotToUseIt';
import { nodeIsParent } from './nodes';
import { removeSourceCodeNotice } from './removeSourceCodeNotice';
import { ensureRequiredHeadings } from './requiredHeadings';
import { isRuleMetaDataDocs, isVFileWithStem } from './types';

export const generatedRuleDocs: Plugin = () => {
  return (root, file) => {
    if (!nodeIsParent(root) || !isVFileWithStem(file)) {
      return;
    }

    const rule = pluginRules[file.stem];
    const meta = rule?.meta;
    if (!isRuleMetaDataDocs(meta)) {
      return;
    }

    const { children } = root;

    removeSourceCodeNotice(children);
    insertRuleDescription(children, file, meta);
    insertFormattingNotice(children, meta);

    const headingIndices = ensureRequiredHeadings(children, meta);
    const eslintrc = meta.docs.extendsBaseRule
      ? insertBaseRuleReferences(children, file, meta, headingIndices)
      : insertNewRuleReferences(children, file, meta, headingIndices, rule);

    insertSpecialCaseOptions(children, file, headingIndices);
    insertWhenNotToUseIt(children, headingIndices, meta);
    insertResources(children, file, meta);
    addESLintHashToCodeBlocksMeta(children, eslintrc, file);
  };
};
