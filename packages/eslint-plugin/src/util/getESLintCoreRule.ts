import { ESLintUtils } from '@typescript-eslint/utils';
import { version } from 'eslint/package.json';
import * as semver from 'semver';

const isESLintV8 = semver.major(version) >= 8;

interface RuleMap {
  /* eslint-disable @typescript-eslint/consistent-type-imports -- more concise to use inline imports */
  'arrow-parens': typeof import('eslint/lib/rules/arrow-parens');
  'brace-style': typeof import('eslint/lib/rules/brace-style');
  'comma-dangle': typeof import('eslint/lib/rules/comma-dangle');
  'dot-notation': typeof import('eslint/lib/rules/dot-notation');
  indent: typeof import('eslint/lib/rules/indent');
  'init-declarations': typeof import('eslint/lib/rules/init-declarations');
  'key-spacing': typeof import('eslint/lib/rules/key-spacing');
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
  'no-loss-of-precision': typeof import('eslint/lib/rules/no-loss-of-precision');
  'no-magic-numbers': typeof import('eslint/lib/rules/no-magic-numbers');
  'no-restricted-imports': typeof import('eslint/lib/rules/no-restricted-imports');
  'no-undef': typeof import('eslint/lib/rules/no-undef');
  'no-unused-expressions': typeof import('eslint/lib/rules/no-unused-expressions');
  'no-useless-constructor': typeof import('eslint/lib/rules/no-useless-constructor');
  'no-restricted-globals': typeof import('eslint/lib/rules/no-restricted-globals');
  'object-curly-spacing': typeof import('eslint/lib/rules/object-curly-spacing');
  'prefer-const': typeof import('eslint/lib/rules/prefer-const');
  quotes: typeof import('eslint/lib/rules/quotes');
  semi: typeof import('eslint/lib/rules/semi');
  'space-before-blocks': typeof import('eslint/lib/rules/space-before-blocks');
  'space-infix-ops': typeof import('eslint/lib/rules/space-infix-ops');
  strict: typeof import('eslint/lib/rules/strict');
  /* eslint-enable @typescript-eslint/consistent-type-imports */
}

type RuleId = keyof RuleMap;

export const getESLintCoreRule: <R extends RuleId>(ruleId: R) => RuleMap[R] =
  isESLintV8
    ? <R extends RuleId>(ruleId: R): RuleMap[R] =>
        ESLintUtils.nullThrows(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          require('eslint/use-at-your-own-risk').builtinRules.get(
            ruleId,
          ) as RuleMap[R],
          `ESLint's core rule '${ruleId}' not found.`,
        )
    : <R extends RuleId>(ruleId: R): RuleMap[R] =>
        require(`eslint/lib/rules/${ruleId}`) as RuleMap[R];

export function maybeGetESLintCoreRule<R extends RuleId>(
  ruleId: R,
): RuleMap[R] | null {
  try {
    return getESLintCoreRule<R>(ruleId);
  } catch {
    return null;
  }
}
