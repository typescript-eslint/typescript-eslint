import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import type { RulesMeta } from '@site/rulesMeta';

function interpolateCode(text: string): (JSX.Element | string)[] | string {
  const fragments = text.split(/`(.*?)`/);
  if (fragments.length === 1) {
    return text;
  }
  return fragments.map((v, i) => (i % 2 === 0 ? v : <code key={i}>{v}</code>));
}

export default function RulesTable({
  extensionRules,
}: {
  extensionRules?: boolean;
}): JSX.Element {
  const rules = useDocusaurusContext().siteConfig.customFields!
    .rules as RulesMeta;
  const relevantRules = rules.filter(
    r => !!extensionRules === !!r.docs?.extendsBaseRule,
  );
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>✅🔒</th>
          <th>🔧🛠</th>
          <th>💭</th>
        </tr>
      </thead>
      <tbody>
        {relevantRules.map(
          rule =>
            rule.docs && (
              <tr key={rule.name}>
                <td>
                  <Link to={rule.docs.url}>
                    <code>@typescript-eslint/{rule.name}</code>
                  </Link>
                </td>
                <td>{interpolateCode(rule.docs.description)}</td>
                <td>
                  {rule.docs.recommended === 'strict'
                    ? '🔒'
                    : rule.docs.recommended
                    ? '✅'
                    : ''}
                </td>
                <td>
                  {rule.fixable ? '🔧' : ''}
                  {rule.hasSuggestions ? '🛠' : ''}
                </td>
                <td>{rule.docs.requiresTypeChecking ? '💭' : ''}</td>
              </tr>
            ),
        )}
      </tbody>
    </table>
  );
}
