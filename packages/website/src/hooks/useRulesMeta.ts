import type { RulesMeta } from '@site/rulesMeta';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function useRulesMeta(): RulesMeta {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  if (!customFields) {
    throw new Error('Custom fields not found in config');
  }
  return customFields.rules as RulesMeta;
}
