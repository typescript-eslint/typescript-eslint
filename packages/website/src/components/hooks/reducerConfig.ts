import type { RuleModel } from './reducerRules';
import type { RulesRecord } from '../types';

export function buildRulesRecord(
  rules: RuleModel[],
  short = true,
): RulesRecord {
  const ruleError = short ? 2 : 'error';
  const ruleOff = short ? 0 : 'off';
  return rules
    .filter(item => item.isEnabled || item.isCustom)
    .reduce((acc, item) => {
      acc[item.name] = item.isCustom
        ? item.value
        : item.isEnabled
        ? ruleError
        : ruleOff;
      return acc;
    }, {});
}

function reducerConfig(_state: string, action: string | RuleModel[]): string {
  if (typeof action === 'string') {
    return action;
  } else if (action && typeof action === 'object') {
    return JSON.stringify(
      {
        rules: buildRulesRecord(action, false),
      },
      null,
      2,
    );
  }
  throw new Error();
}

export default reducerConfig;
