import { TSESLint, ESLintUtils } from '@typescript-eslint/experimental-utils';
import { RuleTester as ESLintRuleTester } from 'eslint';

const RuleTester: TSESLint.RuleTester = ESLintRuleTester as any;
const { batchedSingleLineTests } = ESLintUtils;

export { RuleTester, batchedSingleLineTests };
