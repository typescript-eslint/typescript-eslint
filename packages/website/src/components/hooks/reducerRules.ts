import type { RulesRecord, RuleEntry } from '@typescript-eslint/website-eslint';

export interface RuleModel {
  name: string;
  isEnabled: boolean;
  isCustom: boolean;
  value: RuleEntry;
}

function isRecord(data: unknown): data is Record<string, unknown> {
  return Boolean(data && typeof data === 'object');
}

function mapRecords(rules: RulesRecord): RuleModel[] {
  return Object.entries(rules).map<RuleModel>(item => {
    const value = item[1]!;
    return {
      name: item[0],
      isEnabled:
        value !== 0 &&
        value !== 'off' &&
        !(Array.isArray(value) && (value[0] === 'off' || value[0] === 0)),
      isCustom: value === 1 || (Array.isArray(value) && value.length > 1),
      value: value,
    };
  });
}

function reducerRules(
  state: RuleModel[],
  action:
    | { type: 'init'; rules?: RulesRecord; ruleOptions?: string[] }
    | { type: 'toggle'; checked: boolean; name: string }
    | { type: 'json'; code: string; ruleOptions?: string[] },
): RuleModel[] {
  switch (action.type) {
    case 'init':
      return mapRecords({
        ...(action.ruleOptions ?? []).reduce<RulesRecord>((acc, item) => {
          acc[item] = 0;
          return acc;
        }, {}),
        ...(action.rules ?? {}),
      }).sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    case 'toggle':
      return state.map(item => {
        if (item.name === action.name) {
          item.isEnabled = action.checked;
          item.isCustom = false;
        }
        return item;
      });
    case 'json': {
      try {
        const data: unknown = JSON.parse(action.code);
        if (isRecord(data) && 'rules' in data && isRecord(data.rules)) {
          return reducerRules(state, {
            type: 'init',
            // @ts-expect-error: unsafe code
            rules: data.rules,
            ruleOptions: action.ruleOptions,
          });
        }
      } catch {
        console.error('ERROR parsing json');
      }
    }
  }
  throw new Error();
}

export default reducerRules;
