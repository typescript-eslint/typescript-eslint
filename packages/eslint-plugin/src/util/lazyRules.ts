import type { ESLintPluginRuleModule } from '../../rules';

type Loader = () => { default: ESLintPluginRuleModule };

export function lazyRules<T extends Record<string, Loader>>(
  loaders: T,
): Record<keyof T, ESLintPluginRuleModule> {
  const rules = {} as Record<keyof T, ESLintPluginRuleModule>;

  for (const [name, load] of Object.entries(loaders)) {
    let rule: ESLintPluginRuleModule | undefined;

    Object.defineProperty(rules, name, {
      enumerable: true,
      get: () => {
        rule ??= load().default;

        return rule;
      },
    });
  }

  return rules;
}
