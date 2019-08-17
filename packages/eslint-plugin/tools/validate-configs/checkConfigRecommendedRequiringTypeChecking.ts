import plugin from '../../src/index';
import { logRule } from '../log';

const prefix = '@typescript-eslint/';

function checkConfigRecommendedRequiringTypeChecking(): boolean {
  const { rules } = plugin;

  const recommendedRequiringTypeChecking =
    plugin.configs['recommended-requiring-type-checking'].rules;
  const recommendedNames = new Set(
    Object.keys(recommendedRequiringTypeChecking),
  );

  return Object.entries(rules).reduce<boolean>((acc, [ruleName, rule]) => {
    if (
      !rule.meta.deprecated &&
      rule.meta.docs.recommended !== false &&
      rule.meta.docs.requiresTypeChecking === true
    ) {
      const prefixed = `${prefix}${ruleName}` as keyof typeof recommendedRequiringTypeChecking;
      if (recommendedNames.has(prefixed)) {
        if (
          recommendedRequiringTypeChecking[prefixed] !==
          rule.meta.docs.recommended
        ) {
          logRule(
            false,
            ruleName,
            'incorrect setting compared to the rule meta.',
          );
          return true;
        }
      } else {
        logRule(false, ruleName, 'missing in the config.');
        return true;
      }
    }

    logRule(true, ruleName);
    return acc;
  }, false);
}

export { checkConfigRecommendedRequiringTypeChecking };
