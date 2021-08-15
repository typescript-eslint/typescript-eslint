import { TSESLint } from '@typescript-eslint/experimental-utils';

let rules: Map<string, TSESLint.RuleModule<string, unknown[]>> | null = null;

function getRules(): Map<string, TSESLint.RuleModule<string, unknown[]>> {
  return rules ?? (rules = new TSESLint.Linter().getRules());
}

interface RuleMap {
  'arrow-parens': typeof import('eslint/lib/rules/arrow-parens');
  'brace-style': typeof import('eslint/lib/rules/brace-style');
  'comma-dangle': typeof import('eslint/lib/rules/comma-dangle');
  'dot-notation': typeof import('eslint/lib/rules/dot-notation');
  indent: typeof import('eslint/lib/rules/indent');
  'init-declarations': typeof import('eslint/lib/rules/init-declarations');
  'keyword-spacing': typeof import('eslint/lib/rules/keyword-spacing');
  'lines-between-class-members': typeof import('eslint/lib/rules/lines-between-class-members');
  'no-dupe-args': typeof import('eslint/lib/rules/no-dupe-args');
  'no-dupe-class-members': typeof import('eslint/lib/rules/no-dupe-class-members');
  'no-duplicate-imports': typeof import('eslint/lib/rules/no-duplicate-imports');
  'no-empty-function': typeof import('eslint/lib/rules/no-empty-function');
  'no-extra-parens': typeof import('eslint/lib/rules/no-extra-parens');
  'no-extra-semi': typeof import('eslint/lib/rules/no-extra-semi');
  'no-implicit-globals': typeof import('eslint/lib/rules/no-implicit-globals');
  'no-invalid-this': typeof import('eslint/lib/rules/no-invalid-this');
  'no-loop-func': typeof import('eslint/lib/rules/no-loop-func');
  'no-loss-of-precision':
    | typeof import('eslint/lib/rules/no-loss-of-precision')
    | null /* ESLint < 7.1.0 */;
  'no-magic-numbers': typeof import('eslint/lib/rules/no-magic-numbers');
  'no-undef': typeof import('eslint/lib/rules/no-undef');
  'no-unused-expressions': typeof import('eslint/lib/rules/no-unused-expressions');
  'no-useless-constructor': typeof import('eslint/lib/rules/no-useless-constructor');
  'no-restricted-globals': typeof import('eslint/lib/rules/no-restricted-globals');
  'object-curly-spacing': typeof import('eslint/lib/rules/object-curly-spacing');
  'prefer-const': typeof import('eslint/lib/rules/prefer-const');
  quotes: typeof import('eslint/lib/rules/quotes');
  semi: typeof import('eslint/lib/rules/semi');
  'space-infix-ops': typeof import('eslint/lib/rules/space-infix-ops');
  strict: typeof import('eslint/lib/rules/strict');
}

type RuleId = keyof RuleMap;

export function getEslintCoreRule<R extends RuleId>(ruleId: R): RuleMap[R] {
  return (getRules().get(ruleId) ?? null) as RuleMap[R];
}
