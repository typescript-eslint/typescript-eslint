import { nullThrows } from '@typescript-eslint/eslint-plugin/src/util';

export function getESLintCoreRule(ruleId) {
  return nullThrows(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    require('eslint/use-at-your-own-risk').builtinRules.get(ruleId),
    `ESLint's core rule '${ruleId}' not found.`,
  );
}

export function maybeGetESLintCoreRule(ruleId) {
  try {
    return getESLintCoreRule(ruleId);
  } catch {
    return null;
  }
}
