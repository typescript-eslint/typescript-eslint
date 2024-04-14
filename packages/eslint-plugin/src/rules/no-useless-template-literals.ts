import { createRule } from '../util';
import type { NoUselessTemplateExpressionMessageId } from './no-useless-template-expression';
import { makeNoUselessTemplateExpressionRuleObject } from './no-useless-template-expression';

// This rule was renamed to `no-useless-template-expression`.
// This module's purpose is just to import the code from the new implementation
// and adjust its metadata to account for the renaming.
// See https://github.com/typescript-eslint/typescript-eslint/issues/8544

const ruleObject = makeNoUselessTemplateExpressionRuleObject();
// @ts-expect-error: easier than asserting this as mutable or deep object spreads.
ruleObject.name = 'no-useless-template-literals';
ruleObject.meta.replacedBy = [
  '@typescript-eslint/no-useless-template-expression',
];
ruleObject.meta.deprecated = true;
// not recommended anymore; the new rule is recommended instead.
delete ruleObject.meta.docs.recommended;

export default createRule<[], NoUselessTemplateExpressionMessageId>(ruleObject);
