import pluginRules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import type { Plugin } from 'unified';

import { addESLintHashToCodeBlocksMeta } from './addESLintHashToCodeBlocksMeta';
import { nodeIsParent } from './nodes';
import { pushResources } from './pushResources';
import { removeSourceCodeNotice } from './removeSourceCodeNotice';
import { ensureRequiredHeadings } from './requiredHeadings';
import { spliceBaseRuleReferences } from './spliceBaseRuleReferences';
import { spliceNewRuleReferences } from './spliceNewRuleReferences';
import { spliceSpecialCaseOptions } from './spliceSpecialCaseOptions';
import { spliceWhenNotToUseIt } from './spliceWhenNotToUseIt';
import { isRuleMetaDataDocs, isVFileWithStem } from './types';
import { unshiftFormattingNotice } from './unshiftFormattingNotice';
import { unshiftRuleDescription } from './unshiftRuleDescription';

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
    unshiftRuleDescription(children, file, meta);
    unshiftFormattingNotice(children, meta);

    const headingIndices = ensureRequiredHeadings(children, meta);
    const eslintrc = meta.docs.extendsBaseRule
      ? spliceBaseRuleReferences(children, file, meta, headingIndices)
      : spliceNewRuleReferences(children, file, meta, headingIndices, rule);

    spliceSpecialCaseOptions(children, file, headingIndices);
    spliceWhenNotToUseIt(children, headingIndices, meta);
    pushResources(children, file, meta);
    addESLintHashToCodeBlocksMeta(children, eslintrc, file);
  };
};
