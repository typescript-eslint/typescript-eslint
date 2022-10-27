import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { RulesMeta } from '@site/rulesMeta';

export function useRulesMeta(): RulesMeta {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  if (!customFields) {
    throw new Error('Custom fields not found in config');
  }
  return customFields.rules as RulesMeta;
}
