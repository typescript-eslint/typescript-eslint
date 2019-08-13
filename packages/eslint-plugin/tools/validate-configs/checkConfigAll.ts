import plugin from '../../src/index';
import { logRule } from '../log';

const prefix = '@typescript-eslint/';

function checkConfigAll(): boolean {
  const { rules } = plugin;

  const all = plugin.configs.all.rules;
  const allNames = new Set(Object.keys(all));

  return Object.entries(rules).reduce<boolean>((acc, [ruleName, rule]) => {
    if (!rule.meta.deprecated) {
      const prefixed = `${prefix}${ruleName}` as keyof typeof all;
      if (allNames.has(prefixed)) {
        if (all[prefixed] !== 'error') {
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

export { checkConfigAll };
