import React from 'react';

export interface BaseRuleReferenceProps {
  baseRule: string;
}

export function BaseRuleReference({
  baseRule,
}: BaseRuleReferenceProps): React.ReactNode {
  const href = `https://github.com/eslint/eslint/blob/main/docs/src/rules/${baseRule}.md`;

  return (
    <sup>
      Taken with ❤️ from <a href={href}>ESLint core</a>.
    </sup>
  );
}
