import plugin from '../../src/index';
import { logRule } from '../log';

const prefix = '@typescript-eslint/';

function checkConfigRecommended(): boolean {
  const { rules } = plugin;

  const recommended = plugin.configs.recommended.rules;
  const recommendedNames = new Set(Object.keys(recommended));

  return Object.entries(rules).reduce<boolean>((acc, [ruleName, rule]) => {
    if (
      !rule.meta.deprecated &&
      rule.meta.docs.recommended !== false &&
      rule.meta.docs.requiresTypeChecking !== true
    ) {
      const prefixed = `${prefix}${ruleName}` as keyof typeof recommended;
      if (recommendedNames.has(prefixed)) {
        if (recommended[prefixed] !== rule.meta.docs.recommended) {
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

export { checkConfigRecommended };
